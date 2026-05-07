import { FastifyRequest, FastifyReply } from 'fastify';
import { ProcessAuditUseCase } from '../../../application/use-cases/ProcessAuditUseCase.js';
import { AuditAnswers } from '../../../domain/entities/Audit.js';

export class AuditController {
  constructor(private processAuditUseCase: ProcessAuditUseCase) {}

  async processAudit(request: FastifyRequest, reply: FastifyReply) {
    try {
      const answers = request.body as AuditAnswers;
      
      // Basic validation
      if (!answers || !answers.business) {
        return reply.status(400).send({ error: 'Faltan respuestas de la auditoría' });
      }

      const result = await this.processAuditUseCase.execute(answers);

      return reply.send({
        success: true,
        message: 'Auditoría procesada y PDF generado exitosamente',
        data: {
          score: result.score,
          pdfPath: result.pdfPath
        }
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Ocurrió un error al procesar la auditoría',
        details: error.message
      });
    }
  }
}
