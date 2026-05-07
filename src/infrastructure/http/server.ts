import fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { BasicScoringService } from '../services/BasicScoringService.js';
import { OpenRouterService } from '../services/OpenRouterService.js';
import { PuppeteerPdfService } from '../services/PuppeteerPdfService.js';
import { ProcessAuditUseCase } from '../../application/use-cases/ProcessAuditUseCase.js';
import { AuditController } from './controllers/AuditController.js';
import { auditRoutes } from './routes/auditRoutes.js';

const app = fastify({ logger: true });

// 1. Initialize Infrastructure Services
const scoringService = new BasicScoringService();
const aiService = new OpenRouterService();
const pdfService = new PuppeteerPdfService();

// 2. Initialize Application Use Cases
const processAuditUseCase = new ProcessAuditUseCase(
  scoringService,
  aiService,
  pdfService
);

// 3. Initialize Controllers
const auditController = new AuditController(processAuditUseCase);

// 4. Register Routes
app.register((instance, opts, done) => {
  auditRoutes(instance, auditController);
  done();
});

// Start Server
const start = async () => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      app.log.warn('⚠️ OPENROUTER_API_KEY no está configurada en .env');
    }
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Adeptos AI Agent Server corriendo en http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
