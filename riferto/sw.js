const CACHE='riferto-v0.10.13';
const STATIC=['./styles.css?v=0.10.13','./pin-guard.js?v=0.10.13','./ui-nav.js?v=0.10.13','./bootstrap.js?v=0.10.13','./setup-security.js?v=0.10.13','./app.js?v=0.10.13','./biometric.js?v=0.10.13','./credential-ui.js?v=0.10.13','./storage-backup.js?v=0.10.13','./backup-guard.js?v=0.10.13','./loinc-search.js?v=0.10.13','./reports-search.js?v=0.10.13','./manifest.webmanifest?v=0.10.13','./loinc-common.json'];
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