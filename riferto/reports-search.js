const reportsSection=document.querySelector('.app-section[data-section="reports"]');
const hero=reportsSection?.querySelector('.hero');
const reportsList=document.querySelector('#reportsList');
const emptyState=document.querySelector('#emptyState');

const style=document.createElement('style');
style.textContent=`
.app-section[data-section="reports"]{padding-bottom:calc(148px + env(safe-area-inset-bottom))}
#reportsView{padding-bottom:34px}
#reportsList{padding-bottom:18px}
.report-card:last-child{margin-bottom:18px}
.report-search-card{margin:0 0 14px;padding:14px;border-radius:24px;display:grid;grid-template-columns:minmax(0,1fr) minmax(145px,.58fr) auto;gap:10px;align-items:end}
.report-search-card .field{min-width:0}
.report-search-card input{min-width:0;width:100%}
.report-search-clear{min-width:46px;padding-inline:12px}
.report-filter-empty{padding:26px 20px;text-align:center;border-radius:24px}
@media(max-width:620px){.report-search-card{grid-template-columns:minmax(0,1fr) 132px auto;gap:8px;padding:12px}.report-search-card .field>span{font-size:.68rem}.report-search-card input{padding:10px 11px}.report-search-clear{min-width:42px;padding:9px}}
@media(max-width:430px){.report-search-card{grid-template-columns:minmax(0,1fr) auto}.report-search-card .report-date-field{grid-column:1/2}.report-search-clear{grid-column:2/3;grid-row:2/3}}
`;
document.head.appendChild(style);

const card=document.createElement('section');
card.className='glass report-search-card';
card.setAttribute('aria-label','Cerca referti');
card.innerHTML=`
  <label class="field"><span>Cerca struttura</span><input id="reportTextFilter" type="search" autocomplete="off" placeholder="Es. Abbiategrasso" /></label>
  <label class="field report-date-field"><span>Data</span><input id="reportDateFilter" type="date" /></label>
  <button id="reportFilterClear" class="secondary-btn report-search-clear" type="button" aria-label="Azzera filtri">✕</button>`;
if(hero)hero.insertAdjacentElement('afterend',card);

const textFilter=card.querySelector('#reportTextFilter');
const dateFilter=card.querySelector('#reportDateFilter');
const clearButton=card.querySelector('#reportFilterClear');
const noResults=document.createElement('div');
noResults.className='glass report-filter-empty hidden';
noResults.innerHTML='<h3>Nessun referto trovato</h3><p class="muted">Modifica o azzera i filtri di ricerca.</p>';
reportsList?.insertAdjacentElement('afterend',noResults);

function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function selectedDateLabel(){
  if(!dateFilter.value)return'';
  const locale=(localStorage.getItem('riferto-lang')||'it')==='it'?'it-IT':'en-GB';
  return normalize(new Intl.DateTimeFormat(locale,{dateStyle:'long'}).format(new Date(`${dateFilter.value}T12:00:00`)));
}
function applyFilters(){
  const q=normalize(textFilter.value);
  const wantedDate=selectedDateLabel();
  const cards=[...(reportsList?.querySelectorAll('.report-card')||[])];
  let visible=0;
  for(const report of cards){
    const laboratory=normalize(report.querySelector('.report-meta')?.textContent);
    const date=normalize(report.querySelector('.report-top h3')?.textContent);
    const matchesText=!q||laboratory.includes(q);
    const matchesDate=!wantedDate||date===wantedDate;
    const show=matchesText&&matchesDate;
    report.classList.toggle('hidden',!show);
    if(show)visible++;
  }
  const filtering=Boolean(q||dateFilter.value);
  noResults.classList.toggle('hidden',!filtering||visible>0||cards.length===0);
  if(emptyState)emptyState.classList.toggle('report-filtering',filtering);
}

textFilter.addEventListener('input',applyFilters);
dateFilter.addEventListener('change',applyFilters);
clearButton.addEventListener('click',()=>{textFilter.value='';dateFilter.value='';applyFilters();textFilter.focus()});
if(reportsList)new MutationObserver(()=>requestAnimationFrame(applyFilters)).observe(reportsList,{childList:true});
applyFilters();
