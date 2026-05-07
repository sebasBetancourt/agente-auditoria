import { AuditAnswers } from "../../domain/entities/Audit.js";
import { IScoringService } from "../../domain/interfaces/Services.js";

export class BasicScoringService implements IScoringService {
  calculateScore(answers: AuditAnswers): number {
    let score = 100;

    // Penalizar si el proceso de cliente a lead está mal definido
    if (answers.lead_to_client_process?.toLowerCase().includes("manual")) score -= 15;
    if (answers.lead_to_client_process?.toLowerCase().includes("no tenemos")) score -= 20;

    // Penalizar si no usan herramientas integradas
    if (answers.tools_integrated?.toLowerCase().includes("manual")) score -= 15;
    if (answers.tools_integrated?.toLowerCase().includes("no")) score -= 15;

    // Penalizar si no hay automatizaciones o IA previa
    if (answers.previous_ai_attempts?.toLowerCase().includes("no")) score -= 10;

    // Penalizar si hay muchas horas perdidas en admin
    if (answers.admin_vs_revenue_ratio?.includes("80") || answers.admin_vs_revenue_ratio?.includes("70")) score -= 15;

    // Penalizar si el timeline es indefinido
    if (answers.implementation_timeline?.toLowerCase().includes("no sé") ||
        answers.implementation_timeline?.toLowerCase().includes("no tengo")) score -= 10;

    return Math.max(0, Math.min(100, score));
  }
}
