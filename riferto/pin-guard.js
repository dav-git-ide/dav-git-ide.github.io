const pinInput=document.querySelector('#pinInput');
const pinConfirmInput=document.querySelector('#pinConfirmInput');
const pinConfirmField=document.querySelector('#pinConfirmField');
const unlockBtn=document.querySelector('#unlockBtn');
const lockError=document.querySelector('#lockError');

function digitsOnly(input){
  if(!input)return;
  const cleaned=input.value.replace(/\D+/g,'');
  if(cleaned!==input.value)input.value=cleaned;
}

function isCreateMode(){
  return pinConfirmField && !pinConfirmField.classList.contains('hidden');
}

function validatePins(showMessage=false){
  if(!isCreateMode())return true;
  const pin=pinInput?.value||'';
  const confirm=pinConfirmInput?.value||'';
  if(pin.length<6 || confirm.length<6){
    if(showMessage && lockError)lockError.textContent='Inserisci almeno 6 cifre in entrambi i campi.';
    return false;
  }
  if(pin!==confirm){
    if(lockError)lockError.textContent='I PIN non coincidono.';
    pinConfirmInput?.setAttribute('aria-invalid','true');
    return false;
  }
  pinConfirmInput?.removeAttribute('aria-invalid');
  if(lockError?.textContent==='I PIN non coincidono.' || lockError?.textContent==='Inserisci almeno 6 cifre in entrambi i campi.')lockError.textContent='';
  return true;
}

[pinInput,pinConfirmInput].forEach(input=>{
  input?.addEventListener('input',()=>{
    digitsOnly(input);
    if((pinInput?.value.length||0)>=6 && (pinConfirmInput?.value.length||0)>=6)validatePins(false);
  });
});

unlockBtn?.addEventListener('click',event=>{
  if(isCreateMode() && !validatePins(true)){
    event.preventDefault();
    event.stopImmediatePropagation();
    pinConfirmInput?.focus();
  }
},true);

pinConfirmInput?.addEventListener('keydown',event=>{
  if(event.key==='Enter' && isCreateMode() && !validatePins(true)){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});
