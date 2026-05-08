/* =============================================
   MUNDO ROMIX — Telegram Remote Engine 🤖
   ============================================= */

// Token cifrado para seguridad
const _T = "ODczMzM0NzIyMDpBQUVhSXBvenJTZ3dnNjVfYjM2MFpudHFhdzVZaXZPR3V6Zw==";
const TG_TOKEN = atob(_T);
const CHAT_ID = "1603507898";

/**
 * Obtener el último mensaje del bot de Telegram
 */
async function obtenerDatosTelegram() {
  try {
    const response = await fetch(`https://api.github.com/api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=-1`);
    // Nota: Usamos un truco de bypass si Telegram está bloqueado, pero primero intentamos directo
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=-1`);
    const data = await res.json();

    if (data.ok && data.result.length > 0) {
      const lastUpdate = data.result[0];
      const msg = lastUpdate.message || lastUpdate.edited_message;
      
      if (msg && msg.chat.id.toString() === CHAT_ID) {
        return {
          texto: msg.text || "",
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
 * Lógica para manejar notificaciones y actualizaciones automáticas
 */
async function procesarSincronizacionTelegram() {
  const datos = await obtenerDatosTelegram();
  if (!datos) return;

  const lastId = localStorage.getItem('mr_last_tg_id');
  
  // Si el mensaje es nuevo (ID diferente)
  if (datos.id.toString() !== lastId) {
    localStorage.setItem('mr_last_tg_id', datos.id);
    localStorage.setItem('mr_mensaje_admin', datos.texto);
    
    // Actualizar la interfaz
    const msgTextoEl = document.getElementById('msgTexto');
    if(msgTextoEl) msgTextoEl.textContent = datos.texto;

    // Lanzar notificación si la app está en segundo plano o cerrada
    if (window.Notification && Notification.permission === "granted") {
       new Notification("💖 Mundo Romix", {
         body: "Guti te ha dejado un nuevo mensaje...",
         icon: "img/logo.png"
       });
    }
  }
}
