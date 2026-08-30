const settingsStack=document.querySelector('.settings-stack');

const icons={
  update:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M18.2 9A7 7 0 0 0 6.5 6.5L4 9m16 6-2.5 2.5A7 7 0 0 1 5.8 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  security:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5.5 6v5.5c0 4.1 2.5 7.7 6.5 9.5 4-1.8 6.5-5.4 6.5-9.5V6L12 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 12 11 13.5l3.5-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  data:`<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5.5" rx="7" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
  app:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 7h6M10 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  language:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 12h17M12 3c2.4 2.4 3.5 5.4 3.5 9S14.4 18.6 12 21M12 3C9.6 5.4 8.5 8.4 8.5 12s1.1 6.6 3.5 9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  support:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h11v5.5A5.5 5.5 0 0 1 10.5 19h0A5.5 5.5 0 0 1 5 13.5V8Zm11 2h1.5a2.5 2.5 0 0 1 0 5H16M7 4.5c0 1 1 1 1 2M11 4.5c0 1 1 1 1 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  legal:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.5v6M12 7.2h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};

const style=document.createElement('style');
style.textContent=`
.settings-stack{gap:10px!important}
.settings-accordion{padding:0!important;overflow:hidden;border-radius:22px}
.settings-accordion>summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:42px minmax(0,1fr) 20px;align-items:center;gap:12px;padding:15px 16px;min-height:70px}
.settings-accordion>summary::-webkit-details-marker{display:none}
.settings-flat-icon{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:rgba(45,134,255,.09);color:#236fd8}
.settings-flat-icon svg{width:22px;height:22px}
.settings-summary-copy{min-width:0;display:grid;gap:2px}
.settings-summary-copy strong{font-size:.91rem;line-height:1.2}
.settings-summary-copy small{font-size:.7rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.settings-chevron{font-size:1.25rem;color:var(--muted);transform:rotate(0);transition:transform .18s ease}
.settings-accordion[open] .settings-chevron{transform:rotate(90deg)}
.settings-accordion-body{padding:0 16px 16px;border-top:1px solid rgba(80,105,140,.08)}
.settings-accordion-body>.eyebrow:first-child,.settings-accordion-body>div:first-child>.eyebrow:first-child{display:none}
.settings-accordion-body h3{margin-top:14px}
.settings-accordion .settings-disclosure{margin-top:10px}
.settings-accordion.update-available-card.hidden{display:none!important}
@media(max-width:520px){.settings-accordion>summary{grid-template-columns:38px minmax(0,1fr) 18px;padding:13px 14px;min-height:64px}.settings-flat-icon{width:38px;height:38px;border-radius:12px}.settings-flat-icon svg{width:20px;height:20px}.settings-accordion-body{padding:0 14px 14px}}
`;
document.head.appendChild(style);

function cardMeta(card){
  if(card.id==='settingsUpdateAvailable')return{icon:'update',title:'Aggiornamento disponibile',subtitle:'Nuova versione di Riferto'};
  if(card.classList.contains('data-tools-card'))return{icon:'data',title:'Dati e strumenti',subtitle:'Backup, ripristino e catalogo LOINC'};
  if(card.classList.contains('support-card'))return{icon:'support',title:'Supporta Riferto',subtitle:'Buy me a coffee'};
  if(card.classList.contains('legal-card'))return{icon:'legal',title:'Informazioni',subtitle:'Licenza, copyright e LOINC'};
  const heading=card.querySelector('h3')?.textContent?.trim()||'Impostazioni';
  if(/accesso|sicurezza/i.test(heading))return{icon:'security',title:'Sicurezza',subtitle:'Face ID, PIN e blocco archivio'};
  if(/aggiornamento/i.test(heading))return{icon:'app',title:'Aggiornamento app',subtitle:'Versione e aggiornamenti'};
  if(/interfaccia|lingua/i.test(heading))return{icon:'language',title:'Lingua',subtitle:'Italiano o English'};
  return{icon:'app',title:heading,subtitle:'Tocca per aprire'};
}

function compactCard(card){
  if(card.dataset.settingsAccordion==='1')return;
  card.dataset.settingsAccordion='1';
  const meta=cardMeta(card);
  const details=document.createElement('details');
  details.className=`glass settings-card settings-accordion ${card.className.replace(/\bglass\b|\bsettings-card\b/g,'').trim()}`.trim();
  if(card.id)details.id=card.id;
  if(card.classList.contains('hidden'))details.classList.add('hidden');
  const summary=document.createElement('summary');
  summary.innerHTML=`<span class="settings-flat-icon">${icons[meta.icon]}</span><span class="settings-summary-copy"><strong>${meta.title}</strong><small>${meta.subtitle}</small></span><span class="settings-chevron">›</span>`;
  const body=document.createElement('div');
  body.className='settings-accordion-body';
  while(card.firstChild)body.appendChild(card.firstChild);
  details.append(summary,body);
  card.replaceWith(details);
}

function reorder(){
  const support=settingsStack?.querySelector(':scope > .support-card');
  if(support&&settingsStack.firstElementChild!==support)settingsStack.prepend(support);
}
function compactAll(){[...(settingsStack?.querySelectorAll(':scope > article.settings-card')||[])].forEach(compactCard);reorder()}
if(settingsStack){compactAll();new MutationObserver(()=>{compactAll();reorder()}).observe(settingsStack,{childList:true})}
