/* =============================================
   MUNDO ROMIX — Telegram Remote Engine 🤖
   ============================================= */

const _T = "ODczMzM0NzIyMDpBQUVhSXBvenJTZ3dnNjVfYjM2MFpudHFhdzVZaXZPR3V6Zw==";
const TG_TOKEN = atob(_T);
const CHAT_ID = "1603507898";

/**
 * Obtener el último mensaje del bot de Telegram
 */
async function obtenerDatosTelegram() {
  try {
    // Corregido: Llamada directa a la API de Telegram
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=-1`);
    const data = await res.json();

    if (data.ok && data.result && data.result.length > 0) {
      const lastUpdate = data.result[0];
      const msg = lastUpdate.message || lastUpdate.edited_message;
      
      // Verificamos que el mensaje venga de tu CHAT_ID
      if (msg && msg.chat.id.toString() === CHAT_ID) {
        return {
          texto: msg.text || "¡Te amo! 💖",
          fecha: msg.date,
          id: msg.message_id
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error leyendo Telegram:", error);
    return null;
  }
}

/**
 * Lógica para manejar notificaciones y actualizaciones
 */
async function procesarSincronizacionTelegram() {
  const datos = await obtenerDatosTelegram();
  const msgTextoEl = document.getElementById('msgTexto');
  
  if (!datos) {
      // Si falla, mostramos el mensaje por defecto del día para que no se quede cargando
      if(msgTextoEl && msgTextoEl.textContent.includes('Cargando')) {
          msgTextoEl.textContent = typeof obtenerMensajeDelDia === 'function' ? obtenerMensajeDelDia().texto : "Esperando mensaje... 💖";
      }
      return;
  }

  const lastId = localStorage.getItem('mr_last_tg_id');
  
  if (datos.id.toString() !== lastId) {
    localStorage.setItem('mr_last_tg_id', datos.id);
    localStorage.setItem('mr_mensaje_admin', datos.texto);
    
    if(msgTextoEl) msgTextoEl.textContent = datos.texto;

    // Notificación visual
    if ("Notification" in window && Notification.permission === "granted") {
       new Notification("💖 Mundo Romix", {
         body: "Tienes un nuevo mensaje de Guti...",
         icon: "img/logo.png"
       });
    }
  } else {
    // Si el ID es el mismo, pero sigue saliendo "Cargando", ponemos el texto guardado
    if(msgTextoEl && msgTextoEl.textContent.includes('Cargando')) {
        msgTextoEl.textContent = datos.texto;
    }
  }
}
