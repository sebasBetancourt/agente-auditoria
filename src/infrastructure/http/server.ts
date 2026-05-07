import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { BasicScoringService } from '../services/BasicScoringService.js';
import { OpenRouterService } from '../services/OpenRouterService.js';
import { PuppeteerPdfService } from '../services/PuppeteerPdfService.js';
import { ProcessAuditUseCase } from '../../application/use-cases/ProcessAuditUseCase.js';
import { AuditController } from './controllers/AuditController.js';
import { auditRoutes } from './routes/auditRoutes.js';
import { chatRoutes } from './routes/chatRoutes.js';
import { reportRoutes } from './routes/reportRoutes.js';

const app = fastify({ logger: true });

// ── CORS ──────────────────────────────────────────────────────────────────────
await app.register(fastifyCors, { origin: '*' });

// ── Dependency Injection ──────────────────────────────────────────────────────
const scoringService = new BasicScoringService();
const aiService = new OpenRouterService();
const pdfService = new PuppeteerPdfService();
const processAuditUseCase = new ProcessAuditUseCase(scoringService, aiService, pdfService);
const auditController = new AuditController(processAuditUseCase);

// ── Routes ────────────────────────────────────────────────────────────────────
app.register((instance, _opts, done) => {
  auditRoutes(instance, auditController);
  done();
});

app.register(chatRoutes);
app.register(reportRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', service: 'adeptos-audit-agent' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      app.log.warn('⚠️ OPENROUTER_API_KEY no configurada en .env');
    }
    const port = parseInt(process.env.PORT || '3000');
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Adeptos AI Agent API corriendo en http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
