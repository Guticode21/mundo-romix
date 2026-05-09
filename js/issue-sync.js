/* =============================================
   MUNDO ROMIX — GitHub Issue Engine 🚀
   (Sin Tokens - 100% Independiente)
   ============================================= */

const REPO_URL = "https://api.github.com/repos/Guticode21/mundo-romix/issues";

/**
 * Obtener datos desde el GitHub Issue público
 */
async function obtenerDatosIssue() {
  try {
    console.log("Conectando con GitHub Issues...");
    const response = await fetch(REPO_URL + "?t=" + Date.now());
    
    if (!response.ok) {
      console.error("Error de GitHub:", response.status);
      return null;
    }

    const issues = await response.json();
    console.log("Issues encontrados:", issues.length);
    
    const issue = issues.find(i => i.title === "DATOS MUNDO ROMIX");
    
    if (!issue) {
      console.error("No se encontró el Issue con título 'DATOS MUNDO ROMIX'. Asegúrate de que el título sea EXACTAMENTE ese (en mayúsculas).");
      return null;
    }

    console.log("¡Datos encontrados!");
    const body = issue.body || "";
    
    // 1. Extraer el mensaje (todo el texto antes del primer enlace o archivo)
    let mensaje = body.split('[')[0].trim();
    
    // 2. Extraer el enlace al PDF (busca el primer link que termine en .pdf)
    const pdfMatch = body.match(/https?:\/\/[^\s)]+\.pdf/i);
    const pdfUrl = pdfMatch ? pdfMatch[0] : null;

    // 3. Extraer fotos (busca todos los enlaces de imágenes ![]() o links directos a imagenes)
    const imgRegex = /https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp)/gi;
    const fotosFound = body.match(imgRegex) || [];

    return {
      mensaje: mensaje,
      pdfUrl: pdfUrl,
      fotos: fotosFound,
      ultimaActualizacion: issue.updated_at
    };
  } catch (error) {
    console.error("Error leyendo GitHub Issues:", error);
    return null;
  }
}

/**
 * Sincronización automática
 */
async function sincronizarConIssue() {
  const datos = await obtenerDatosIssue();
  const msgTextoEl = document.getElementById('msgTexto');
  
  if (datos) {
    // Guardar para uso offline
    localStorage.setItem('mr_mensaje_admin', datos.mensaje);
    if(datos.pdfUrl) localStorage.setItem('mr_pdf_hitos_url', datos.pdfUrl);
    if(datos.fotos.length > 0) localStorage.setItem('mr_fotos_issue', datos.fotos.join(','));

    // Actualizar Mensaje
    if(msgTextoEl) msgTextoEl.textContent = datos.mensaje;

    // Guardar el enlace del PDF para el botón del dashboard
    if(datos.pdfUrl) {
        localStorage.setItem('mr_pdf_hitos_url', datos.pdfUrl);
    }

    // Notificación si hay cambios
    const lastUpdate = localStorage.getItem('mr_last_issue_update');
    if (lastUpdate && lastUpdate !== datos.ultimaActualizacion) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("💖 Mundo Romix", { body: "Guti ha actualizado vuestro mundo..." });
      }
    }
    localStorage.setItem('mr_last_issue_update', datos.ultimaActualizacion);
  }
}
