/* =============================================
   MUNDO ROMIX — Service Worker
   Maneja caché offline y notificaciones diarias
   ============================================= */

const CACHE_NAME = 'mundo-romix-v1.4';
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './dashboard.html',
  './admin.html',
  './css/estilos.css',
  './js/app.js',
  './js/mensajes.js',
  './js/firebase-config.js',
  './manifest.json',
  './img/logo.png',
  './img/corazon.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

// ======= INSTALACIÓN: guardar archivos en caché =======
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS_CACHE).catch((err) => {
        console.warn('[SW] Algunos archivos externos no se cachearon:', err);
      });
    })
  );
  self.skipWaiting();
});

// ======= ACTIVACIÓN: limpiar cachés viejas =======
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ======= FETCH: responder desde caché cuando sea posible =======
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        // Guardar en caché solo recursos del mismo origen
        if (
          networkResponse.ok &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Sin conexión y sin caché: página de fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ======= NOTIFICACIONES PUSH (desde servidor) =======
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '💖 Mundo Romix';
  const options = {
    body: data.body || 'Tienes un nuevo mensaje de amor 💌',
    icon: './img/icon-192.svg',
    badge: './img/icon-192.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || './dashboard.html' },
    actions: [
      { action: 'abrir', title: '💌 Ver mensaje' },
      { action: 'cerrar', title: 'Ahora no' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ======= NOTIFICACIÓN LOCAL PROGRAMADA =======
// Se activa cuando la página envía un mensaje al SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.tipo === 'notificar_ahora') {
    const { titulo, cuerpo } = event.data;
    self.registration.showNotification(titulo || '💖 Mundo Romix', {
      body: cuerpo || 'Tu mensaje de amor del día te espera 💌',
      icon: './img/icon-192.svg',
      badge: './img/icon-192.svg',
      vibrate: [200, 100, 200],
      data: { url: './dashboard.html' }
    });
  }
});

// ======= CLIC EN NOTIFICACIÓN =======
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlDestino = event.notification.data?.url || './dashboard.html';

  if (event.action === 'cerrar') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlDestino);
      }
    })
  );
});
