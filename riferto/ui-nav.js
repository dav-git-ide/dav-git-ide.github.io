const lockScreen=document.querySelector('#lockScreen');
const appShell=document.querySelector('#appShell');
const bottomNav=document.querySelector('#bottomNav');
const sectionButtons=[...document.querySelectorAll('[data-app-section]')];
const sections=[...document.querySelectorAll('.app-section')];

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
