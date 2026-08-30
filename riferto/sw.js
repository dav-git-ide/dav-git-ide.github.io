const CACHE='riferto-v0.13.0';
const STATIC=['./styles.css?v=0.13.0','./pin-guard.js?v=0.13.0','./ui-nav.js?v=0.13.0','./bootstrap.js?v=0.13.0','./setup-security.js?v=0.13.0','./app.js?v=0.13.0','./family-core.js?v=0.13.0','./responsive-family-ui.js?v=0.13.0','./biometric.js?v=0.13.0','./credential-ui.js?v=0.13.0','./storage-backup.js?v=0.13.0','./backup-guard.js?v=0.13.0','./loinc-search.js?v=0.13.0','./reports-search.js?v=0.13.0','./report-view-guard.js?v=0.13.0','./canonical-backfill.js?v=0.13.0','./trend.js?v=0.13.0','./trend-matrix-polish.js?v=0.13.0','./settings-accordion.js?v=0.13.0','./polish-0121.js?v=0.13.0','./report-polish-0122.js?v=0.13.0','./update-badge-ui.js?v=0.13.0','./manifest.webmanifest?v=0.13.0','./icon-riferto.svg?v=0.13.0','./loinc-common.json'];
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