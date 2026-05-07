// Cliente de prueba para simular la petición desde el frontend
import { AuditAnswers } from "./domain/entities/Audit.js";

async function runTest() {
  const url = "http://localhost:3000/api/audit";
  
  const payload: AuditAnswers = {
    business: "Agencia de Marketing Digital B2B",
    leads_per_month: 8,
    crm: "No",
    automation: "No",
    follow_up_time: "Más de 24h",
    main_problem: "No logro cerrar ventas a pesar de tener reuniones"
  };

  console.log("Enviando petición a la API...");
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Respuesta del servidor:");
    console.dir(data, { depth: null, colors: true });

  } catch (error) {
    console.error("Error al conectar con la API:", error);
  }
}

runTest();
