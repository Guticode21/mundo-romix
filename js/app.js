/* =============================================
   MUNDO ROMIX — app.js
   Lógica principal del proyecto
   ============================================= */

// ======= UTILIDADES =======

/** Protege páginas: redirige al login si no hay sesión */
function protegerPagina(rolEsperado) {
  const usuario = localStorage.getItem('mr_usuario');
  if (!usuario) {
    window.location.href = 'index.html';
    return null;
  }
  if (rolEsperado && usuario !== rolEsperado) {
    window.location.href = 'index.html';
    return null;
  }
  return usuario;
}

/** Cierra sesión */
function cerrarSesion() {
  localStorage.removeItem('mr_usuario');
  window.location.href = 'index.html';
}

// ======= CONTADOR EN TIEMPO REAL =======

/**
 * Inicia un contador que muestra el tiempo transcurrido
 * desde la fecha indicada. Se actualiza cada segundo.
 * @param {string} idElemento - ID del elemento donde se renderiza
 * @param {Date} fechaInicio  - Fecha de inicio de la relación
 */
function iniciarContador(idElemento, fechaInicio) {
  const el = document.getElementById(idElemento);
  if (!el) return;

  function actualizar() {
    const ahora = new Date();
    let diff = ahora - fechaInicio; // milisegundos

    if (diff < 0) diff = 0;

    const dias  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins  = Math.floor((diff / (1000 * 60)) % 60);
    const segs  = Math.floor((diff / 1000) % 60);

    el.innerHTML =
      `<span>${dias} días</span> <span>${horas}h</span> <span>${mins}m</span> <span>${segs}s</span>`;
  }

  actualizar();
  setInterval(actualizar, 1000);
}


// ======= SISTEMA DE MENSAJES =======

// MENSAJES_ALEATORIOS se carga desde js/mensajes.js (365+ mensajes)
// Asegúrate de incluir <script src="js/mensajes.js"></script> antes de app.js

const MENSAJE_ANIVERSARIO =
  "🎉💖 ¡Feliz Aniversario, mi amor! 💖🎉\n\nHoy celebramos un año más de esta historia tan bonita que escribimos juntos. Cada momento contigo vale más que todo el oro del mundo. Gracias por ser mi compañera, mi confidente y mi mejor amiga. ¡Te amo con toda mi alma!";

const MENSAJE_DIA_UNO =
  "🌹 ¡Primer día del mes, mi amor! 🌹\n\nOtro mes más juntos, otra oportunidad para demostrarte cuánto te amo. Cada primer día es un recordatorio de que nuestro amor se renueva y se hace más fuerte. ¡Gracias por estar siempre ahí!";

/**
 * Devuelve el mensaje del día según la fecha actual.
 * Prioridad: localStorage → Aniversario → Día 1 → Aleatorio
 */
function obtenerMensajeDelDia() {
  const hoy = new Date();
  const dia = hoy.getDate();
  const mes = hoy.getMonth(); // 0-indexado (enero = 0)

  // 1. Mensaje personalizado guardado por el admin
  const msgAdmin = localStorage.getItem('mr_mensaje_admin');
  if (msgAdmin && msgAdmin.trim() !== '') {
    return { tipo: 'admin', texto: msgAdmin };
  }

  // 2. Aniversario: 11 de mayo (mes 4)
  if (dia === 11 && mes === 4) {
    return { tipo: 'aniversario', texto: MENSAJE_ANIVERSARIO };
  }

  // 3. Primer día del mes
  if (dia === 1) {
    return { tipo: 'mensual', texto: MENSAJE_DIA_UNO };
  }

  // 4. Mensaje aleatorio
  const indice = Math.floor(Math.random() * MENSAJES_ALEATORIOS.length);
  return { tipo: 'diario', texto: MENSAJES_ALEATORIOS[indice] };
}


// ======= MODAL SYSTEM =======

function abrirModal(idModal) {
  const overlay = document.getElementById(idModal);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function cerrarModal(idModal) {
  const overlay = document.getElementById(idModal);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Cerrar modal tocando el overlay
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});


// ======= ADMIN: Guardar configuración =======

function guardarConfigAdmin() {
  const pdfNombre   = document.getElementById('adminPdf')?.value.trim() || '';
  const msgPersonal = document.getElementById('adminMensaje')?.value.trim() || '';

  if (pdfNombre) {
    localStorage.setItem('mr_pdf_hitos', pdfNombre);
  }

  localStorage.setItem('mr_mensaje_admin', msgPersonal);

  mostrarAlertaAdmin('✅ ¡Configuración guardada correctamente!');
}

function limpiarMensajeAdmin() {
  localStorage.removeItem('mr_mensaje_admin');
  const campo = document.getElementById('adminMensaje');
  if (campo) campo.value = '';
  mostrarAlertaAdmin('🧹 Mensaje personalizado eliminado. Fabi verá mensajes aleatorios.');
}

function mostrarAlertaAdmin(texto) {
  const el = document.getElementById('adminAlerta');
  if (!el) return;
  el.textContent = texto;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}


// ======= DASHBOARD: Renderizar secciones =======

function renderizarDashboard() {
  // Mensaje diario
  const msgEl = document.getElementById('msgTexto');
  const msgTag = document.getElementById('msgTag');
  if (msgEl) {
    const msg = obtenerMensajeDelDia();
    msgEl.textContent = msg.texto;

    if (msgTag) {
      const etiquetas = {
        admin: '💌 Mensaje de Guti',
        aniversario: '🎉 ¡Feliz Aniversario!',
        mensual: '🌹 Día especial',
        diario: '💝 Mensaje del día'
      };
      msgTag.textContent = etiquetas[msg.tipo] || '💝 Mensaje del día';
    }
  }

  // Nombre del PDF guardado
  const pdfBtn = document.getElementById('btnHitosPdf');
  if (pdfBtn) {
    const pdfNombre = localStorage.getItem('mr_pdf_hitos') || '';
    if (pdfNombre) {
      pdfBtn.setAttribute('data-pdf', pdfNombre);
    }
  }
}

function abrirHitosPdf() {
  const pdfNombre = localStorage.getItem('mr_pdf_hitos');
  if (pdfNombre) {
    window.open(pdfNombre, '_blank');
  } else {
    alert('Guti aún no ha subido el PDF de hitos. 🥺');
  }
}


// ======= GALERÍA: Renderizado dinámico + Lightbox =======

// 📸 ESCRIBE AQUÍ LOS NOMBRES DE TUS FOTOS FIJAS
const FOTOS_PREDEFINIDAS = [
  "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg",
  "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg",
  "21.jpg", "22.jpg", "23.jpg", "24.jpg", "25.jpg", "26.jpg", "27.jpg", "28.jpg", "29.jpg", "30.jpg",
  "31.jpg", "32.jpg", "33.jpg", "34.jpg", "35.jpg", "36.jpg", "37.jpg", "38.jpg", "39.jpg", "40.jpg",
  "41.jpg", "42.jpg", "43.jpg", "44.jpg", "45.jpg", "46.jpg", "47.jpg", "48.jpg", "49.jpg", "50.jpg"
]; 

/**
 * Construye el grid de la galería leyendo los nombres de foto
 * guardados en localStorage O usando las fotos predefinidas.
 */
function renderGaleria() {
  const grid   = document.getElementById('galeriaGrid');
  const hint   = document.getElementById('galeriaHint');
  if (!grid) return;

  // Intentar obtener fotos del administrador (localStorage)
  const fotosStr = localStorage.getItem('mr_galeria_fotos') || '';
  let nombres = fotosStr.split(',').map(s => s.trim()).filter(s => s);

  // SI NO HAY FOTOS EN EL ADMIN, USAR LAS PREDEFINIDAS
  if (nombres.length === 0) {
    nombres = FOTOS_PREDEFINIDAS;
  }

  grid.innerHTML = '';

  if (nombres.length === 0) {
    // Sin fotos: mostrar placeholders decorativos
    for (let i = 0; i < 6; i++) {
      const ph = document.createElement('div');
      ph.className = 'galeria-placeholder';
      ph.innerHTML = '<i class="fa-solid fa-image"></i>';
      grid.appendChild(ph);
    }
    if (hint) hint.style.display = 'block';
    return;
  }

  if (hint) hint.style.display = 'none';

  nombres.forEach((nombre, index) => {
    const img = document.createElement('img');
    img.src   = 'img/' + nombre;
    img.alt   = 'Foto ' + (index + 1);
    img.loading = 'lazy';
    img.style.cursor = 'pointer';

    // Fallback si la imagen no existe
    img.onerror = function () {
      this.parentNode && this.parentNode.replaceChild(crearPlaceholderError(nombre), this);
    };

    img.addEventListener('click', () => abrirImagen(img.src, nombre));
    grid.appendChild(img);
  });
}

function crearPlaceholderError(nombre) {
  const div = document.createElement('div');
  div.className = 'galeria-placeholder';
  div.title = 'No encontrada: ' + nombre;
  div.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
  div.style.color = 'rgba(94,11,21,0.4)';
  return div;
}

function abrirImagen(src, caption) {
  const overlay = document.getElementById('modalGaleria');
  const img     = document.getElementById('lightboxImg');
  const cap     = document.getElementById('lightboxCaption');
  if (overlay && img) {
    img.src = src;
    if (cap) cap.textContent = caption || '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
