const CACHE='riferto-v0.13.1';
const STATIC=['./styles.css?v=0.13.1','./pin-guard.js?v=0.13.1','./ui-nav.js?v=0.13.1','./bootstrap.js?v=0.13.1','./setup-security.js?v=0.13.1','./app.js?v=0.13.1','./family-core.js?v=0.13.1','./responsive-family-ui.js?v=0.13.1','./settings-info-0131.js?v=0.13.1','./biometric.js?v=0.13.1','./credential-ui.js?v=0.13.1','./storage-backup.js?v=0.13.1','./backup-guard.js?v=0.13.1','./loinc-search.js?v=0.13.1','./reports-search.js?v=0.13.1','./report-view-guard.js?v=0.13.1','./canonical-backfill.js?v=0.13.1','./trend.js?v=0.13.1','./trend-matrix-polish.js?v=0.13.1','./settings-accordion.js?v=0.13.1','./polish-0121.js?v=0.13.1','./report-polish-0122.js?v=0.13.1','./update-badge-ui.js?v=0.13.1','./manifest.webmanifest?v=0.13.1','./icon-riferto.svg?v=0.13.1','./loinc-common.json','./changelog.html'];
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