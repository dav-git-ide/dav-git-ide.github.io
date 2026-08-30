const CACHE='riferto-v0.12.6';
const STATIC=['./styles.css?v=0.12.6','./pin-guard.js?v=0.12.6','./ui-nav.js?v=0.12.6','./bootstrap.js?v=0.12.6','./setup-security.js?v=0.12.6','./app.js?v=0.12.6','./biometric.js?v=0.12.6','./credential-ui.js?v=0.12.6','./storage-backup.js?v=0.12.6','./backup-guard.js?v=0.12.6','./loinc-search.js?v=0.12.6','./reports-search.js?v=0.12.6','./report-view-guard.js?v=0.12.6','./canonical-backfill.js?v=0.12.6','./trend.js?v=0.12.6','./trend-matrix-polish.js?v=0.12.6','./settings-accordion.js?v=0.12.6','./polish-0121.js?v=0.12.6','./report-polish-0122.js?v=0.12.6','./update-badge-ui.js?v=0.12.6','./manifest.webmanifest?v=0.12.6','./loinc-common.json'];
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