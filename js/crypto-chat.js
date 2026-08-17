/* =============================================
   MUNDO ROMIX — crypto-chat.js
   Cifrado E2E de mensajes con Web Crypto API
   AES-256-GCM + PBKDF2 para derivar la clave
   ============================================= */

const CRYPTO_SALT = 'MundoRomix-Salt-2024-Guti-Fabi';

/**
 * Deriva una clave AES-256-GCM a partir de una frase secreta compartida.
 */
async function derivarClave(frase) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(frase), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(CRYPTO_SALT), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Cifra un texto plano y devuelve Base64 (IV de 12 bytes + datos cifrados).
 */
async function cifrarMensaje(texto, clave) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, clave, enc.encode(texto));
  const combined = new Uint8Array(iv.byteLength + cifrado.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cifrado), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Descifra un Base64 y devuelve el texto plano.
 * Si falla (mensaje sin cifrar o clave incorrecta), devuelve el original.
 */
async function descifrarMensaje(base64, clave) {
  try {
    const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const datos = combined.slice(12);
    const descifrado = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, clave, datos);
    return new TextDecoder().decode(descifrado);
  } catch {
    return '[🔒 Mensaje cifrado — ingresa la clave correcta]';
  }
}

/**
 * Inicializa la clave desde una frase secreta y la guarda en memoria de sesión.
 */
async function inicializarClave(frase) {
  const clave = await derivarClave(frase);
  window._mrCryptoKey = clave;
  sessionStorage.setItem('mr_cifrado_activo', '1');
  return clave;
}

/** Indica si el cifrado está activo en esta sesión */
function cifradoActivo() {
  return !!window._mrCryptoKey;
}

// Exponer globalmente
window.cifrarMensaje    = cifrarMensaje;
window.descifrarMensaje = descifrarMensaje;
window.inicializarClave = inicializarClave;
window.cifradoActivo    = cifradoActivo;
