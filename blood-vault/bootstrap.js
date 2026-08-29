const APP_VERSION='0.6.0';
const DB_NAME='blood-vault-db';
const DB_VERSION=2;
const REQUIRED_STORES=['vault','meta'];
const isStandalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;

let deferredInstallPrompt=null;
const installScreen=document.querySelector('#installScreen');
const lockScreen=document.querySelector('#lockScreen');
const appShell=document.querySelector('#appShell');
const nativeInstallBtn=document.querySelector('#nativeInstallBtn');
const iosInstallHelp=document.querySelector('#iosInstallHelp');
const genericInstallHelp=document.querySelector('#genericInstallHelp');

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredInstallPrompt=event;
  nativeInstallBtn?.classList.remove('hidden');
});

nativeInstallBtn?.addEventListener('click',async()=>{
  if(!deferredInstallPrompt)return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice.catch(()=>null);
  deferredInstallPrompt=null;
  nativeInstallBtn.classList.add('hidden');
});

function showInstallOnly(){
  installScreen?.classList.remove('hidden');
  lockScreen?.classList.add('hidden');
  appShell?.classList.add('hidden');
  const ua=navigator.userAgent;
  const isiOS=/iPhone|iPad|iPod/i.test(ua);
  if(isiOS)iosInstallHelp?.classList.remove('hidden');
  else genericInstallHelp?.classList.remove('hidden');
}

function openDatabase(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains('vault'))db.createObjectStore('vault',{keyPath:'id'});
      if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'id'});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

function deleteDatabase(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess=()=>resolve();
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('IndexedDB deletion blocked'));
  });
}

async function ensureDatabase(){
  let db=await openDatabase();
  const missing=REQUIRED_STORES.some(name=>!db.objectStoreNames.contains(name));
  db.close();
  if(missing){
    await deleteDatabase();
    db=await openDatabase();
    db.close();
  }
}

async function registerServiceWorker(){
  if(!('serviceWorker'in navigator))return;
  try{
    const registration=await navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`,{updateViaCache:'none'});
    registration.update();
  }catch(error){console.warn('Service worker registration failed',error)}
}

(async()=>{
  await registerServiceWorker();
  if(!isStandalone){
    showInstallOnly();
    return;
  }

  installScreen?.classList.add('hidden');
  lockScreen?.classList.remove('hidden');
  appShell?.classList.remove('hidden');

  const status=document.querySelector('#lockError');
  try{
    await ensureDatabase();
    await import(`./app.js?v=${APP_VERSION}`);
    await import(`./biometric.js?v=${APP_VERSION}`);
  }catch(error){
    console.error('Blood Vault bootstrap failed',error);
    const intro=document.querySelector('#lockIntro');
    const button=document.querySelector('#unlockBtn');
    if(intro)intro.textContent='Errore di inizializzazione locale. Chiudi e riapri Blood Vault.';
    if(button){button.textContent='Riprova';button.onclick=()=>location.reload();}
    if(status)status.textContent=error?.message||'Errore di inizializzazione';
  }
})();
