const CACHE='blood-vault-v0.6.0';
const STATIC_ASSETS=['./styles.css?v=0.6.0','./bootstrap.js?v=0.6.0','./app.js?v=0.6.0','./biometric.js?v=0.6.0','./manifest.webmanifest?v=0.6.0','./loinc-common.json'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(req).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(req,copy));return response;}).catch(()=>caches.match(req)));
});
