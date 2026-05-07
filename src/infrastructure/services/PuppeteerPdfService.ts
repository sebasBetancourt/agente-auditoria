import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { IPdfService } from "../../domain/interfaces/Services.js";

export class PuppeteerPdfService implements IPdfService {
  private readonly reportsDir = path.join(process.cwd(), "reports");

  constructor() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generatePdf(htmlContent: string, filename: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
      const page = await browser.newPage();
      const outputPath = path.join(this.reportsDir, filename);

      const fullHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Diagnóstico Empresarial IA</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; padding: 40px; }
            h1 { font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; color: #1e3a8a; }
            h2 { font-size: 1.8rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
            h3 { font-size: 1.3rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
            p { margin-bottom: 1rem; line-height: 1.6; }
            ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
            li { margin-bottom: 0.5rem; }
          </style>
        </head>
        <body>
          <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div class="text-center mb-10">
              <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Adeptos AI</h1>
              <p class="text-xl text-gray-500 mt-2">Auditoría Empresarial Estratégica</p>
            </div>
            ${htmlContent}
          </div>
        </body>
        </html>
      `;

      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
      });

      return outputPath;
    } finally {
      await browser.close();
    }
  }
}
