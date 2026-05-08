/* =============================================
   MUNDO ROMIX — Telegram Remote Engine (Fixed) 🤖
   ============================================= */

// Token limpio sin espacios
const _T = "ODczMzM0NzIyMDpBQUVhSXBvenJTZ3dnNjVfYjM2MFpudHFhdzVZaXZPR3V6Zw==";
const TG_TOKEN = atob(_T).trim(); // .trim() elimina cualquier espacio invisible
const CHAT_ID = "1603507898";

/**
 * Obtener el último mensaje del bot de Telegram
 */
async function obtenerDatosTelegram() {
  try {
    // Usamos una URL limpia
    const url = `https://api.telegram.org/bot${TG_TOKEN}/getUpdates?limit=10&offset=-1`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) {
      return { error: data.description };
    }

    if (data.result && data.result.length > 0) {
      for (let i = data.result.length - 1; i >= 0; i--) {
        const update = data.result[i];
        const msg = update.message || update.edited_message;
        
        if (msg && msg.chat.id.toString() === CHAT_ID) {
          return {
            texto: msg.text || "",
            fecha: msg.date,
            id: msg.message_id
          };
        }
      }
      return { error: "No hay mensajes de tu ID" };
    }
    return { error: "Chat vacío" };
  } catch (error) {
    return { error: "Error de conexión" };
  }
}

async function procesarSincronizacionTelegram() {
  const msgTextoEl = document.getElementById('msgTexto');
  const res = await obtenerDatosTelegram();
  
  if (res.error) {
      if(msgTextoEl && msgTextoEl.textContent.includes('Cargando')) {
          msgTextoEl.textContent = typeof obtenerMensajeDelDia === 'function' ? obtenerMensajeDelDia().texto : "¡Hola, mi amor! 💖";
      }
      return;
  }

  const lastId = localStorage.getItem('mr_last_tg_id');
  if (res.id.toString() !== lastId) {
    localStorage.setItem('mr_last_tg_id', res.id);
    localStorage.setItem('mr_mensaje_admin', res.texto);
    if(msgTextoEl) msgTextoEl.textContent = res.texto;
    
    if ("Notification" in window && Notification.permission === "granted") {
       new Notification("💖 Mundo Romix", { body: "Tienes un mensaje nuevo..." });
    }
  } else {
    if(msgTextoEl && msgTextoEl.textContent.includes('Cargando')) {
        msgTextoEl.textContent = res.texto;
    }
  }
}
