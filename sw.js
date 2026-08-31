// Service worker: cachea la app para que funcione sin internet
const CACHE = 'montaje-v16';
// eventos.js entra aqui el 2026-08-31: sin el, un movil que INSTALE la app sin
// cobertura se quedaba sin ningun evento hasta tener red. Se sigue pidiendo a la red
// primero (ver el fetch de abajo), esto es solo la copia de respaldo inicial.
const ASSETS = ['./', './index.html', './necesidades.html', './montaje2d.html', './repartos.html',
                './eventos.js', './manifest.json', './repartos-manifest.json',
                './icon.svg', './logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Documentos HTML, la raíz y eventos.js → RED PRIMERO (así los móviles cogen SIEMPRE la
  // última versión de la app y de los datos cuando hay internet), con la caché como
  // respaldo si no hay cobertura. Evita quedarse pegado a una versión vieja (que era la
  // causa del "Missing or insufficient permissions": apps viejas sin login).
  const esDocumento = e.request.mode === 'navigate'
      || url.pathname.endsWith('.html')
      || url.pathname.endsWith('/')
      || url.pathname.endsWith('/eventos.js');
  if (esDocumento) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  // Resto de recursos (iconos, logo, manifest): CACHÉ PRIMERO (rápido y offline).
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
