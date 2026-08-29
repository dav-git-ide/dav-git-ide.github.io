const DB_NAME='blood-vault-db';
const DB_VERSION=2;
const REQUIRED_STORES=['vault','meta'];

function openDatabase(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains('vault')) db.createObjectStore('vault',{keyPath:'id'});
      if(!db.objectStoreNames.contains('meta')) db.createObjectStore('meta',{keyPath:'id'});
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

  // Recovery for the broken first-release state: an empty v2 database may have
  // been created by biometric.js before app.js could create its stores.
  // If either required store is missing there cannot be a usable Blood Vault,
  // so recreate the database safely at the same version.
  if(missing){
    await deleteDatabase();
    db=await openDatabase();
    db.close();
  }
}

(async()=>{
  const status=document.querySelector('#lockError');
  try{
    await ensureDatabase();
    await import('./app.js');
    await import('./biometric.js');
  }catch(error){
    console.error('Blood Vault bootstrap failed',error);
    const intro=document.querySelector('#lockIntro');
    const button=document.querySelector('#unlockBtn');
    if(intro) intro.textContent='Errore di inizializzazione locale. Ricarica la pagina; se persiste, elimina i dati del sito e riprova.';
    if(button){button.textContent='Riprova';button.onclick=()=>location.reload();}
    if(status) status.textContent=error?.message||'Errore di inizializzazione';
  }
})();
