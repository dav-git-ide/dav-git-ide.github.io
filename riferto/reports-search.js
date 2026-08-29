const reportsSection=document.querySelector('.app-section[data-section="reports"]');
const hero=reportsSection?.querySelector('.hero');
const reportsList=document.querySelector('#reportsList');
const emptyState=document.querySelector('#emptyState');
const reportCount=document.querySelector('#reportCount');
const measurementCount=document.querySelector('#measurementCount');

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
.reports-stats-single{grid-template-columns:1fr!important}
.report-search-card{margin:0 0 14px;padding:14px;border-radius:24px;display:grid;grid-template-columns:minmax(0,1fr) minmax(145px,.58fr) auto;gap:10px;align-items:end}
.report-search-card.hidden{display:none!important}
.report-search-card .field{min-width:0}
.report-search-card input{min-width:0;width:100%}
.report-search-clear{min-width:46px;padding-inline:12px}
.report-filter-empty{padding:26px 20px;text-align:center;border-radius:24px}
.hero-actions{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:14px}
.hero-actions .primary-btn,.hero-actions .secondary-btn{margin:0!important;width:auto!important}
.hero-search-btn{min-width:52px;padding-inline:15px}
@media(max-width:620px){
  .app-shell{height:calc(100dvh - 94px - env(safe-area-inset-bottom))!important;padding-bottom:18px!important}
  .report-search-card{grid-template-columns:minmax(0,1fr) 132px auto;gap:8px;padding:12px}
  .report-search-card .field>span{font-size:.68rem}
  .report-search-card input{padding:10px 11px}
  .report-search-clear{min-width:42px;padding:9px}
  .hero-actions{grid-template-columns:minmax(0,1fr) 54px}
  .hero-search-btn{font-size:0;padding:0;display:grid;place-items:center}
  .hero-search-btn::before{content:'⌕';font-size:1.35rem;line-height:1}
}
@media(max-width:430px){.report-search-card{grid-template-columns:minmax(0,1fr) auto}.report-search-card .report-date-field{grid-column:1/2}.report-search-clear{grid-column:2/3;grid-row:2/3}}
`;
document.head.appendChild(style);

// Rimuove il contatore globale dei valori, lasciando solo il numero di referti.
if(measurementCount){
  const valueCard=measurementCount.closest('.stat-card');
  valueCard?.remove();
  reportCount?.closest('.grid.two')?.classList.add('reports-stats-single');
}

// Trasforma la CTA principale in una coppia Nuovo referto + Ricerca.
const newReportBtn=document.querySelector('#newReportBtn');
let searchToggle=null;
if(hero&&newReportBtn){
  newReportBtn.textContent='+ Nuovo referto';
  const actions=document.createElement('div');
  actions.className='hero-actions';
  newReportBtn.parentNode.insertBefore(actions,newReportBtn);
  actions.appendChild(newReportBtn);
  searchToggle=document.createElement('button');
  searchToggle.id='reportSearchToggle';
  searchToggle.className='secondary-btn hero-search-btn';
  searchToggle.type='button';
  searchToggle.textContent='Cerca';
  searchToggle.setAttribute('aria-expanded','false');
  searchToggle.setAttribute('aria-label','Cerca referti');
  actions.appendChild(searchToggle);
}

const card=document.createElement('section');
card.className='glass report-search-card hidden';
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
function compactReportCards(){
  const cards=[...(reportsList?.querySelectorAll('.report-card')||[])];
  for(const report of cards){
    const pill=report.querySelector('.pill');
    if(pill){
      const raw=parseInt(pill.textContent,10);
      if(Number.isFinite(raw))pill.textContent=`${raw} ${raw===1?'esame':'esami'}`;
    }
  }
}
function applyFilters(){
  compactReportCards();
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

searchToggle?.addEventListener('click',()=>{
  const opening=card.classList.contains('hidden');
  card.classList.toggle('hidden',!opening);
  searchToggle.setAttribute('aria-expanded',String(opening));
  if(opening)setTimeout(()=>textFilter.focus(),80);
});
textFilter.addEventListener('input',applyFilters);
dateFilter.addEventListener('change',applyFilters);
clearButton.addEventListener('click',()=>{textFilter.value='';dateFilter.value='';applyFilters();textFilter.focus()});
if(reportsList)new MutationObserver(()=>requestAnimationFrame(applyFilters)).observe(reportsList,{childList:true});
applyFilters();
