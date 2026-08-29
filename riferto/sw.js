const CACHE='riferto-v0.9.3';
const STATIC=['./styles.css?v=0.9.3','./pin-guard.js?v=0.9.3','./ui-nav.js?v=0.9.3','./bootstrap.js?v=0.9.3','./app.js?v=0.9.3','./biometric.js?v=0.9.3','./credential-ui.js?v=0.9.3','./storage-backup.js?v=0.9.3','./manifest.webmanifest?v=0.9.3','./loinc-common.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('riferto-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(req,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));return r}).catch(()=>caches.match(req)));
});