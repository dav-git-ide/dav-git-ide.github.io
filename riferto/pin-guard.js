const pinInput=document.querySelector('#pinInput');
const pinConfirmInput=document.querySelector('#pinConfirmInput');
const pinConfirmField=document.querySelector('#pinConfirmField');
const unlockBtn=document.querySelector('#unlockBtn');
const lockError=document.querySelector('#lockError');
const lockCard=document.querySelector('.lock-card');
let activeInput=pinInput;
let autoUnlockTimer=null;

function isCreateMode(){return pinConfirmField && !pinConfirmField.classList.contains('hidden')}
function dots(value){return Array.from({length:6},(_,i)=>`<span class="pin-dot${i<value.length?' filled':''}"></span>`).join('')}

function makeDisplay(input,label){
  const field=input?.closest('.field');
  if(!field)return null;
  input.readOnly=true;
  input.setAttribute('inputmode','none');
  input.setAttribute('autocomplete','off');
  input.setAttribute('aria-hidden','true');
  input.tabIndex=-1;
  input.classList.add('pin-native-hidden');
  const display=document.createElement('button');
  display.type='button';
  display.className='pin-display';
  display.setAttribute('aria-label',label);
  display.innerHTML=dots(input.value);
  field.appendChild(display);
  display.addEventListener('click',()=>{activeInput=input;syncDisplays()});
  return display;
}

const pinDisplay=makeDisplay(pinInput,'PIN');
const confirmDisplay=makeDisplay(pinConfirmInput,'Conferma PIN');

const keypad=document.createElement('div');
keypad.className='pin-keypad';
keypad.setAttribute('aria-label','Tastierino PIN');
keypad.innerHTML=`
  ${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" class="pin-key" data-pin-key="${n}">${n}</button>`).join('')}
  <span class="pin-key-spacer" aria-hidden="true"></span>
  <button type="button" class="pin-key" data-pin-key="0">0</button>
  <button type="button" class="pin-key pin-key-delete" data-pin-key="delete" aria-label="Cancella ultima cifra">⌫</button>`;
lockCard?.insertBefore(keypad,unlockBtn);

function syncDisplays(){
  if(pinDisplay){pinDisplay.innerHTML=dots(pinInput?.value||'');pinDisplay.classList.toggle('active',activeInput===pinInput)}
  if(confirmDisplay){confirmDisplay.innerHTML=dots(pinConfirmInput?.value||'');confirmDisplay.classList.toggle('active',activeInput===pinConfirmInput)}
}

function validatePins(showMessage=false){
  if(!isCreateMode())return true;
  const pin=pinInput?.value||'',confirm=pinConfirmInput?.value||'';
  if(pin.length<6||confirm.length<6){if(showMessage&&lockError)lockError.textContent='Inserisci 6 cifre in entrambi i campi.';return false}
  if(pin!==confirm){if(lockError)lockError.textContent='I PIN non coincidono.';return false}
  if(lockError&&(lockError.textContent==='I PIN non coincidono.'||lockError.textContent==='Inserisci 6 cifre in entrambi i campi.'))lockError.textContent='';
  return true;
}

function scheduleAutoUnlock(){
  clearTimeout(autoUnlockTimer);
  if(isCreateMode()||pinInput?.value.length!==6)return;
  autoUnlockTimer=setTimeout(()=>{
    if(!isCreateMode()&&pinInput?.value.length===6&&!unlockBtn?.disabled)unlockBtn?.click();
  },120);
}

function pressKey(key){
  if(!activeInput)return;
  if(key==='delete')activeInput.value=activeInput.value.slice(0,-1);
  else if(/^\d$/.test(key)&&activeInput.value.length<6)activeInput.value+=key;
  activeInput.dispatchEvent(new Event('input',{bubbles:true}));
  if(isCreateMode()&&activeInput===pinInput&&pinInput.value.length===6){activeInput=pinConfirmInput}
  syncDisplays();
  if(isCreateMode()&&pinInput.value.length===6&&pinConfirmInput.value.length===6)validatePins(false);
  else scheduleAutoUnlock();
}

keypad.addEventListener('click',event=>{
  const button=event.target.closest('[data-pin-key]');
  if(button)pressKey(button.dataset.pinKey);
});

unlockBtn?.addEventListener('click',event=>{
  clearTimeout(autoUnlockTimer);
  if(isCreateMode()&&!validatePins(true)){
    event.preventDefault();
    event.stopImmediatePropagation();
    activeInput=(pinInput?.value.length||0)<6?pinInput:pinConfirmInput;
    syncDisplays();
  }
},true);

new MutationObserver(()=>{
  clearTimeout(autoUnlockTimer);
  if(!isCreateMode())activeInput=pinInput;
  else if(!activeInput)activeInput=pinInput;
  syncDisplays();
}).observe(pinConfirmField,{attributes:true,attributeFilter:['class']});

syncDisplays();