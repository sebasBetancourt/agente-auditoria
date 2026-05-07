import OpenAI from "openai";
import { AuditAnswers } from "../../domain/entities/Audit.js";
import { IAiService } from "../../domain/interfaces/Services.js";
import { REPORT_FRAMEWORKS } from "../../tools/salesIntelligence.js";

export class OpenRouterService implements IAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || "",
    });
  }

  async generateReport(answers: AuditAnswers, score: number): Promise<string> {
    const prompt = this.buildPrompt(answers, score);

    const response = await this.openai.chat.completions.create({
      model: "anthropic/claude-sonnet-4-5",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      extraHeaders: {
        "HTTP-Referer": "https://adeptos.ai",
        "X-Title": "Adeptos Audit Agent",
      }
    });

    return response.choices[0].message.content || "";
  }

  private buildPrompt(answers: AuditAnswers, score: number): string {
    return `
Eres un consultor senior de automatización e IA empresarial de clase mundial, con experiencia en McKinsey, Hubspot y empresas de tecnología de Silicon Valley.

Has completado una auditoría de diagnóstico con el siguiente negocio:

=== DATOS DEL NEGOCIO ===
Nombre: ${answers.business_name}
Descripción: ${answers.business_description}
Industria: ${answers.industry}
Tamaño del equipo: ${answers.team_size}

=== DIAGNÓSTICO RECABADO ===
Tarea repetitiva que más consume tiempo: ${answers.biggest_pain}
Horas perdidas en esa tarea: ${answers.hours_wasted}

Dónde están perdiendo clientes o ventas: ${answers.losing_clients_where}
Oportunidades que se escapan: ${answers.escaped_opportunities}

% de tiempo en admin vs. actividades de ingreso: ${answers.admin_vs_revenue_ratio}

Herramientas tecnológicas que usan: ${answers.tools_used}
¿Están integradas o mueven datos manualmente?: ${answers.tools_integrated}

Proceso de lead a cliente: ${answers.lead_to_client_process}
Puntos de fricción en el proceso: ${answers.process_friction_points}

Intentos previos con IA o automatización: ${answers.previous_ai_attempts}

Visión de éxito en 6 meses: ${answers.success_vision}

En qué invertiría 10-15h/semana liberadas: ${answers.time_investment}

Tomadores de decisión involucrados: ${answers.decision_makers}
Timeline de implementación: ${answers.implementation_timeline}

=== SCORE DE MADUREZ DIGITAL: ${score}/100 ===

---

${REPORT_FRAMEWORKS}

---

Usando los marcos anteriores como guía estratégica, genera un DIAGNÓSTICO EMPRESARIAL PREMIUM completo en HTML puro.
IMPORTANTE: No incluyas \`\`\`html, ni <html>, ni <head>. Solo el contenido HTML listo para insertar en el body.
Usa etiquetas HTML semánticas: h1, h2, h3, p, ul, li, strong, em, div, table, tr, td, th, span.
Usa clases de TailwindCSS directamente en los elementos (class="...").

NARRATIVA OBLIGATORIA — sigue el framework AIDA:
- ATTENTION: Golpea con el diagnóstico crudo (score + 3 dolores críticos). El dueño debe sentir que lo entendiste.
- INTEREST: Qué está pasando y por qué. Theory of Constraints: identifica el cuello de botella #1.
- DESIRE: Antes vs. Después. ROI real con sus números. Loss Aversion: enmarca lo que PIERDEN por no actuar.
- ACTION: CTA específico, urgente, de baja fricción para agendar con Adeptos AI.

SECCIONES OBLIGATORIAS (11 secciones en este orden):

1. RESUMEN EJECUTIVO — Nombre del negocio, score, 3 problemas críticos. Tono directo y de alto valor.

2. DIAGNÓSTICO GENERAL — Estado actual: madurez digital, procesos, tecnología. El score como termómetro.

3. PROBLEMAS CRÍTICOS DETECTADOS — Lista priorizada de 5-7 problemas con impacto. Aplica Pareto: identifica el 20% que causa el 80% del daño.

4. FUGAS DE LEADS Y DINERO — Aplicar Loss Aversion + cálculo numérico real:
   "Con [X leads/mes] y tiempo de respuesta de [Y horas], estás perdiendo aproximadamente [$Z] mensuales."
   Calcula el costo anual de la inacción.

5. INEFICIENCIAS OPERATIVAS — Mapa de procesos manuales y silos. Theory of Constraints: ¿cuál es el cuello de botella #1?

6. ANÁLISIS DEL STACK TECNOLÓGICO — ¿Están bien usadas sus herramientas? ¿Qué les falta? ¿Dónde están los silos?

7. IMPACTO FINANCIERO PROYECTADO — Tabla antes vs. después: horas ahorradas, costo, leads recuperados, ROI. Usa sus números reales.

8. OPORTUNIDADES DE IA IDENTIFICADAS — 5-8 automatizaciones específicas para ESTE negocio. Jobs to Be Done: ¿qué trabajo específico hace cada una?

9. ROADMAP 90 DÍAS — Plan Pareto (solo las 3 acciones de mayor impacto por fase):
   Semana 1-2: Quick Wins → Mes 1: Fundación → Mes 2: Automatización core → Mes 3: Escala

10. ROI PROYECTADO — Tabla: Inversión vs. Retorno a 3, 6 y 12 meses. Mental Accounting: "menos de $X/mes vs. $Y recuperados".

11. CONCLUSIÓN PERSUASIVA — Cierre de ventas de alto nivel:
    Reitera el dolor principal (Loss Aversion) + urgencia real (cada mes sin esto es dinero perdido) +
    CTA único: "Agenda tu sesión estratégica gratuita de 30 min con Adeptos AI" +
    Personaliza con el nombre del negocio y su visión de éxito.

---
ESTILO VISUAL OBLIGATORIO:
- class="p-6 mb-6 rounded-xl border-l-4 border-red-500 bg-red-50" para PROBLEMAS críticos
- class="p-6 mb-6 rounded-xl border-l-4 border-green-500 bg-green-50" para OPORTUNIDADES
- class="p-6 mb-6 rounded-xl border-l-4 border-blue-600 bg-blue-50" para HIGHLIGHTS
- class="p-6 mb-6 rounded-xl border-l-4 border-yellow-500 bg-yellow-50" para COSTOS DE INACCIÓN
- Tablas financieras con class="w-full border-collapse" y celdas con class="border border-gray-200 p-3 text-center"
- El informe debe sentirse como un entregable de $5,000 USD. Denso en valor, personalizado para ${answers.business_name}.
`;
  }
}
