/* =============================================
   MUNDO ROMIX — Firebase Core Configuration ⚡
   ============================================= */

// Datos de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBBAJAD0vtOEDjqWayop8XS04FCUsAt39E",
  authDomain: "mundo-romix.firebaseapp.com",
  projectId: "mundo-romix",
  storageBucket: "mundo-romix.firebasestorage.app",
  messagingSenderId: "598469388127",
  appId: "1:598469388127:web:2fc8c0b26c413838f478ea",
  measurementId: "G-332662Q1NN",
  databaseURL: "https://mundo-romix-default-rtdb.firebaseio.com" // URL estándar de Firebase
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/**
 * Función para enviar un mensaje al chat
 */
function enviarChat(usuario, texto) {
  if (!texto.trim()) return;
  db.ref('chat').push({
    usuario: usuario,
    texto: texto,
    fecha: Date.now()
  });
}

/**
 * Función para actualizar la configuración (Solo Guti)
 */
function actualizarConfig(datos) {
  db.ref('config').update(datos);
}
