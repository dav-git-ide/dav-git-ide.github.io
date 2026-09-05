const KEY='riferto-update-source-url';
const DEFAULT_SOURCE='https://making-lemonade.github.io/riferto/';

function normalizeSource(value){
  const url=new URL(String(value||DEFAULT_SOURCE).trim());
  if(url.protocol!=='https:'&&url.protocol!=='http:')throw new Error('Usa un URL http o https valido.');
  url.hash='';url.search='';
  if(!url.pathname.endsWith('/'))url.pathname+='/';
  return url.href;
}
function getSource(){
  try{return normalizeSource(localStorage.getItem(KEY)||DEFAULT_SOURCE)}catch{return DEFAULT_SOURCE}
}
function sourceState(){
  const source=new URL(getSource());
  const here=new URL('./',location.href);
  return{source,here,sameOrigin:source.origin===here.origin,sameBase:source.href===here.href};
}

window.RifertoUpdateSource={key:KEY,defaultSource:DEFAULT_SOURCE,get:getSource,normalize:normalizeSource};

const forceBtn=document.querySelector('#forceUpdateBtn');
const appCard=forceBtn?.closest('.settings-card');
if(appCard){
  const details=document.createElement('details');
  details.className='settings-disclosure update-source-settings';
  details.innerHTML=`
    <summary><span>Origine aggiornamenti</span><small>Gestisci URL app</small></summary>
    <div class="settings-disclosure-body">
      <label class="field"><span>URL sorgente Riferto</span><input id="updateSourceUrl" type="url" inputmode="url" autocomplete="url" spellcheck="false"></label>
      <p id="updateSourceInfo" class="caption"></p>
      <div class="settings-actions update-source-actions">
        <button id="saveUpdateSourceBtn" class="primary-btn" type="button">Salva URL</button>
        <button id="openUpdateSourceBtn" class="secondary-btn" type="button">Apri URL</button>
        <button id="resetUpdateSourceBtn" class="secondary-btn" type="button">Ripristina predefinito</button>
      </div>
      <p class="caption update-source-warning">Se l'indirizzo passa a un dominio diverso, il nuovo sito non può leggere automaticamente l'archivio locale del vecchio dominio. Esporta prima un backup <strong>.riferto</strong>.</p>
    </div>`;
  appCard.appendChild(details);
  const input=details.querySelector('#updateSourceUrl');
  const info=details.querySelector('#updateSourceInfo');
  const render=()=>{
    input.value=getSource();
    const s=sourceState();
    if(s.sameBase)info.textContent='Questa è la sorgente attualmente aperta.';
    else if(s.sameOrigin)info.textContent='URL diverso ma stesso dominio: l’archivio IndexedDB resta sulla stessa origine.';
    else info.textContent='Dominio diverso: prima del passaggio esporta un backup .riferto.';
  };
  details.querySelector('#saveUpdateSourceBtn').onclick=()=>{
    try{
      const value=normalizeSource(input.value);
      localStorage.setItem(KEY,value);
      render();
      window.dispatchEvent(new CustomEvent('riferto:update-source-changed',{detail:{url:value}}));
      alert('URL aggiornamenti salvato. I prossimi controlli useranno questo indirizzo.');
    }catch(e){alert(e?.message||'URL non valido.');}
  };
  details.querySelector('#resetUpdateSourceBtn').onclick=()=>{
    localStorage.removeItem(KEY);render();
    window.dispatchEvent(new CustomEvent('riferto:update-source-changed',{detail:{url:DEFAULT_SOURCE}}));
  };
  details.querySelector('#openUpdateSourceBtn').onclick=()=>{
    try{window.open(getSource(),'_blank','noopener,noreferrer')}catch{location.href=getSource()}
  };
  render();
}
