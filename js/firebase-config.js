// ==========================================
// MUNDO ROMIX — CONFIGURACIÓN DE FIREBASE
// Seguridad: Firebase Auth + Cifrado E2E
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyBBAJAD0vtOEDjqWayop8XS04FCUsAt39E",
  authDomain: "mundo-romix.firebaseapp.com",
  databaseURL: "https://mundo-romix-default-rtdb.firebaseio.com",
  projectId: "mundo-romix",
  storageBucket: "mundo-romix.firebasestorage.app",
  messagingSenderId: "598469388127",
  appId: "1:598469388127:web:71e7cf067f469a6ef478ea",
  measurementId: "G-J4KQ543RFR"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db   = firebase.database();
const auth = firebase.auth();

window.db   = db;
window.auth = auth;

// =============================================
// SESIÓN SEGURA — Expiración de 7 días
// =============================================

/** Guarda la sesión con timestamp para expiración */
window.guardarSesion = function(nombreUsuario) {
  const sesion = {
    usuario: nombreUsuario,
    timestamp: Date.now()
  };
  localStorage.setItem('mr_sesion', JSON.stringify(sesion));
};

/** Verifica si la sesión es válida (< 7 días) */
window.sesionValida = function() {
  try {
    const raw = localStorage.getItem('mr_sesion');
    if (!raw) return null;
    const sesion = JSON.parse(raw);
    const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - sesion.timestamp > SIETE_DIAS) {
      localStorage.removeItem('mr_sesion');
      localStorage.removeItem('mr_usuario');
      return null;
    }
    // Compatibilidad: si existe sesión vieja sin timestamp, migrar
    return sesion.usuario;
  } catch {
    return localStorage.getItem('mr_usuario') || null;
  }
};

/** Cierra sesión completamente */
window.cerrarSesionCompleta = function() {
  localStorage.removeItem('mr_sesion');
  localStorage.removeItem('mr_usuario');
  sessionStorage.removeItem('mr_cifrado_activo');
  window._mrCryptoKey = null;
  if (auth) auth.signOut().catch(() => {});
  window.location.href = 'index.html';
};

// =============================================
// CHAT CIFRADO — Enviar y limpiar historial
// =============================================

/**
 * Envía un mensaje al chat.
 * Si hay clave de cifrado activa, cifra el mensaje antes de guardarlo.
 */
window.enviarChat = async function(usuario, texto) {
  if (!texto || !texto.trim()) return;

  let contenido = texto.trim();

  // Cifrar si hay clave activa
  if (window.cifradoActivo && window.cifradoActivo() && window._mrCryptoKey) {
    try {
      contenido = await window.cifrarMensaje(contenido, window._mrCryptoKey);
    } catch (e) {
      console.warn('No se pudo cifrar el mensaje, enviando sin cifrar.', e);
    }
  }

  return db.ref('chat').push({
    usuario: usuario,
    texto: contenido,
    cifrado: window.cifradoActivo ? window.cifradoActivo() : false,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }).catch((error) => {
    console.error('Error al enviar mensaje:', error);
    const container = document.getElementById('chatContainer');
    if (container) {
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'text-align:center;color:#b00020;font-size:0.8rem;padding:8px;background:rgba(255,0,0,0.1);border-radius:8px;margin:5px 0;';
      errDiv.textContent = error.code === 'PERMISSION_DENIED'
        ? '❌ Sin permiso. Verifica las reglas de Firebase.'
        : '❌ Error: ' + error.message;
      container.appendChild(errDiv);
      container.scrollTop = container.scrollHeight;
    }
  });
};

// =============================================
// FASE 5 — Limpieza automática de mensajes > 30 días
// =============================================

window.limpiarChatAntiguo = function() {
  const TREINTA_DIAS = 30 * 24 * 60 * 60 * 1000;
  const limite = Date.now() - TREINTA_DIAS;
  db.ref('chat').orderByChild('timestamp').endAt(limite).once('value', snap => {
    if (!snap.exists()) return;
    const updates = {};
    snap.forEach(child => { updates[child.key] = null; });
    db.ref('chat').update(updates)
      .then(() => console.log('Chat: mensajes antiguos eliminados.'))
      .catch(e => console.warn('No se pudo limpiar el chat:', e));
  });
};

// =============================================
// CONFIG — Actualizar datos desde admin
// =============================================

window.actualizarConfig = function(datos) {
  return db.ref('config').update({
    mensaje: datos.mensaje || '',
    pdfUrl:  datos.pdfUrl  || '',
    fotos:   datos.fotos   || ''
  }).catch(e => console.error('Error al actualizar config:', e));
};
