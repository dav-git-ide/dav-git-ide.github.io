const lockScreen=document.querySelector('#lockScreen');
const appShell=document.querySelector('#appShell');
const bottomNav=document.querySelector('#bottomNav');
const sectionButtons=[...document.querySelectorAll('[data-app-section]')];
const sections=[...document.querySelectorAll('.app-section')];

const reportUiStyle=document.createElement('style');
reportUiStyle.textContent=`
#reportForm>.grid.two{grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);gap:14px}
#reportForm>.grid.two>.field{min-width:0}
#reportForm>.grid.two>.field input{min-width:0;width:100%;max-width:100%;box-sizing:border-box}
#reportDate{-webkit-appearance:none;appearance:none}
@media(max-width:360px){#reportForm>.grid.two{grid-template-columns:1fr}}
.test-search:focus{border-color:rgba(39,111,226,.55)!important;box-shadow:0 0 0 4px rgba(39,111,226,.1)!important}
`;
document.head.appendChild(reportUiStyle);

function selectSection(name){
  sections.forEach(section=>section.classList.toggle('active',section.dataset.section===name));
  sectionButtons.forEach(button=>{
    const active=button.dataset.appSection===name;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',String(active));
  });
  if(appShell)appShell.scrollTo({top:0,behavior:'auto'});
}

sectionButtons.forEach(button=>button.addEventListener('click',()=>selectSection(button.dataset.appSection)));

const addMeasurementBtn=document.querySelector('#addMeasurementBtn');
addMeasurementBtn?.addEventListener('click',()=>{
  requestAnimationFrame(()=>{
    const rows=[...document.querySelectorAll('#measurementEditor .measurement-row')];
    const search=rows.at(-1)?.querySelector('.test-search');
    if(!search)return;
    search.placeholder='Cerca esame o codice LOINC';
    search.setAttribute('autocomplete','off');
    search.setAttribute('enterkeyhint','search');
    search.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{search.focus({preventScroll:true});search.select?.()},120);
  });
});

function applyLockState(){
  const locked=Boolean(lockScreen && !lockScreen.classList.contains('hidden'));
  document.body.classList.toggle('vault-locked',locked);
  if(locked){
    appShell?.classList.add('hidden');
    appShell?.setAttribute('aria-hidden','true');
    appShell?.setAttribute('inert','');
    bottomNav?.classList.add('hidden');
  }else{
    appShell?.classList.remove('hidden');
    appShell?.setAttribute('aria-hidden','false');
    appShell?.removeAttribute('inert');
    bottomNav?.classList.remove('hidden');
  }
}

if(lockScreen)new MutationObserver(applyLockState).observe(lockScreen,{attributes:true,attributeFilter:['class']});
applyLockState();
selectSection('reports');
