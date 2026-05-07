import { FastifyInstance } from 'fastify';
import { AuditController } from '../controllers/AuditController.js';

export async function auditRoutes(fastify: FastifyInstance, controller: AuditController) {
  fastify.post('/api/audit', async (request, reply) => {
    return controller.processAudit(request, reply);
  });
}
