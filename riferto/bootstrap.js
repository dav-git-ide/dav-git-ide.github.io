const APP_VERSION='0.10.13';
const DB_NAME='riferto-db';
const DB_VERSION=1;
const isStandalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let deferredInstallPrompt=null;
let latestKnownVersion=APP_VERSION;
const $=s=>document.querySelector(s);

$('#homeUpdateBtn')?.remove();

function versionParts(v){return String(v||'0').split('.').map(x=>Number.parseInt(x,10)||0)}
function isNewerVersion(a,b){const A=versionParts(a),B=versionParts(b);for(let i=0;i<Math.max(A.length,B.length);i++){const x=A[i]||0,y=B[i]||0;if(x!==y)return x>y}return false}
function setVisibleVersion(){document.querySelectorAll('.version-badge').forEach(el=>{el.textContent=el.textContent.trim().startsWith('Versione')?`Versione ${APP_VERSION}`:`v${APP_VERSION}`});const footerVersion=document.querySelector('.app-footer strong');if(footerVersion)footerVersion.textContent=`Riferto v${APP_VERSION}`}
setVisibleVersion();

window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;$('#nativeInstallBtn')?.classList.remove('hidden')});
$('#nativeInstallBtn')?.addEventListener('click',async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice.catch(()=>null);deferredInstallPrompt=null;$('#nativeInstallBtn')?.classList.add('hidden')});

function showInstallOnly(){
  $('#installScreen')?.classList.remove('hidden');$('#lockScreen')?.classList.add('hidden');$('#appShell')?.classList.add('hidden');$('#appShell')?.setAttribute('aria-hidden','true');$('#bottomNav')?.classList.add('hidden');
  if(/iPhone|iPad|iPod/i.test(navigator.userAgent))$('#iosInstallHelp')?.classList.remove('hidden');else $('#genericInstallHelp')?.classList.remove('hidden');
}
function openDatabase(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('vault'))db.createObjectStore('vault',{keyPath:'id'});if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function ensureDatabase(){const db=await openDatabase();db.close()}

async function ensureCurrentServiceWorker(){
  if(!('serviceWorker'in navigator))return null;
  const registrations=await navigator.serviceWorker.getRegistrations();
  const existing=registrations.find(reg=>reg.scope.includes('/riferto/'));
  if(existing)return existing;
  try{return await navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`,{updateViaCache:'none'})}catch(e){console.warn('SW',e);return null}
}
async function installTargetServiceWorker(version){
  if(!('serviceWorker'in navigator))return null;
  const reg=await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(version)}&install=${Date.now()}`,{updateViaCache:'none'});
  await reg.update().catch(()=>{});
  return reg;
}
async function fetchPublishedVersion(){const response=await fetch(`./version.json?t=${Date.now()}`,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});if(!response.ok)throw new Error(`Version check HTTP ${response.status}`);const data=await response.json();if(!data?.version)throw new Error('Versione pubblicata non valida.');latestKnownVersion=String(data.version);return data}

function settingsButton(){return document.querySelector('[data-app-section="settings"]')}
function ensureNavBadge(){const button=settingsButton();if(!button)return null;let badge=button.querySelector('.nav-notification');if(!badge){badge=document.createElement('span');badge.className='nav-notification';badge.textContent='1';badge.setAttribute('aria-label','Aggiornamento disponibile');button.appendChild(badge)}return badge}
function updateCard(){return $('#settingsUpdateAvailable')}
function showSettingsUpdate(version){ensureNavBadge()?.classList.remove('hidden');const card=updateCard();if(card){card.classList.remove('hidden');$('#settingsUpdateVersion').textContent=`v${version}`;$('#settingsCurrentVersion').textContent=`v${APP_VERSION}`;$('#settingsUpdateNowBtn').textContent=`Aggiorna a v${version}`}}
function clearUpdateUi(){settingsButton()?.querySelector('.nav-notification')?.classList.add('hidden');updateCard()?.classList.add('hidden')}

async function checkForUpdates({showIfCurrent=false}={}){try{const data=await fetchPublishedVersion();if(isNewerVersion(data.version,APP_VERSION)){showSettingsUpdate(data.version);return data.version}clearUpdateUi();if(showIfCurrent)alert(`Riferto v${APP_VERSION} è già aggiornato.`);return null}catch(error){console.warn('Version check failed',error);if(showIfCurrent)alert('Non riesco a verificare la versione pubblicata. Controlla la connessione e riprova.');return null}}
async function clearRifertoCaches(){if(!('caches'in window))return;const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('riferto-')).map(k=>caches.delete(k)))}
async function hardUpdate(targetVersion=null,button=null){const b=button||$('#forceUpdateBtn')||$('#settingsUpdateNowBtn');const old=b?.textContent||'';if(b){b.disabled=true;b.textContent='Verifica aggiornamento…'}try{const published=await fetchPublishedVersion();const target=targetVersion||published.version;if(target!==published.version)throw new Error('La versione pubblicata è cambiata. Riprova.');if(!isNewerVersion(target,APP_VERSION)){if(b){b.disabled=false;b.textContent=old||'Controlla aggiornamenti'};clearUpdateUi();alert(`Riferto v${APP_VERSION} è già aggiornato.`);return}const verify=await fetch(`./index.html?verify=${encodeURIComponent(target)}&t=${Date.now()}`,{cache:'no-store'});const html=await verify.text();if(!verify.ok||!html.includes(`v${target}`))throw new Error('La nuova shell non è ancora disponibile su GitHub Pages.');if(b)b.textContent=`Installo v${target}…`;await clearRifertoCaches();await installTargetServiceWorker(target);if(b)b.textContent='Riavvio…';const u=new URL('./',location.href);u.searchParams.set('release',target);u.searchParams.set('t',Date.now().toString());location.replace(u.toString())}catch(error){console.error(error);if(b){b.disabled=false;b.textContent='Riprova aggiornamento'};alert(error?.message||'Aggiornamento non riuscito.')}}

$('#forceUpdateBtn')?.addEventListener('click',async event=>{const newer=await checkForUpdates();if(newer)hardUpdate(newer,event.currentTarget);else if(latestKnownVersion===APP_VERSION)alert(`Riferto v${APP_VERSION} è già aggiornato.`)});
$('#settingsUpdateNowBtn')?.addEventListener('click',event=>hardUpdate(latestKnownVersion,event.currentTarget));
settingsButton()?.addEventListener('click',()=>{settingsButton()?.querySelector('.nav-notification')?.classList.add('hidden')});
window.RifertoCheckForUpdates=checkForUpdates;window.RifertoHardUpdate=hardUpdate;

(async()=>{await ensureCurrentServiceWorker();if(!isStandalone){showInstallOnly();return}$('#installScreen')?.classList.add('hidden');$('#appShell')?.classList.add('hidden');$('#appShell')?.setAttribute('aria-hidden','true');$('#appShell')?.setAttribute('inert','');$('#bottomNav')?.classList.add('hidden');$('#lockScreen')?.classList.remove('hidden');try{await ensureDatabase();await import(`./setup-security.js?v=${APP_VERSION}`);await import(`./app.js?v=${APP_VERSION}`);await import(`./biometric.js?v=${APP_VERSION}`);await import(`./storage-backup.js?v=${APP_VERSION}`);await import(`./reports-search.js?v=${APP_VERSION}`);setTimeout(()=>checkForUpdates(),500)}catch(e){console.error(e);$('#lockIntro').textContent='Errore di inizializzazione locale. Chiudi e riapri Riferto.';$('#unlockBtn').textContent='Riprova';$('#unlockBtn').onclick=()=>location.reload();$('#lockError').textContent=e?.message||'Errore di inizializzazione'}})();