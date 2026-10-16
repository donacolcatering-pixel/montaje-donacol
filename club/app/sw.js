// Club Doña Col: la web instalada funciona sin conexión con lo último que se cargó.
// Siempre intenta la red primero (así cada versión nueva llega sola) y, si no hay conexión, usa la copia guardada.
const VERSION = "club-2.2";
const BASE = ["./", "index.html", "club.css", "club.js", "club-datos.js", "negocio.js", "almacen-local.js", "almacen-firebase.js", "carta.json",
  "vendor/qrcode.js", "vendor/firebase-app-compat.js", "vendor/firebase-auth-compat.js", "vendor/firebase-firestore-compat.js",
  "fonts/hanken.woff2", "fonts/bodoni.woff2", "media/logo.png", "media/logo-marron.png", "media/icono-192.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;          // Firebase, Cloudinary, WhatsApp: siempre por la red
  e.respondWith(fetch(r).then(res => {
    if (res.ok && res.type === "basic") { const copia = res.clone(); caches.open(VERSION).then(c => c.put(r, copia)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || (r.mode === "navigate" ? caches.match("index.html") : undefined))));
});
