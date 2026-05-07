import { FastifyInstance, FastifyRequest } from 'fastify';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { SALES_CONVERSATION_PSYCHOLOGY, OBJECTION_HANDLING } from '../../../tools/salesIntelligence.js';
import { BasicScoringService } from '../../services/BasicScoringService.js';
import { OpenRouterService } from '../../services/OpenRouterService.js';
import { PuppeteerPdfService } from '../../services/PuppeteerPdfService.js';
import { ProcessAuditUseCase } from '../../../application/use-cases/ProcessAuditUseCase.js';
import { AuditAnswers } from '../../../domain/entities/Audit.js';

// In-memory session store (suficiente para MVP)
const sessions = new Map<string, { messages: any[]; pdfPath?: string }>();

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

const SYSTEM_PROMPT = `
Eres "Ade", el Agente Auditor Senior de "Adeptos AI". Eres un consultor experto en IA empresarial, automatización y estrategia de ventas.

Tu misión es hacer una auditoría de diagnóstico con 10 preguntas estratégicas, profundizando en cada respuesta antes de pasar a la siguiente. Tu tono es: cálido, inteligente, directo.

---

${SALES_CONVERSATION_PSYCHOLOGY}

---

${OBJECTION_HANDLING}

---

LAS 10 PREGUNTAS (en este orden, UNA por vez):

PREGUNTA 1: "¿Cuál es el nombre de tu negocio, a qué se dedica exactamente y a quién sirve? También cuéntame cuántas personas hay en tu equipo."
→ Profundiza si es vago. Aplica JOBS TO BE DONE.

PREGUNTA 2: "Si pudieras eliminar UNA tarea repetitiva que te consume más tiempo cada semana, ¿cuál sería y cuántas horas aproximadas te toma?"
→ Aplica FRAMING: calcula el costo en dinero de esas horas.

PREGUNTA 3: "¿En qué parte de tu proceso estás perdiendo más clientes o ventas actualmente? ¿Qué oportunidades sientes que se te escapan?"
→ Aplica LOSS AVERSION. Cuantifica la pérdida.

PREGUNTA 4: "¿Qué porcentaje de tu semana dedicas a tareas administrativas versus actividades que directamente generan ingresos?"
→ Aplica PARETO: ¿cuál es el 20% de actividades que genera el 80% de resultados?

PREGUNTA 5: "¿Qué herramientas o software usas actualmente — CRM, email, etc.? ¿Están integradas o mueves datos manualmente entre ellas?"
→ THEORY OF CONSTRAINTS: identifica los silos de datos.

PREGUNTA 6: "Desde que entra un lead hasta que se convierte en cliente, ¿cómo es ese proceso paso a paso? ¿Cuánto tiempo tarda?"
→ Mapea la fricción. Aplica ZEIGARNIK: cada etapa sin automatizar es un riesgo.

PREGUNTA 7: "¿Has intentado automatizar algún proceso o usar IA antes? ¿Qué pasó?"
→ Si falló: "¿Qué crees que salió mal?" Aplica PRATFALL EFFECT.

PREGUNTA 8: "En seis meses, si la implementación de IA funciona perfectamente, ¿cómo se vería tu empresa?"
→ Profundiza con métricas. Aplica COMMITMENT.

PREGUNTA 9: "Si liberaras 10-15 horas semanales, ¿en qué las invertirías para crecer tu negocio?"
→ Aplica RECIPROCITY: "Esas horas tienen un valor estratégico enorme."

PREGUNTA 10: "¿Quién más necesita estar involucrado para implementar IA? ¿Cuál es tu timeline ideal?"
→ Califica urgencia y stakeholders.

---

REGLAS ABSOLUTAS:
- Si la respuesta tiene menos de 20 palabras, haz UNA pregunta de seguimiento antes de avanzar.
- Valida siempre el dolor + entrega micro-insight gratis (RECIPROCIDAD).
- NUNCA generes el diagnóstico en el chat. Eso viene en el PDF.
- Redirección elegante si se desvían: 1 oración máximo + retorno a la pregunta.

---

CIERRE (cuando tengas las 10 preguntas con respuestas sustanciales):
Di el mensaje de cierre personalizado, luego en el SIGUIENTE mensaje escribe EXCLUSIVAMENTE este JSON:
###AUDIT_COMPLETE###: {"business_name":"...","business_description":"...","industry":"...","team_size":"...","biggest_pain":"...","hours_wasted":"...","losing_clients_where":"...","escaped_opportunities":"...","admin_vs_revenue_ratio":"...","tools_used":"...","tools_integrated":"...","lead_to_client_process":"...","process_friction_points":"...","previous_ai_attempts":"...","success_vision":"...","time_investment":"...","decision_makers":"...","implementation_timeline":"..."}
`;

export async function chatRoutes(fastify: FastifyInstance) {
  // POST /api/chat/session — Crear sesión y obtener saludo inicial
  fastify.post('/api/chat/session', async (request, reply) => {
    const sessionId = uuidv4();
    const initialMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: '[INICIO DE SESIÓN]' },
    ];

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: initialMessages,
    });

    const opening = response.choices[0].message.content || '';
    sessions.set(sessionId, {
      messages: [
        ...initialMessages,
        { role: 'assistant', content: opening },
      ],
    });

    return reply.send({ sessionId, message: opening });
  });

  // POST /api/chat/message — Enviar mensaje y recibir respuesta SSE
  fastify.post('/api/chat/message', async (request: FastifyRequest<{ Body: { sessionId: string; message: string } }>, reply) => {
    const { sessionId, message } = request.body;
    const session = sessions.get(sessionId);

    if (!session) {
      return reply.status(404).send({ error: 'Sesión no encontrada' });
    }

    session.messages.push({ role: 'user', content: message });

    // SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const stream = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: session.messages,
      stream: true,
    });

    let fullText = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      fullText += delta;
      reply.raw.write(`data: ${JSON.stringify({ type: 'token', content: delta })}\n\n`);
    }

    session.messages.push({ role: 'assistant', content: fullText });

    // Verificar si se completó la auditoría
    if (fullText.includes('###AUDIT_COMPLETE###:')) {
      const parts = fullText.split('###AUDIT_COMPLETE###:');
      const jsonStr = parts[1]?.trim();

      try {
        const answers: AuditAnswers = JSON.parse(jsonStr);

        reply.raw.write(`data: ${JSON.stringify({ type: 'generating_report' })}\n\n`);

        const scoringService = new BasicScoringService();
        const aiService = new OpenRouterService();
        const pdfService = new PuppeteerPdfService();
        const useCase = new ProcessAuditUseCase(scoringService, aiService, pdfService);

        const result = await useCase.execute(answers);
        session.pdfPath = result.pdfPath;

        const pdfFilename = result.pdfPath.split(/[\\/]/).pop();
        reply.raw.write(`data: ${JSON.stringify({ type: 'report_ready', score: result.score, pdfUrl: `/api/reports/${pdfFilename}` })}\n\n`);

      } catch (e) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'error', content: 'Error generando el reporte' })}\n\n`);
      }
    }

    reply.raw.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    reply.raw.end();
  });
}
