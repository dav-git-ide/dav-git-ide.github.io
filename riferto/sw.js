const CACHE='riferto-v0.10.8';
const STATIC=['./styles.css?v=0.10.8','./pin-guard.js?v=0.10.8','./ui-nav.js?v=0.10.8','./bootstrap.js?v=0.10.8','./setup-security.js?v=0.10.8','./app.js?v=0.10.8','./biometric.js?v=0.10.8','./credential-ui.js?v=0.10.8','./storage-backup.js?v=0.10.8','./backup-guard.js?v=0.10.8','./loinc-search.js?v=0.10.8','./manifest.webmanifest?v=0.10.8','./loinc-common.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('riferto-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const req=event.request;
  const url=new URL(req.url);
  if(url.pathname.endsWith('/version.json')){event.respondWith(fetch(req,{cache:'no-store'}));return}
  if(req.mode==='navigate'){
    event.respondWith(caches.open(CACHE).then(cache=>cache.match('./index.html')).then(cached=>cached||fetch(req,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r})));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));return r})));
});