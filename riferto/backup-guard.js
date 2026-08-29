const GUARD_DB='riferto-db';
const GUARD_DB_VERSION=1;
const GUARD_ITERATIONS=310000;
const guardEncoder=new TextEncoder();
let guardUnlockedUntil=0;

function guardOpenDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(GUARD_DB,GUARD_DB_VERSION);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function guardMeta(id){const db=await guardOpenDb();return new Promise((resolve,reject)=>{const tx=db.transaction('meta','readonly'),r=tx.objectStore('meta').get(id);r.onsuccess=()=>{db.close();resolve(r.result||null)};r.onerror=()=>{db.close();reject(r.error)}})}
function guardUnb64(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
async function guardDerive(secret,salt,iterations=GUARD_ITERATIONS){const material=await crypto.subtle.importKey('raw',guardEncoder.encode(secret),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt'])}
async function verifyBackupPassword(password){const meta=await guardMeta('backup-security');if(!meta?.wrappedByPassword)return false;try{const key=await guardDerive(password,guardUnb64(meta.salt),meta.iterations||GUARD_ITERATIONS);await crypto.subtle.decrypt({name:'AES-GCM',iv:guardUnb64(meta.wrappedByPassword.iv),additionalData:guardEncoder.encode('riferto-backup-master-v1')},key,guardUnb64(meta.wrappedByPassword.ciphertext));return true}catch{return false}}

const guardDialog=document.createElement('dialog');
guardDialog.className='sheet-dialog';
guardDialog.innerHTML=`<form id="backupGuardForm" class="sheet glass"><div class="sheet-handle"></div><div class="sheet-head"><div><p class="eyebrow">Protezione backup</p><h2>Sblocca la modifica</h2></div><button id="backupGuardClose" type="button" class="icon-btn" aria-label="Chiudi">✕</button></div><p class="muted">Per poter disattivare il backup automatico inserisci la password del backup. Lo sblocco resta valido per 60 secondi.</p><label class="field"><span>Password backup</span><input id="backupGuardPassword" type="password" autocomplete="current-password" /></label><p id="backupGuardError" class="error-text"></p><div class="sheet-actions"><button class="primary-btn" type="submit">🔑 Sblocca modifica</button></div></form>`;
document.body.appendChild(guardDialog);

document.querySelector('#backupGuardClose')?.addEventListener('click',()=>guardDialog.close());

document.querySelector('#backupGuardForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const error=document.querySelector('#backupGuardError');
  error.textContent='';
  const ok=await verifyBackupPassword(document.querySelector('#backupGuardPassword').value);
  if(!ok){error.textContent='Password backup non corretta.';return}
  guardUnlockedUntil=Date.now()+60000;
  document.querySelector('#backupGuardPassword').value='';
  guardDialog.close();
  applyGuardState();
});

function isGuardUnlocked(){return Date.now()<guardUnlockedUntil}
function applyGuardState(){
  const toggle=document.querySelector('#autoBackupToggle');
  const unlock=document.querySelector('#unlockBackupToggleBtn');
  if(!toggle)return false;
  const enabled=localStorage.getItem('riferto-auto-backup-enabled')!=='false';
  if(enabled){
    toggle.disabled=!isGuardUnlocked();
    toggle.title=isGuardUnlocked()?'Modifica sbloccata temporaneamente':'Sblocca prima la modifica';
    if(unlock){unlock.classList.remove('hidden');unlock.textContent=isGuardUnlocked()?'🔓 Modifica sbloccata':'🔑 Sblocca modifica'}
  }else{
    toggle.disabled=false;
    if(unlock)unlock.classList.add('hidden');
  }
  return true;
}

function installGuard(){
  const toggle=document.querySelector('#autoBackupToggle');
  if(!toggle)return false;
  let unlock=document.querySelector('#unlockBackupToggleBtn');
  if(!unlock){
    unlock=document.createElement('button');
    unlock.id='unlockBackupToggleBtn';
    unlock.type='button';
    unlock.className='secondary-btn backup-guard-btn';
    unlock.textContent='🔑 Sblocca modifica';
    toggle.closest('.backup-toggle')?.insertAdjacentElement('afterend',unlock);
  }
  unlock.onclick=async()=>{
    const meta=await guardMeta('backup-security');
    if(!meta){alert('Configura prima la password del backup.');window.RifertoConfigureBackupPassword?.();return}
    document.querySelector('#backupGuardError').textContent='';
    document.querySelector('#backupGuardPassword').value='';
    guardDialog.showModal();
  };
  toggle.addEventListener('change',event=>{
    if(event.target.checked)return;
    if(!isGuardUnlocked()){
      event.stopImmediatePropagation();
      event.target.checked=true;
      applyGuardState();
      guardDialog.showModal();
      return;
    }
    if(!confirm('Disattivare il backup automatico? I nuovi referti non genereranno più automaticamente una copia di sicurezza.')){
      event.stopImmediatePropagation();
      event.target.checked=true;
      return;
    }
    guardUnlockedUntil=0;
    setTimeout(applyGuardState,0);
  },true);
  const style=document.createElement('style');
  style.textContent='.backup-guard-btn{width:100%;margin-top:10px}.backup-toggle input:disabled{opacity:.55}.backup-toggle:has(input:disabled){opacity:.78}';
  document.head.appendChild(style);
  applyGuardState();
  return true;
}

let guardAttempts=0;
const guardTimer=setInterval(()=>{guardAttempts++;if(installGuard()||guardAttempts>50)clearInterval(guardTimer)},100);
setInterval(applyGuardState,1000);
