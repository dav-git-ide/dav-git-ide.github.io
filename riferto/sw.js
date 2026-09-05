const CACHE='riferto-v0.13.4';
const STATIC=['./styles.css?v=0.13.4','./design-0133.css?v=0.13.4','./pin-guard.js?v=0.13.4','./ui-nav.js?v=0.13.4','./bootstrap.js?v=0.13.4','./setup-security.js?v=0.13.4','./app.js?v=0.13.4','./family-core.js?v=0.13.4','./responsive-family-ui.js?v=0.13.4','./settings-info-0131.js?v=0.13.4','./update-source-0134.js?v=0.13.4','./biometric.js?v=0.13.4','./credential-ui.js?v=0.13.4','./storage-backup.js?v=0.13.4','./backup-package-0132.js?v=0.13.4','./backup-mode-0132.js?v=0.13.4','./backup-guard.js?v=0.13.4','./loinc-search.js?v=0.13.4','./reports-search.js?v=0.13.4','./report-view-guard.js?v=0.13.4','./canonical-backfill.js?v=0.13.4','./trend.js?v=0.13.4','./trend-matrix-polish.js?v=0.13.4','./settings-accordion.js?v=0.13.4','./polish-0121.js?v=0.13.4','./report-polish-0122.js?v=0.13.4','./update-badge-ui.js?v=0.13.4','./manifest.webmanifest?v=0.13.4','./icon-riferto.svg?v=0.13.4','./loinc-common.json','./changelog.html'];
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