const settingsButton=document.querySelector('[data-app-section="settings"]');
const settingsSection=document.querySelector('.app-section[data-section="settings"]');
const updateCard=document.querySelector('#settingsUpdateAvailable');

function badge(){return settingsButton?.querySelector('.nav-notification')||null}
function updatePending(){return Boolean(updateCard&&!updateCard.classList.contains('hidden'))}
function settingsOpen(){return Boolean(settingsSection?.classList.contains('active'))}
function syncBadge(){
  const el=badge();
  if(!el)return;
  el.classList.toggle('hidden',!updatePending()||settingsOpen());
}

if(settingsSection)new MutationObserver(syncBadge).observe(settingsSection,{attributes:true,attributeFilter:['class']});
if(updateCard)new MutationObserver(syncBadge).observe(updateCard,{attributes:true,attributeFilter:['class']});
if(settingsButton)new MutationObserver(syncBadge).observe(settingsButton,{childList:true,subtree:true});
document.querySelectorAll('[data-app-section]').forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(syncBadge)));
setTimeout(syncBadge,650);
