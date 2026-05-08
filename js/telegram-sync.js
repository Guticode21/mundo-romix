/* =============================================
   MUNDO ROMIX — Telegram Remote Engine (Total Fix) 🤖
   ============================================= */

// No guardamos el token aquí para evitar que GitHub lo borre.
const TG_TOKEN = localStorage.getItem('mr_tg_token') || "";
const CHAT_ID = "1603507898";

async function obtenerDatosTelegram() {
  try {
    const url = `https://api.telegram.org/bot${TG_TOKEN}/getUpdates?limit=5&offset=-1`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) return { error: data.description };

    if (data.result && data.result.length > 0) {
      for (let i = data.result.length - 1; i >= 0; i--) {
        const update = data.result[i];
        const msg = update.message || update.edited_message;
        if (msg && msg.chat.id.toString() === CHAT_ID) {
          return { texto: msg.text || "", id: msg.message_id };
        }
      }
    }
    return { error: "Sin mensajes" };
  } catch (error) {
    return { error: "Error de red" };
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
  } else {
    if(msgTextoEl && msgTextoEl.textContent.includes('Cargando')) {
        msgTextoEl.textContent = res.texto;
    }
  }
}
