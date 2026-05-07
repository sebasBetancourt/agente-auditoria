import { FastifyInstance, FastifyRequest } from 'fastify';
import fs from 'fs';
import path from 'path';

export async function reportRoutes(fastify: FastifyInstance) {
  // GET /api/reports/:filename — Descargar PDF generado
  fastify.get('/api/reports/:filename', async (request: FastifyRequest<{ Params: { filename: string } }>, reply) => {
    const { filename } = request.params;
    // Sanitize filename to prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'reports', safeFilename);

    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ error: 'Reporte no encontrado' });
    }

    const fileStream = fs.createReadStream(filePath);
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${safeFilename}"`)
      .send(fileStream);
  });
}
