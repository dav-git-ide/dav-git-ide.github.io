const settingsButton=document.querySelector('[data-app-section="settings"]');
const updateCard=document.querySelector('#settingsUpdateAvailable');

const style=document.createElement('style');
style.textContent=`
#bottomNav [data-app-section="settings"]{position:relative}
#bottomNav .nav-notification{position:absolute!important;top:10px!important;right:calc(50% - 28px)!important;width:10px!important;height:10px!important;min-width:10px!important;padding:0!important;border-radius:50%!important;background:#e53935!important;border:2px solid rgba(255,255,255,.96)!important;box-shadow:0 1px 5px rgba(180,30,30,.24)!important;font-size:0!important;line-height:0!important;z-index:5!important}
#bottomNav .nav-notification.hidden{display:none!important}
`;
document.head.appendChild(style);

function badge(){return settingsButton?.querySelector('.nav-notification')||null}
function updatePending(){return Boolean(updateCard&&!updateCard.classList.contains('hidden'))}
function syncBadge(){
  const el=badge();
  if(!el)return;
  el.textContent='';
  el.removeAttribute('aria-label');
  el.setAttribute('aria-hidden','true');
  el.classList.toggle('hidden',!updatePending());
}

if(updateCard)new MutationObserver(syncBadge).observe(updateCard,{attributes:true,attributeFilter:['class']});
if(settingsButton)new MutationObserver(syncBadge).observe(settingsButton,{childList:true,subtree:true});
setTimeout(syncBadge,650);
