const lockScreen=document.querySelector('#lockScreen');
const appShell=document.querySelector('#appShell');
const bottomNav=document.querySelector('#bottomNav');
const sectionButtons=[...document.querySelectorAll('[data-app-section]')];
const sections=[...document.querySelectorAll('.app-section')];
let lockedScrollY=0;

function selectSection(name){
  sections.forEach(section=>section.classList.toggle('active',section.dataset.section===name));
  sectionButtons.forEach(button=>{
    const active=button.dataset.appSection===name;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',String(active));
  });
  window.scrollTo(0,0);
}

sectionButtons.forEach(button=>button.addEventListener('click',()=>selectSection(button.dataset.appSection)));

function syncBottomNav(){
  const appVisible=appShell && !appShell.classList.contains('hidden') && appShell.getAttribute('aria-hidden')==='false';
  const locked=lockScreen && !lockScreen.classList.contains('hidden');
  bottomNav?.classList.toggle('hidden',!appVisible||locked);
}

function applyLockState(){
  const locked=lockScreen && !lockScreen.classList.contains('hidden');
  const body=document.body;
  if(locked && !body.classList.contains('vault-locked')){
    lockedScrollY=window.scrollY;
    body.style.top=`-${lockedScrollY}px`;
    body.classList.add('vault-locked');
    appShell?.setAttribute('inert','');
  }else if(!locked && body.classList.contains('vault-locked')){
    body.classList.remove('vault-locked');
    body.style.top='';
    appShell?.removeAttribute('inert');
    window.scrollTo(0,lockedScrollY);
  }
  syncBottomNav();
}

if(lockScreen)new MutationObserver(applyLockState).observe(lockScreen,{attributes:true,attributeFilter:['class']});
if(appShell)new MutationObserver(syncBottomNav).observe(appShell,{attributes:true,attributeFilter:['class','aria-hidden']});

applyLockState();
selectSection('reports');
syncBottomNav();
