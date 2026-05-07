export interface AuditAnswers {
  // Q1 - Negocio
  business_name: string;
  business_description: string;
  team_size: string;
  industry: string;

  // Q2 - Mayor problema
  biggest_pain: string;
  hours_wasted: string;

  // Q3 - Cuellos de botella
  losing_clients_where: string;
  escaped_opportunities: string;

  // Q4 - Trabajo manual vs estratégico
  admin_vs_revenue_ratio: string;

  // Q5 - Stack tecnológico
  tools_used: string;
  tools_integrated: string;

  // Q6 - Proceso del cliente
  lead_to_client_process: string;
  process_friction_points: string;

  // Q7 - Intentos previos
  previous_ai_attempts: string;

  // Q8 - Visión de éxito
  success_vision: string;

  // Q9 - Valor del tiempo
  time_investment: string;

  // Q10 - Proceso de decisión
  decision_makers: string;
  implementation_timeline: string;
}

export interface AuditResult {
  score: number;
  reportHtml: string;
  pdfPath: string;
}
