const RIFERTO_DB='riferto-db';
const RIFERTO_DB_VERSION=1;
const RIFERTO_ITERATIONS=310000;
const teSetup=new TextEncoder();

function setupB64(bytes){const a=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);let s='';for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode(...a.subarray(i,i+0x8000));return btoa(s)}
function setupUnb64(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function setupOpenDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(RIFERTO_DB,RIFERTO_DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('vault'))db.createObjectStore('vault',{keyPath:'id'});if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function setupMeta(id){const db=await setupOpenDb();return new Promise((resolve,reject)=>{const tx=db.transaction('meta','readonly'),r=tx.objectStore('meta').get(id);r.onsuccess=()=>{db.close();resolve(r.result||null)};r.onerror=()=>{db.close();reject(r.error)}})}
async function setupPutMeta(value){const db=await setupOpenDb();return new Promise((resolve,reject)=>{const tx=db.transaction('meta','readwrite'),r=tx.objectStore('meta').put(value);r.onsuccess=()=>{db.close();resolve()};r.onerror=()=>{db.close();reject(r.error)}})}
async function setupDerive(secret,salt,iterations=RIFERTO_ITERATIONS){const material=await crypto.subtle.importKey('raw',teSetup.encode(secret),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function setupSeal(key,raw,aad){const iv=crypto.getRandomValues(new Uint8Array(12)),ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:teSetup.encode(aad)},key,raw);return{iv:setupB64(iv),ciphertext:setupB64(ciphertext)}}
async function setupOpen(key,box,aad){return crypto.subtle.decrypt({name:'AES-GCM',iv:setupUnb64(box.iv),additionalData:teSetup.encode(aad)},key,setupUnb64(box.ciphertext))}

const lockCard=document.querySelector('.lock-card');
const pinFields=[document.querySelector('#pinInput')?.closest('.field'),document.querySelector('#pinConfirmField')];
const unlockBtnSetup=document.querySelector('#unlockBtn');
const separatorSetup=document.querySelector('.lock-separator');
const biometricSetup=document.querySelector('#biometricUnlockBtn');
const lockIntroSetup=document.querySelector('#lockIntro');
const pinKeypadSetup=document.querySelector('.pin-keypad');
let pendingBackupRaw=null;
let pendingBackupBase=null;
let capturedPin='';
let firstRun=false;

const onboarding=document.createElement('section');
onboarding.id='backupPasswordOnboarding';
onboarding.className='backup-password-onboarding hidden';
onboarding.innerHTML=`
  <p class="eyebrow">Prima di iniziare</p>
  <h2>Password del backup</h2>
  <p class="muted">Questa password protegge i backup automatici. È separata dal PIN con cui apri Riferto.</p>
  <label class="field"><span>Password backup</span><input id="backupSetupPassword" type="password" autocomplete="new-password" minlength="6" /></label>
  <label class="field"><span>Conferma password backup</span><input id="backupSetupConfirm" type="password" autocomplete="new-password" minlength="6" /></label>
  <label class="field"><span>Frase-promemoria</span><input id="backupSetupHint" type="text" maxlength="120" autocomplete="off" placeholder="Es. il posto della nostra prima vacanza" /></label>
  <p class="caption">Il promemoria potrà essere mostrato durante il recupero. Non inserire qui la password né informazioni troppo esplicite.</p>
  <p id="backupSetupError" class="error-text"></p>
  <button id="backupSetupContinue" class="primary-btn" type="button">Continua e crea il PIN</button>`;
lockCard?.insertBefore(onboarding,lockIntroSetup?.nextSibling||lockCard.firstChild);

const setupStyle=document.createElement('style');
setupStyle.textContent=`.backup-password-onboarding{margin-top:16px}.backup-password-onboarding h2{font-size:1.35rem;margin:0 0 8px}.backup-password-onboarding .field{margin:12px 0}.backup-password-onboarding .primary-btn{width:100%;margin-top:8px}.backup-setup-hidden{display:none!important}`;
document.head.appendChild(setupStyle);

function showBackupStep(){
  onboarding.classList.remove('hidden');
  lockIntroSetup?.classList.add('backup-setup-hidden');
  pinFields.forEach(el=>el?.classList.add('backup-setup-hidden'));
  unlockBtnSetup?.classList.add('backup-setup-hidden');
  separatorSetup?.classList.add('backup-setup-hidden');
  biometricSetup?.classList.add('backup-setup-hidden');
  pinKeypadSetup?.classList.add('backup-setup-hidden');
}
function showPinStep(){
  onboarding.classList.add('hidden');
  lockIntroSetup?.classList.remove('backup-setup-hidden');
  pinFields.forEach(el=>el?.classList.remove('backup-setup-hidden'));
  unlockBtnSetup?.classList.remove('backup-setup-hidden');
  separatorSetup?.classList.remove('backup-setup-hidden');
  pinKeypadSetup?.classList.remove('backup-setup-hidden');
}

async function prepareBackupPassword(){
  const password=document.querySelector('#backupSetupPassword').value;
  const confirm=document.querySelector('#backupSetupConfirm').value;
  const hint=document.querySelector('#backupSetupHint').value.trim();
  const error=document.querySelector('#backupSetupError');
  error.textContent='';
  if(password.length<6){error.textContent='Usa almeno 6 caratteri per la password del backup.';return}
  if(password!==confirm){error.textContent='Le password del backup non coincidono.';return}
  if(!hint){error.textContent='Inserisci una breve frase-promemoria.';return}
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const backupRaw=crypto.getRandomValues(new Uint8Array(32));
  const passwordKey=await setupDerive(password,salt);
  pendingBackupRaw=backupRaw;
  pendingBackupBase={version:1,kdf:'PBKDF2-SHA256',iterations:RIFERTO_ITERATIONS,salt:setupB64(salt),hint,wrappedByPassword:await setupSeal(passwordKey,backupRaw,'riferto-backup-master-v1')};
  document.querySelector('#backupSetupPassword').value='';
  document.querySelector('#backupSetupConfirm').value='';
  showPinStep();
  if(lockIntroSetup)lockIntroSetup.textContent='Ora crea il PIN di 6 cifre per aprire Riferto.';
}

document.querySelector('#backupSetupContinue')?.addEventListener('click',()=>prepareBackupPassword().catch(error=>{document.querySelector('#backupSetupError').textContent=error?.message||'Impossibile configurare il backup.'}));

async function finalizeBackup(pin){
  if(!pendingBackupRaw||!pendingBackupBase)return;
  const security=await setupMeta('security');
  if(!security)return;
  const pinKey=await setupDerive(pin,setupUnb64(security.salt),security.iterations||RIFERTO_ITERATIONS);
  const wrappedByPin=await setupSeal(pinKey,pendingBackupRaw,'riferto-backup-master-pin-v1');
  await setupPutMeta({id:'backup-security',...pendingBackupBase,wrappedByPin});
  window.RifertoBackupSessionKey=await crypto.subtle.importKey('raw',pendingBackupRaw,'AES-GCM',false,['encrypt','decrypt']);
  window.RifertoBackupHint=pendingBackupBase.hint;
  pendingBackupRaw=null;pendingBackupBase=null;
  window.dispatchEvent(new CustomEvent('riferto:backup-key-ready'));
}

async function unlockBackupKey(pin){
  const [security,backup]=await Promise.all([setupMeta('security'),setupMeta('backup-security')]);
  if(!security||!backup?.wrappedByPin)return;
  try{
    const pinKey=await setupDerive(pin,setupUnb64(security.salt),security.iterations||RIFERTO_ITERATIONS);
    const raw=await setupOpen(pinKey,backup.wrappedByPin,'riferto-backup-master-pin-v1');
    window.RifertoBackupSessionKey=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
    window.RifertoBackupHint=backup.hint||'';
    window.dispatchEvent(new CustomEvent('riferto:backup-key-ready'));
  }catch{}
}

unlockBtnSetup?.addEventListener('click',()=>{
  const securityPromise=setupMeta('security');
  const pin=document.querySelector('#pinInput')?.value||'';
  const confirm=document.querySelector('#pinConfirmInput')?.value||'';
  securityPromise.then(security=>{
    if(!security&&pin.length===6&&pin===confirm)capturedPin=pin;
    else if(security&&pin.length===6)capturedPin=pin;
  });
},true);

const lockScreenSetup=document.querySelector('#lockScreen');
if(lockScreenSetup)new MutationObserver(async()=>{
  const locked=!lockScreenSetup.classList.contains('hidden');
  if(locked){window.RifertoBackupSessionKey=null;return}
  if(!capturedPin)return;
  const pin=capturedPin;capturedPin='';
  if(firstRun&&pendingBackupRaw)await finalizeBackup(pin).catch(console.error);
  else await unlockBackupKey(pin).catch(()=>{});
}).observe(lockScreenSetup,{attributes:true,attributeFilter:['class']});

(async()=>{
  const [security,backup]=await Promise.all([setupMeta('security'),setupMeta('backup-security')]);
  firstRun=!security;
  if(firstRun&&!backup)showBackupStep();
})();
