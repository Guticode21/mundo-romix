// ==========================================
// MUNDO ROMIX — CONFIGURACIÓN DE FIREBASE
// Conexión con Firebase Realtime Database
// ==========================================

// Configuración de Firebase (proporcionada por el usuario)
const firebaseConfig = {
  apiKey: "AIzaSyCoe0_wExK38b_93gTuZe_NrgMm_1QJV7o",
  authDomain: "mundo-romix-d0b11.firebaseapp.com",
  projectId: "mundo-romix-d0b11",
  storageBucket: "mundo-romix-d0b11.firebasestorage.app",
  messagingSenderId: "475554294022",
  appId: "1:475554294022:web:cc001f3ef5718ca7aa1687",
  databaseURL: "https://mundo-romix-d0b11-default-rtdb.firebaseio.com" // URL de Realtime Database por defecto
};

// Inicializar Firebase (usando la versión compatible que se carga globalmente)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Obtener referencia a la base de datos de tiempo real
const db = firebase.database();

// Hacer la referencia db accesible globalmente, ya que dashboard.html y admin.html la usan directamente
window.db = db;

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
