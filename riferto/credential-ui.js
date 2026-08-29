const DB_NAME='riferto-db';
const DB_VERSION=1;

function openDb(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

async function getMeta(id){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('meta','readonly');
    const request=tx.objectStore('meta').get(id);
    request.onsuccess=()=>{db.close();resolve(request.result||null)};
    request.onerror=()=>{db.close();reject(request.error)};
  });
}

const keyIcon=`<svg class="passkey-symbol" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.2" cy="11.2" r="4.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12.1 12.7 21 12.7M17.1 12.7v3M20.1 12.7v2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const style=document.createElement('style');
style.textContent=`
.passkey-symbol{width:1.25em;height:1.25em;display:inline-block;vertical-align:-.22em;margin-right:.42em}
.credential-hidden{display:none!important}
#biometricUnlockBtn,#passkeyUnlockBtn{align-items:center;justify-content:center}
`;
document.head.appendChild(style);

async function syncCredentialUi(){
  const faceManage=document.querySelector('#biometricManageBtn');
  const passManage=document.querySelector('#passkeyManageBtn');
  const faceUnlock=document.querySelector('#biometricUnlockBtn');
  const passUnlock=document.querySelector('#passkeyUnlockBtn');
  if(!faceManage||!passManage||!faceUnlock||!passUnlock)return false;

  const [faceCurrent,faceLegacy,pass]=await Promise.all([
    getMeta('webauthn-faceid'),
    getMeta('biometric'),
    getMeta('webauthn-passkey')
  ]);
  const face=faceCurrent||faceLegacy;

  // Once one method is configured, do not keep advertising the alternative
  // as another setup choice. The configured method remains manageable.
  if(face&&!pass){
    passManage.classList.add('credential-hidden');
    faceManage.classList.remove('credential-hidden');
  }else if(pass&&!face){
    faceManage.classList.add('credential-hidden');
    passManage.classList.remove('credential-hidden');
  }else if(face&&pass){
    // On Apple devices prefer Face ID as the primary local method.
    passManage.classList.add('credential-hidden');
    faceManage.classList.remove('credential-hidden');
  }else{
    faceManage.classList.remove('credential-hidden');
    passManage.classList.remove('credential-hidden');
  }

  // Lock screen: show a single clean quick-unlock action, with a passkey key icon.
  if(face){
    passUnlock.classList.add('credential-hidden');
    faceUnlock.innerHTML=`${keyIcon}<span>Sblocca con Face ID</span>`;
    faceUnlock.style.display=faceUnlock.classList.contains('hidden')?'none':'flex';
  }else if(pass){
    faceUnlock.classList.add('credential-hidden');
    passUnlock.innerHTML=`${keyIcon}<span>Sblocca con Passkey</span>`;
    passUnlock.style.display=passUnlock.classList.contains('hidden')?'none':'flex';
  }
  return true;
}

let attempts=0;
const timer=setInterval(async()=>{
  attempts+=1;
  try{
    if(await syncCredentialUi()||attempts>30)clearInterval(timer);
  }catch(error){
    console.warn('Credential UI sync failed',error);
    if(attempts>30)clearInterval(timer);
  }
},100);

const observer=new MutationObserver(()=>{
  syncCredentialUi().catch(()=>{});
});
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
