// ==========================================
// MUNDO ROMIX — CONFIGURACIÓN DE FIREBASE
// Conexión con Firebase Realtime Database
// ==========================================

// Configuración de Firebase (proporcionada por el usuario)
const firebaseConfig = {
  apiKey: "AIzaSyBBAJAD0vtOEDjqWayop8XS04FCUsAt39E",
  authDomain: "mundo-romix.firebaseapp.com",
  databaseURL: "https://mundo-romix-default-rtdb.firebaseio.com",
  projectId: "mundo-romix",
  storageBucket: "mundo-romix.firebasestorage.app",
  messagingSenderId: "598469388127",
  appId: "1:598469388127:web:2fc8c0b26c413838f478ea",
  measurementId: "G-332662Q1NN"
};

// Inicializar Firebase (usando la versión compatible que se carga globalmente)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Obtener referencias
const db = firebase.database();
const auth = firebase.auth();

// Hacer las referencias accesibles globalmente
window.db = db;
window.auth = auth;

/**
 * Envía un mensaje al chat en tiempo real en Firebase
 * @param {string} usuario - El remitente del mensaje ('Fabi' o 'Guti')
 * @param {string} texto - El texto del mensaje
 */
window.enviarChat = function(usuario, texto) {
  if (!texto || !texto.trim()) return;
  
  return db.ref('chat').push({
    usuario: usuario,
    texto: texto.trim(),
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }).catch((error) => {
    console.error("Error al enviar mensaje: ", error);
    // Mostrar error visible en el chat
    const container = document.getElementById('chatContainer');
    if (container) {
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'text-align:center; color:#b00020; font-size:0.8rem; padding:8px; background:rgba(255,0,0,0.1); border-radius:8px; margin:5px 0;';
      if (error.code === 'PERMISSION_DENIED') {
        errDiv.textContent = '❌ Sin permiso. Ve a Firebase > Realtime Database > Reglas y pónlas en modo prueba.';
      } else {
        errDiv.textContent = '❌ Error: ' + error.message;
      }
      container.appendChild(errDiv);
      container.scrollTop = container.scrollHeight;
    }
  });
};

/**
 * Actualiza la configuración global en Firebase (Mensaje del día, PDF y fotos)
 * @param {Object} datos - Objeto con mensaje, pdfUrl y fotos
 */
window.actualizarConfig = function(datos) {
  db.ref('config').update({
    mensaje: datos.mensaje || '',
    pdfUrl: datos.pdfUrl || '',
    fotos: datos.fotos || ''
  }).catch((error) => {
    console.error("Error al actualizar la configuración: ", error);
  });
};
