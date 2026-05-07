import { AuditAnswers } from "../entities/Audit.js";

export interface IAiService {
  generateReport(answers: AuditAnswers, score: number): Promise<string>;
}

export interface IPdfService {
  generatePdf(htmlContent: string, filename: string): Promise<string>;
}

export interface IScoringService {
  calculateScore(answers: AuditAnswers): number;
}
