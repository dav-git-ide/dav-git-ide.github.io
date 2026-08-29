const APP_VERSION='0.9.2';
const DB_NAME='riferto-db';
const DB_VERSION=1;
const isStandalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let deferredInstallPrompt=null;
const $=s=>document.querySelector(s);

function setVisibleVersion(){
  document.querySelectorAll('.version-badge').forEach(el=>{
    el.textContent=el.textContent.trim().startsWith('Versione')?`Versione ${APP_VERSION}`:`v${APP_VERSION}`;
  });
  const footerVersion=document.querySelector('.app-footer strong');
  if(footerVersion)footerVersion.textContent=`Riferto v${APP_VERSION}`;
}
setVisibleVersion();

window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;$('#nativeInstallBtn')?.classList.remove('hidden')});
$('#nativeInstallBtn')?.addEventListener('click',async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice.catch(()=>null);deferredInstallPrompt=null;$('#nativeInstallBtn')?.classList.add('hidden')});

function showInstallOnly(){
  $('#installScreen')?.classList.remove('hidden');
  $('#lockScreen')?.classList.add('hidden');
  $('#appShell')?.classList.add('hidden');
  $('#appShell')?.setAttribute('aria-hidden','true');
  $('#bottomNav')?.classList.add('hidden');
  if(/iPhone|iPad|iPod/i.test(navigator.userAgent))$('#iosInstallHelp')?.classList.remove('hidden');else $('#genericInstallHelp')?.classList.remove('hidden');
}

function openDatabase(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('vault'))db.createObjectStore('vault',{keyPath:'id'});if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function ensureDatabase(){const db=await openDatabase();db.close()}

async function registerServiceWorker(){
  if(!('serviceWorker'in navigator))return null;
  try{
    const reg=await navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`,{updateViaCache:'none'});
    reg.update().catch(()=>{});
    return reg;
  }catch(e){console.warn('SW',e);return null}
}

async function forceUpdate(){
  const b=$('#forceUpdateBtn');
  if(!b)return;
  const old=b.textContent;
  b.disabled=true;
  b.textContent='Aggiornamento…';
  try{
    if('serviceWorker'in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      for(const reg of regs){
        if(reg.scope.includes('/riferto/')){
          try{await reg.update()}catch{}
          await reg.unregister();
        }
      }
    }
    if('caches'in window){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('riferto-')).map(k=>caches.delete(k)));
    }
    const u=new URL(location.href);
    u.searchParams.set('refresh',Date.now().toString());
    location.replace(u.toString());
  }catch(e){
    console.error(e);
    b.disabled=false;
    b.textContent='Riprova aggiornamento';
    setTimeout(()=>{if(b){b.textContent=old;b.disabled=false}},2000);
  }
}
$('#forceUpdateBtn')?.addEventListener('click',forceUpdate);

(async()=>{
  await registerServiceWorker();
  if(!isStandalone){showInstallOnly();return}
  $('#installScreen')?.classList.add('hidden');
  $('#appShell')?.classList.add('hidden');
  $('#appShell')?.setAttribute('aria-hidden','true');
  $('#appShell')?.setAttribute('inert','');
  $('#bottomNav')?.classList.add('hidden');
  $('#lockScreen')?.classList.remove('hidden');
  try{
    await ensureDatabase();
    await import(`./app.js?v=${APP_VERSION}`);
    await import(`./biometric.js?v=${APP_VERSION}`);
  }catch(e){
    console.error(e);
    $('#lockIntro').textContent='Errore di inizializzazione locale. Chiudi e riapri Riferto.';
    $('#unlockBtn').textContent='Riprova';
    $('#unlockBtn').onclick=()=>location.reload();
    $('#lockError').textContent=e?.message||'Errore di inizializzazione';
  }
})();