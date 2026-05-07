/* =============================================
   MUNDO ROMIX — Firebase Connection
   ============================================= */

import { initializeApp } from "https://www.gstatic.com/firebase-apps/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBAJAD0vtOEDjqWayop8XS04FCUsAt39E",
  authDomain: "mundo-romix.firebaseapp.com",
  projectId: "mundo-romix",
  storageBucket: "mundo-romix.firebasestorage.app",
  messagingSenderId: "598469388127",
  appId: "1:598469388127:web:2fc8c0b26c413838f478ea",
  measurementId: "G-332662Q1NN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, doc, setDoc, getDoc, onSnapshot, ref, uploadBytes, getDownloadURL, listAll };
