# 🤖 Adeptos AI — Agente Auditor Estratégico

Agente conversacional de auditoría empresarial que usa IA para hacer 10 preguntas estratégicas, calcular un score de madurez digital, y generar un informe premium en PDF con diagnóstico, fugas de leads, impacto financiero y roadmap de 90 días.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter (Claude Sonnet) · Puppeteer · Clean Architecture

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/agente-auditoria.git
cd agente-auditoria
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` y pega tu clave de [OpenRouter](https://openrouter.ai/keys):
```env
OPENROUTER_API_KEY=sk-or-tu-clave-aqui
```

---

## 💬 Correr el Bot en la Terminal

Este es el modo principal para probar el agente de forma conversacional:

```bash
npm run bot
```

El agente te hará **10 preguntas estratégicas** sobre tu negocio, una por una. Al terminar, automáticamente:

1. ✅ Calcula tu **Score de Madurez Digital** (0–100)
2. ✅ Envía las respuestas a **Claude Sonnet** vía OpenRouter
3. ✅ Genera un **informe HTML premium** con diagnóstico completo
4. ✅ Convierte el HTML a un **PDF** en la carpeta `/reports`

El PDF quedará en:
```
reports/report_<timestamp>.pdf
```

---

## 🌐 Correr el Servidor API (Fastify)

Para exponer el agente como API REST:

```bash
npm run dev
```

El servidor corre en `http://localhost:3000`.

### Endpoint: `POST /api/audit`

**Body (JSON):**
```json
{
  "business_name": "Mi Empresa",
  "business_description": "Vendemos software B2B",
  "industry": "SaaS",
  "team_size": "5 personas",
  "biggest_pain": "Seguimiento manual de leads",
  "hours_wasted": "15 horas/semana",
  "losing_clients_where": "En el primer contacto",
  "escaped_opportunities": "Leads que no vuelven a responder",
  "admin_vs_revenue_ratio": "70% admin, 30% ventas",
  "tools_used": "Gmail, WhatsApp, Excel",
  "tools_integrated": "No, todo es manual",
  "lead_to_client_process": "Lead entra → llamada → propuesta → cierre (2 semanas)",
  "process_friction_points": "La propuesta tarda 3 días en enviarse",
  "previous_ai_attempts": "Ninguno",
  "success_vision": "Tener el proceso automatizado y cerrar el doble de clientes",
  "time_investment": "En ventas y estrategia de producto",
  "decision_makers": "Solo yo",
  "implementation_timeline": "Este mes"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "score": 45,
    "pdfPath": "C:\\...\\reports\\report_123456789.pdf"
  }
}
```

---

## 🗂️ Estructura del Proyecto

```
src/
├── domain/                        # Lógica de negocio pura
│   ├── entities/Audit.ts          # Tipos e interfaces
│   └── interfaces/Services.ts    # Contratos (interfaces)
│
├── application/
│   └── use-cases/
│       └── ProcessAuditUseCase.ts # Orquestador principal
│
├── infrastructure/
│   ├── services/
│   │   ├── BasicScoringService.ts  # Calcula el score
│   │   ├── OpenRouterService.ts    # Genera el informe con Claude
│   │   └── PuppeteerPdfService.ts  # Convierte HTML a PDF
│   └── http/
│       ├── server.ts               # Servidor Fastify + DI
│       ├── controllers/            # Controladores HTTP
│       └── routes/                 # Rutas de la API
│
├── tools/
│   └── salesIntelligence.ts        # Psicología de ventas + Frameworks
│
├── cli-bot.ts                      # 💬 Chatbot de terminal
└── test-client.ts                  # Cliente de prueba de la API
```

---

## 🧠 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run bot` | Inicia el chatbot conversacional en la terminal |
| `npm run dev` | Levanta el servidor Fastify en modo desarrollo |
| `npm run test-client` | Envía una petición de prueba al servidor |
| `npm run build` | Compila TypeScript a JavaScript |

---

## 🔑 Modelos usados

| Uso | Modelo | Razón |
|-----|--------|-------|
| Chat conversacional | `openai/gpt-4o-mini` | Rápido y económico para el diálogo |
| Generación del informe | `anthropic/claude-sonnet-4-5` | Profundo y analítico para reportes largos |

Ambos accedidos vía **[OpenRouter](https://openrouter.ai)** con una sola API key.

---

## 📄 Licencia

MIT
