# 🤖 Adeptos AI — Agente Auditor Estratégico

Agente conversacional de auditoría empresarial. Hace 10 preguntas estratégicas, calcula un score de madurez digital, y genera un informe premium en PDF con diagnóstico, fugas de leads, impacto financiero y roadmap de 90 días.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter (Claude Sonnet + GPT-4o-mini) · Puppeteer · pnpm · Docker

---

## 🐳 Deploy en servidor (Docker)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/agente-auditoria.git
cd agente-auditoria

# 2. Configurar variables de entorno
cp .env.example .env
nano .env   # → pega tu OPENROUTER_API_KEY

# 3. Levantar
docker compose up -d --build

# 4. Ver logs
docker compose logs -f adeptos-audit
```

La API queda corriendo en `http://tu-servidor:8012`

---

## 🔌 Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check del servicio |
| `POST` | `/api/audit` | Procesar auditoría directa (JSON completo) |
| `POST` | `/api/chat/session` | Crear sesión de chat y obtener saludo |
| `POST` | `/api/chat/message` | Enviar mensaje → respuesta SSE streaming |
| `GET` | `/api/reports/:filename` | Descargar PDF generado |

### POST `/api/chat/session`
Inicia una sesión conversacional. Retorna el `sessionId` y el primer mensaje del agente.

```bash
curl -X POST http://localhost:8012/api/chat/session
# → { "sessionId": "uuid", "message": "Hola 👋..." }
```

### POST `/api/chat/message`
Envía un mensaje. Responde en **SSE streaming** con tokens en tiempo real.

```bash
curl -X POST http://localhost:8012/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{ "sessionId": "uuid-aqui", "message": "Mi empresa vende software B2B" }'
```

Eventos SSE que retorna:
- `{ type: "token", content: "..." }` — token de texto en tiempo real
- `{ type: "generating_report" }` — señal que se inició el PDF
- `{ type: "report_ready", score: 45, pdfUrl: "/api/reports/report_xxx.pdf" }` — PDF listo
- `{ type: "done" }` — fin del stream

### POST `/api/audit` (modo directo, sin chat)
```json
{
  "business_name": "Mi Empresa",
  "business_description": "Software B2B para inmobiliarias",
  "industry": "PropTech",
  "team_size": "8 personas",
  "biggest_pain": "Seguimiento manual de leads",
  "hours_wasted": "15h/semana",
  "losing_clients_where": "En el primer contacto",
  "escaped_opportunities": "Leads fríos que no regresan",
  "admin_vs_revenue_ratio": "70% admin, 30% ventas",
  "tools_used": "Gmail, WhatsApp, Excel",
  "tools_integrated": "No, todo manual",
  "lead_to_client_process": "Lead → llamada → propuesta → cierre (2 semanas)",
  "process_friction_points": "La propuesta tarda 3 días",
  "previous_ai_attempts": "Ninguno",
  "success_vision": "Proceso automatizado, doble de cierres",
  "time_investment": "Ventas y estrategia",
  "decision_makers": "Solo yo",
  "implementation_timeline": "Este mes"
}
```

---

## 💻 Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Desarrollo con hot-reload (API)
pnpm dev

# Chatbot en terminal
pnpm bot

# Build producción
pnpm build
```

---

## 🗂️ Estructura del Proyecto (Clean Architecture)

```
src/
├── domain/                        # Lógica de negocio pura
│   ├── entities/Audit.ts          # Tipos e interfaces
│   └── interfaces/Services.ts    # Contratos
│
├── application/
│   └── use-cases/
│       └── ProcessAuditUseCase.ts # Orquestador
│
├── infrastructure/
│   ├── services/
│   │   ├── BasicScoringService.ts  # Calcula el score
│   │   ├── OpenRouterService.ts    # Genera el informe (Claude)
│   │   └── PuppeteerPdfService.ts  # HTML → PDF
│   └── http/
│       ├── server.ts               # Fastify + DI
│       ├── controllers/
│       └── routes/
│           ├── auditRoutes.ts      # POST /api/audit
│           ├── chatRoutes.ts       # /api/chat/*  (SSE)
│           └── reportRoutes.ts     # GET /api/reports/:filename
│
├── tools/
│   └── salesIntelligence.ts        # Psicología de ventas + Frameworks
│
└── cli-bot.ts                      # Chatbot de terminal (testing)
```

---

## 🔑 Modelos

| Uso | Modelo | Razón |
|-----|--------|-------|
| Chat conversacional | `openai/gpt-4o-mini` | Rápido para diálogo |
| Generación del informe | `anthropic/claude-sonnet-4-5` | Profundo para análisis |

Ambos via **[OpenRouter](https://openrouter.ai)** con una sola API key.

---

## 📄 Licencia

MIT
