import { AuditAnswers, AuditResult } from "../../domain/entities/Audit.js";
import { IAiService, IPdfService, IScoringService } from "../../domain/interfaces/Services.js";

export class ProcessAuditUseCase {
  constructor(
    private scoringService: IScoringService,
    private aiService: IAiService,
    private pdfService: IPdfService
  ) {}

  async execute(answers: AuditAnswers): Promise<AuditResult> {
    const score = this.scoringService.calculateScore(answers);
    const rawHtml = await this.aiService.generateReport(answers, score);

    const scoreColor = score >= 70 ? "from-green-700 to-green-500" : score >= 40 ? "from-yellow-600 to-orange-500" : "from-red-800 to-red-500";
    const scoreLabel = score >= 70 ? "Negocio digitalizado. Potencial de escalada." : score >= 40 ? "Brecha digital importante. Acción urgente recomendada." : "Alta exposición al riesgo operativo. Acción inmediata requerida.";

    const reportHtml = `
      <div class="rounded-2xl bg-gradient-to-br ${scoreColor} text-white p-8 mb-10 text-center shadow-xl">
        <p class="text-sm font-semibold uppercase tracking-widest opacity-80 mb-1">Score de Madurez Digital</p>
        <p class="text-8xl font-black my-2">${score}</p>
        <p class="text-2xl font-light opacity-90">/ 100</p>
        <p class="mt-4 text-base font-medium bg-white bg-opacity-20 rounded-lg px-4 py-2 inline-block">${scoreLabel}</p>
      </div>
      ${rawHtml}
    `;

    const filename = `report_${Date.now()}.pdf`;
    const pdfPath = await this.pdfService.generatePdf(reportHtml, filename);

    return { score, reportHtml, pdfPath };
  }
}
