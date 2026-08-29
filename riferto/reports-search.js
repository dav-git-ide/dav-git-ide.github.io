const reportsSection=document.querySelector('.app-section[data-section="reports"]');
const hero=reportsSection?.querySelector('.hero');
const reportsList=document.querySelector('#reportsList');
const emptyState=document.querySelector('#emptyState');
const reportCount=document.querySelector('#reportCount');
const measurementCount=document.querySelector('#measurementCount');

const searchIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const trashIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const style=document.createElement('style');
style.textContent=`
.app-shell{height:calc(100dvh - 96px - env(safe-area-inset-bottom))!important;padding-bottom:24px!important;overflow-y:auto!important}
.app-section[data-section="reports"]{padding-bottom:30px}
#reportsView{padding-bottom:28px}
#reportsList{padding-bottom:12px}
.report-card:last-child{margin-bottom:14px}
.report-card .measurement-list{display:none!important}
.report-card{padding:16px 18px!important}
.report-card .report-top{align-items:center}
.report-card .report-actions{margin-top:10px;padding-top:10px;border-top:1px solid rgba(72,93,126,.08)}
.report-card .pill{white-space:nowrap}
.reports-stats-hidden{display:none!important}
.hero-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.hero-actions .primary-btn,.hero-actions .secondary-btn{margin:0!important;width:100%!important;min-width:0!important}
.hero-search-content{display:inline-flex;align-items:center;justify-content:center;gap:7px}
.hero-search-content svg{width:15px;height:15px;flex:none}
.report-search-card{margin:0 0 14px;padding:14px;border-radius:24px;display:grid;gap:12px;overflow:hidden}
.report-search-card.hidden{display:none!important}
.report-filter-row{display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:8px;align-items:end;min-width:0;max-width:100%}
.report-filter-row .field{min-width:0;max-width:100%;overflow:hidden}
.report-filter-row input{display:block;width:100%!important;max-width:100%!important;min-width:0!important;inline-size:100%!important;height:46px;box-sizing:border-box;-webkit-appearance:none;appearance:none}
#reportDateFilter{padding-right:12px!important}
.report-filter-trash{width:42px;height:46px;padding:0;border-radius:15px;border:1px solid rgba(177,36,36,.16);background:rgba(255,241,241,.92);color:#b12424;display:grid;place-items:center;flex:none}
.report-filter-trash svg{width:19px;height:19px}
.report-filter-trash:disabled{opacity:.28}
.report-filter-empty{padding:26px 20px;text-align:center;border-radius:24px}
.report-mode-switch{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0 14px;padding:4px;border-radius:16px;background:rgba(130,151,181,.1)}
.report-mode-switch.hidden{display:none!important}
.report-mode-btn{border:0;border-radius:12px;padding:9px 12px;background:transparent;color:var(--muted);font-weight:800;font-size:.78rem}
.report-mode-btn.active{background:rgba(255,255,255,.82);color:var(--text);box-shadow:0 2px 10px rgba(56,75,105,.08)}
#closeDialogBtn.report-close-btn{width:auto!important;min-width:0!important;height:38px!important;padding:0 10px!important;border-radius:19px!important;display:inline-flex!important;align-items:center;gap:5px;font-weight:800;font-size:.76rem}
#deleteReportBtn svg{width:16px;height:16px;vertical-align:-3px;margin-right:5px}
#reportForm .sheet-actions button[type="submit"].hidden{display:none!important}
#reportForm.report-view-mode input:not(#reportId),#reportForm.report-view-mode textarea{pointer-events:none!important;user-select:text}
#reportForm.report-view-mode #pdfInput,#reportForm.report-view-mode #pdfInput+small,#reportForm.report-view-mode #addMeasurementBtn,#reportForm.report-view-mode #deleteReportBtn,#reportForm.report-view-mode .pdf-remove,#reportForm.report-view-mode .remove-measurement,#reportForm.report-view-mode .unit-power-tools{display:none!important}
#reportForm.report-view-mode .measurement-row>.field,#reportForm.report-view-mode .measurement-row>.measurement-fields,#reportForm.report-view-mode .measurement-row>.measurement-range-split,#reportForm.report-view-mode .measurement-row>.remove-measurement{display:none!important}
#reportForm.report-view-mode .measurement-row>.measurement-compact-summary{display:grid!important}
#reportForm.report-view-mode .measurement-row{padding:9px 13px;border-radius:18px}
@media(max-width:620px){.app-shell{height:calc(100dvh - 94px - env(safe-area-inset-bottom))!important;padding-bottom:18px!important}.report-search-card{padding:12px}.report-search-card .field>span{font-size:.68rem}.report-filter-row input,.report-filter-trash{height:44px}}
`;
document.head.appendChild(style);

const statsGrid=reportCount?.closest('.grid.two');
statsGrid?.classList.add('reports-stats-hidden');
function updateHeroCount(){const count=Number.parseInt(reportCount?.textContent||'0',10)||0;const heading=hero?.querySelector('h2');if(heading)heading.textContent=`I tuoi ${count} ${count===1?'referto':'referti'}. Sul tuo dispositivo.`}
if(reportCount)new MutationObserver(updateHeroCount).observe(reportCount,{childList:true,characterData:true,subtree:true});updateHeroCount();

const newReportBtn=document.querySelector('#newReportBtn');
let searchToggle=null;
if(hero&&newReportBtn){newReportBtn.textContent='+ Nuovo referto';const actions=document.createElement('div');actions.className='hero-actions';newReportBtn.parentNode.insertBefore(actions,newReportBtn);actions.appendChild(newReportBtn);searchToggle=document.createElement('button');searchToggle.id='reportSearchToggle';searchToggle.className='secondary-btn';searchToggle.type='button';searchToggle.innerHTML=`<span class="hero-search-content">${searchIcon}<span>Cerca</span></span>`;searchToggle.setAttribute('aria-expanded','false');searchToggle.setAttribute('aria-label','Cerca referti');actions.appendChild(searchToggle)}

const card=document.createElement('section');
card.className='glass report-search-card hidden';card.setAttribute('aria-label','Cerca referti');card.innerHTML=`<div class="report-filter-row"><label class="field"><span>Cerca struttura</span><input id="reportTextFilter" type="search" autocomplete="off" placeholder="Es. Abbiategrasso" /></label><button id="clearTextFilter" class="report-filter-trash" type="button" aria-label="Cancella struttura" disabled>${trashIcon}</button></div><div class="report-filter-row"><label class="field"><span>Data</span><input id="reportDateFilter" type="date" /></label><button id="clearDateFilter" class="report-filter-trash" type="button" aria-label="Cancella data" disabled>${trashIcon}</button></div>`;
if(hero)hero.insertAdjacentElement('afterend',card);
const textFilter=card.querySelector('#reportTextFilter'),dateFilter=card.querySelector('#reportDateFilter'),clearText=card.querySelector('#clearTextFilter'),clearDate=card.querySelector('#clearDateFilter');
const noResults=document.createElement('div');noResults.className='glass report-filter-empty hidden';noResults.innerHTML='<h3>Nessun referto trovato</h3><p class="muted">Modifica o cancella i filtri di ricerca.</p>';reportsList?.insertAdjacentElement('afterend',noResults);
textFilter.value='';dateFilter.value='';
function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function selectedDateLabel(){if(!dateFilter.value)return'';const locale=(localStorage.getItem('riferto-lang')||'it')==='it'?'it-IT':'en-GB';return normalize(new Intl.DateTimeFormat(locale,{dateStyle:'long'}).format(new Date(`${dateFilter.value}T12:00:00`)))}
function compactReportCards(){for(const report of [...(reportsList?.querySelectorAll('.report-card')||[])]){const pill=report.querySelector('.pill');if(pill){const raw=parseInt(pill.textContent,10);if(Number.isFinite(raw))pill.textContent=`${raw} ${raw===1?'esame':'esami'}`}}}
function syncTrashButtons(){clearText.disabled=!textFilter.value;clearDate.disabled=!dateFilter.value}
function setEmptyStateFromCards(){const cards=[...(reportsList?.querySelectorAll('.report-card')||[])];if(emptyState)emptyState.classList.toggle('hidden',cards.length>0)}
function resetVisibleCards(){for(const report of [...(reportsList?.querySelectorAll('.report-card')||[])])report.classList.remove('hidden');noResults.classList.add('hidden');syncTrashButtons();setEmptyStateFromCards()}
function applyFilters(){compactReportCards();syncTrashButtons();const cards=[...(reportsList?.querySelectorAll('.report-card')||[])];setEmptyStateFromCards();if(card.classList.contains('hidden')){resetVisibleCards();return}const q=normalize(textFilter.value),wantedDate=selectedDateLabel();let visible=0;for(const report of cards){const laboratory=normalize(report.querySelector('.report-meta')?.textContent||''),date=normalize(report.querySelector('.report-top h3')?.textContent||'');const show=(!q||laboratory.includes(q))&&(!wantedDate||date===wantedDate);report.classList.toggle('hidden',!show);if(show)visible++}const filtering=Boolean(q||dateFilter.value);noResults.classList.toggle('hidden',!filtering||visible>0||cards.length===0)}
searchToggle?.addEventListener('click',()=>{const opening=card.classList.contains('hidden');card.classList.toggle('hidden',!opening);searchToggle.setAttribute('aria-expanded',String(opening));if(opening){resetVisibleCards();setTimeout(()=>textFilter.focus(),80)}else resetVisibleCards()});
textFilter.addEventListener('input',applyFilters);dateFilter.addEventListener('change',applyFilters);clearText.addEventListener('click',()=>{textFilter.value='';applyFilters();textFilter.focus()});clearDate.addEventListener('click',()=>{dateFilter.value='';dateFilter.blur();applyFilters()});
if(reportsList)new MutationObserver(()=>requestAnimationFrame(()=>{compactReportCards();applyFilters();updateHeroCount()})).observe(reportsList,{childList:true});compactReportCards();resetVisibleCards();updateHeroCount();

const reportDialog=document.querySelector('#reportDialog');
const reportForm=document.querySelector('#reportForm');
const closeDialogBtn=document.querySelector('#closeDialogBtn');
const saveReportBtn=reportForm?.querySelector('button[type="submit"]');
const deleteReportBtn=document.querySelector('#deleteReportBtn');
let reportDirty=false;
let reportMode='edit';
const modeSwitch=document.createElement('div');
modeSwitch.className='report-mode-switch hidden';
modeSwitch.innerHTML='<button type="button" class="report-mode-btn" data-report-mode="view">Visualizza</button><button type="button" class="report-mode-btn" data-report-mode="edit">Modifica</button>';
reportForm?.querySelector('.sheet-head')?.insertAdjacentElement('afterend',modeSwitch);
if(closeDialogBtn){closeDialogBtn.classList.add('report-close-btn');closeDialogBtn.innerHTML='<span aria-hidden="true">✕</span><span>Chiudi</span>'}
if(deleteReportBtn)deleteReportBtn.innerHTML=`${trashIcon}<span>Elimina referto</span>`;
function refreshSaveVisibility(){if(saveReportBtn)saveReportBtn.classList.toggle('hidden',!reportDirty||reportMode!=='edit')}
function setReportMode(mode){reportMode=mode;const view=mode==='view';reportForm?.classList.toggle('report-view-mode',view);modeSwitch.querySelectorAll('.report-mode-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.reportMode===mode));refreshSaveVisibility();if(view){document.activeElement?.blur();document.querySelectorAll('#measurementEditor .measurement-row').forEach(row=>row.classList.add('measurement-collapsed'))}}
function markReportDirty(){if(!reportDialog?.open)return;reportDirty=true;refreshSaveVisibility()}
modeSwitch.addEventListener('click',event=>{const btn=event.target.closest('[data-report-mode]');if(btn)setReportMode(btn.dataset.reportMode)});
reportForm?.addEventListener('input',markReportDirty);
reportForm?.addEventListener('change',markReportDirty);
reportForm?.addEventListener('click',event=>{if(event.target.closest('.pdf-remove,.remove-measurement,#addMeasurementBtn,.unit-power-btn'))markReportDirty()});
reportForm?.addEventListener('submit',()=>{reportDirty=false;refreshSaveVisibility()});
if(reportDialog)new MutationObserver(()=>{if(!reportDialog.open)return;setTimeout(()=>{reportDirty=false;const existing=Boolean(document.querySelector('#reportId')?.value);modeSwitch.classList.toggle('hidden',!existing);setReportMode(existing?'view':'edit');refreshSaveVisibility()},30)}).observe(reportDialog,{attributes:true,attributeFilter:['open']});