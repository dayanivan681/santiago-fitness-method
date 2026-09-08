/* Sólo shell público. Identidad, revocación, datos y medios siempre pasan por la API. */
const VERSION='sfm-shell-__SFM_BUILD__';
const PRECACHE=['/','/manifest.webmanifest',/*__SFM_ASSETS__*/];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(c=>c.addAll(PRECACHE)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api')||u.pathname.startsWith('/admin')||u.pathname==='/access'||u.pathname==='/salir'||u.pathname.startsWith('/demo'))return;
 const asset=/^\/(assets|ejercicios|fuentes|icons)\//.test(u.pathname)||(u.pathname!=='/'&&PRECACHE.includes(u.pathname));
 if(asset){event.respondWith(caches.open(VERSION).then(async c=>{const cached=await c.match(event.request);if(cached)return cached;const r=await fetch(event.request);if(r.ok&&r.type==='basic')await c.put(event.request,r.clone());return r}));return}
 if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(async()=>{const c=await caches.open(VERSION);return await c.match('/')||Response.error()}));
});
