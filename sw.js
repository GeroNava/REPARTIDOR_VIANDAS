// Aumenté la versión a v2.6 para forzar a los teléfonos a actualizar
const CACHE_NAME = 'viandas-reparto-cache-v2.6';

// Eliminada la librería "Sortable.js" ya que ahora usamos los botones
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Instalación: Descarga y guarda todo en el caché local del dispositivo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activación: Elimina rastros de cachés viejos si actualizás la app en el futuro
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// Estrategia de Red: Primero busca en caché. Si no está (o estás conectado y hay cambios), actualiza de internet.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Intenta actualizar el caché en segundo plano de manera silenciosa
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Silenciar fallos de red offline */});
        
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
