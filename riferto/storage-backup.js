const DB_NAME='riferto-db';
const DB_VERSION=1;
const AUTO_BACKUP_FORMAT='riferto-device-backup-v1';
const AUTO_BACKUP_KEY='riferto-auto-backup-enabled';
const $=s=>document.querySelector(s);

function openDb(){
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

async function readStore(storeName){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,'readonly');
    const request=tx.objectStore(storeName).getAll();
    request.onsuccess=()=>{db.close();resolve(request.result||[])};
    request.onerror=()=>{db.close();reject(request.error)};
  });
}

async function readMeta(id){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('meta','readonly');
    const request=tx.objectStore('meta').get(id);
    request.onsuccess=()=>{db.close();resolve(request.result||null)};
    request.onerror=()=>{db.close();reject(request.error)};
  });
}

async function buildDeviceBackup(){
  const [security,vault]=await Promise.all([readMeta('security'),readStore('vault')]);
  if(!security)throw new Error('Archivio non inizializzato.');
  return {
    format:AUTO_BACKUP_FORMAT,
    version:1,
    createdAt:new Date().toISOString(),
    app:'Riferto',
    security,
    vault
  };
}

function backupFilename(createdAt){
  return `riferto-auto-backup-${createdAt.replace(/[:.]/g,'-')}.json`;
}

async function downloadDeviceBackup(source='manual'){
  const payload=await buildDeviceBackup();
  const blob=new Blob([JSON.stringify(payload)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download=backupFilename(payload.createdAt);
  link.style.display='none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  localStorage.setItem('riferto-last-auto-backup',payload.createdAt);
  updateBackupStatus(source==='auto'?'Backup automatico richiesto al sistema.':'Backup generato.');
  return payload;
}

function humanBytes(bytes){
  if(!Number.isFinite(bytes))return '—';
  if(bytes<1024)return `${bytes} B`;
  if(bytes<1024**2)return `${(bytes/1024).toFixed(1)} KB`;
  if(bytes<1024**3)return `${(bytes/1024**2).toFixed(1)} MB`;
  return `${(bytes/1024**3).toFixed(1)} GB`;
}

let storageStatusEl=null;
let backupStatusEl=null;
let persistenceButton=null;
let backupToggle=null;

async function refreshStorageStatus(requestPersistence=false){
  if(!navigator.storage){
    if(storageStatusEl)storageStatusEl.textContent='Storage API non disponibile su questo browser.';
    return;
  }
  try{
    let persistent=await navigator.storage.persisted?.();
    if(requestPersistence&&!persistent&&navigator.storage.persist){
      persistent=await navigator.storage.persist();
    }
    const estimate=await navigator.storage.estimate?.();
    const usage=estimate?.usage;
    const quota=estimate?.quota;
    if(storageStatusEl){
      const state=persistent?'Persistente: attivo ✓':'Persistenza non garantita';
      const space=Number.isFinite(usage)&&Number.isFinite(quota)?` · ${humanBytes(usage)} usati su ${humanBytes(quota)}`:'';
      storageStatusEl.textContent=state+space;
    }
    if(persistenceButton){
      persistenceButton.textContent=persistent?'Archiviazione persistente attiva':'Richiedi archiviazione persistente';
      persistenceButton.disabled=Boolean(persistent);
    }
  }catch(error){
    console.warn('Storage persistence check failed',error);
    if(storageStatusEl)storageStatusEl.textContent='Impossibile verificare la persistenza dello storage.';
  }
}

function autoBackupEnabled(){return localStorage.getItem(AUTO_BACKUP_KEY)!=='false'}
function setAutoBackupEnabled(value){localStorage.setItem(AUTO_BACKUP_KEY,value?'true':'false')}

function updateBackupStatus(message=''){
  if(!backupStatusEl)return;
  const last=localStorage.getItem('riferto-last-auto-backup');
  const stamp=last?new Intl.DateTimeFormat('it-IT',{dateStyle:'short',timeStyle:'short'}).format(new Date(last)):'mai';
  backupStatusEl.textContent=`Backup automatico ${autoBackupEnabled()?'attivo':'disattivato'} · ultimo: ${stamp}${message?` · ${message}`:''}`;
}

function installSettingsCard(){
  const stack=$('.settings-stack');
  if(!stack||$('#storageBackupCard'))return;
  const card=document.createElement('article');
  card.id='storageBackupCard';
  card.className='glass settings-card';
  card.innerHTML=`
    <div><p class="eyebrow">Protezione dati</p><h3>Storage e backup automatico</h3><p class="muted">Riferto prova a rendere persistente lo storage del dispositivo e, dopo ogni salvataggio di un referto, genera un backup dei dati già cifrati.</p></div>
    <p id="storagePersistenceStatus" class="caption"></p>
    <p id="autoBackupStatus" class="caption"></p>
    <div class="settings-actions">
      <button id="requestPersistenceBtn" class="secondary-btn" type="button">Verifica archiviazione persistente</button>
      <button id="downloadDeviceBackupBtn" class="secondary-btn" type="button">Scarica backup adesso</button>
    </div>
    <label class="backup-toggle"><input id="autoBackupToggle" type="checkbox" /> <span>Backup automatico dopo ogni salvataggio</span></label>`;
  const appCard=[...stack.children].find(el=>el.querySelector?.('#forceUpdateBtn'));
  if(appCard)stack.insertBefore(card,appCard);else stack.prepend(card);
  storageStatusEl=$('#storagePersistenceStatus');
  backupStatusEl=$('#autoBackupStatus');
  persistenceButton=$('#requestPersistenceBtn');
  backupToggle=$('#autoBackupToggle');
  backupToggle.checked=autoBackupEnabled();
  backupToggle.addEventListener('change',()=>{setAutoBackupEnabled(backupToggle.checked);updateBackupStatus()});
  persistenceButton.addEventListener('click',()=>refreshStorageStatus(true));
  $('#downloadDeviceBackupBtn')?.addEventListener('click',()=>downloadDeviceBackup('manual').catch(error=>alert(error?.message||'Backup non riuscito.')));
  updateBackupStatus();
}

async function restoreDeviceBackup(payload){
  if(!payload||payload.format!==AUTO_BACKUP_FORMAT||!payload.security||!Array.isArray(payload.vault))return false;
  if(!confirm('Ripristinare questo backup automatico? I dati locali correnti del vault verranno sostituiti. Face ID/Passkey dovranno essere configurati di nuovo.'))return true;
  const db=await openDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(['vault','meta'],'readwrite');
    const vault=tx.objectStore('vault');
    const meta=tx.objectStore('meta');
    vault.clear();
    for(const row of payload.vault)vault.put(row);
    meta.put(payload.security);
    for(const id of ['biometric','webauthn-faceid','webauthn-passkey'])meta.delete(id);
    tx.oncomplete=()=>{db.close();resolve()};
    tx.onerror=()=>{db.close();reject(tx.error)};
    tx.onabort=()=>{db.close();reject(tx.error||new Error('Ripristino annullato'))};
  });
  alert('Backup ripristinato. Riferto verrà riavviato e richiederà il PIN del backup.');
  location.reload();
  return true;
}

function installImportInterceptor(){
  const input=$('#importInput');
  if(!input)return;
  input.addEventListener('change',async event=>{
    const file=event.target.files?.[0];
    if(!file)return;
    try{
      const text=await file.text();
      const payload=JSON.parse(text);
      if(payload?.format!==AUTO_BACKUP_FORMAT)return;
      event.stopImmediatePropagation();
      await restoreDeviceBackup(payload);
    }catch(error){
      // Not our format: leave the normal encrypted-backup importer to app.js.
    }
  },true);
}

function installAutomaticBackupHook(){
  const form=$('#reportForm');
  const dialog=$('#reportDialog');
  if(!form||!dialog)return;
  form.addEventListener('submit',()=>{
    if(!autoBackupEnabled())return;
    const onClose=()=>{
      setTimeout(()=>downloadDeviceBackup('auto').catch(error=>{
        console.warn('Automatic backup download failed',error);
        updateBackupStatus('download automatico non riuscito; usa “Scarica backup adesso”.');
      }),150);
    };
    dialog.addEventListener('close',onClose,{once:true});
  });
}

installSettingsCard();
installImportInterceptor();
installAutomaticBackupHook();
refreshStorageStatus(true);
