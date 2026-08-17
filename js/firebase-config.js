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
const storage = firebase.storage();

// Hacer las referencias accesibles globalmente
window.db = db;
window.auth = auth;
window.storage = storage;

/**
 * Envía un mensaje al chat en tiempo real en Firebase
 * @param {string} usuario - El remitente del mensaje ('Fabi' o 'Guti')
 * @param {string} texto - El texto del mensaje
 */
window.enviarChat = function(usuario, texto) {
  if (!texto || !texto.trim()) return;
  
  db.ref('chat').push({
    usuario: usuario,
    texto: texto.trim(),
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }).catch((error) => {
    console.error("Error al enviar mensaje: ", error);
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
