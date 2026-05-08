/* =============================================
   MUNDO ROMIX — Telegram Remote Engine (Debug Mode) 🤖
   ============================================= */

const _T = "ODczMzM0NzIyMDpBQUVhSXBvenJTZ3dnNjVfYjM2MFpudHFhdzVZaXZPR3V6Zw==";
const TG_TOKEN = atob(_T);
const CHAT_ID = "1603507898";

/**
 * Obtener el último mensaje del bot de Telegram
 */
async function obtenerDatosTelegram() {
  try {
    console.log("Intentando conectar con Telegram...");
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?limit=10&offset=-1`);
    const data = await res.json();

    if (!data.ok) {
      console.error("Error en la respuesta de Telegram:", data.description);
      return { error: "Error de API: " + data.description };
    }

    if (data.result && data.result.length > 0) {
      // Buscamos el último mensaje que sea tuyo
      for (let i = data.result.length - 1; i >= 0; i--) {
        const update = data.result[i];
        const msg = update.message || update.edited_message;
        
        if (msg && msg.chat.id.toString() === CHAT_ID) {
          console.log("Mensaje encontrado:", msg.text);
          return {
            texto: msg.text || "",
            fecha: msg.date,
            id: msg.message_id
          };
        }
      }
      return { error: "No se encontró ningún mensaje de tu Chat ID (" + CHAT_ID + "). ¡Escríbele al bot!" };
    }
    
    return { error: "El bot no tiene mensajes nuevos. ¡Escríbele algo!" };
  } catch (error) {
    console.error("Error de conexión:", error);
    return { error: "Error de conexión: No se pudo contactar con Telegram." };
  }
}

/**
 * Lógica para manejar notificaciones y actualizaciones
 */
async function procesarSincronizacionTelegram() {
  const msgTextoEl = document.getElementById('msgTexto');
  const res = await obtenerDatosTelegram();
  
  if (res.error) {
      console.warn(res.error);
      // Si hay error y estamos cargando, mostramos el mensaje por defecto del día
      if(msgTextoEl && msgTextoEl.textContent.includes('Cargando')) {
          msgTextoEl.textContent = typeof obtenerMensajeDelDia === 'function' ? obtenerMensajeDelDia().texto : "Bienvenida, mi amor 💖";
      }
      return;
  }

  const lastId = localStorage.getItem('mr_last_tg_id');
  
  if (res.id.toString() !== lastId) {
    localStorage.setItem('mr_last_tg_id', res.id);
    localStorage.setItem('mr_mensaje_admin', res.texto);
    if(msgTextoEl) msgTextoEl.textContent = res.texto;

    if ("Notification" in window && Notification.permission === "granted") {
       new Notification("💖 Mundo Romix", { body: "Tienes un nuevo mensaje de Guti..." });
    }
  } else {
    if(msgTextoEl && msgTextoEl.textContent.includes('Cargando')) {
        msgTextoEl.textContent = res.texto;
    }
  }
}
