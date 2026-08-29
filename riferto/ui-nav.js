const lockScreen=document.querySelector('#lockScreen');
const appShell=document.querySelector('#appShell');
const bottomNav=document.querySelector('#bottomNav');
const sectionButtons=[...document.querySelectorAll('[data-app-section]')];
const sections=[...document.querySelectorAll('.app-section')];
const POWERS=[3,6,9,12];

const reportUiStyle=document.createElement('style');
reportUiStyle.textContent=`
html,body{width:100%;max-width:100%;overflow-x:hidden!important;overscroll-behavior-x:none!important}
body{touch-action:pan-y}
#appShell{width:100%;max-width:820px;overflow-x:hidden!important;overscroll-behavior-x:none!important}
#reportDialog{width:min(100%,820px)!important;max-width:100vw!important;margin:auto!important;padding:0 10px!important;overflow:hidden!important;box-sizing:border-box!important}
#reportDialog .sheet{width:100%!important;max-width:100%!important;margin:0!important;box-sizing:border-box!important;overflow-y:auto!important;overflow-x:hidden!important}
#reportForm{min-width:0;max-width:100%;overflow-x:hidden}
#reportForm>*{min-width:0;max-width:100%}
#reportForm>.grid.two{grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);gap:14px}
#reportForm>.grid.two>.field{min-width:0}
#reportForm>.grid.two>.field input{min-width:0;width:100%;max-width:100%;box-sizing:border-box}
#reportDate{-webkit-appearance:none;appearance:none}
#pdfInput{display:block;min-width:0;max-width:100%;width:100%}
#pdfStatus{display:block;max-width:100%;overflow-wrap:anywhere;word-break:break-word}
.pdf-attachment-list{display:grid;gap:8px;margin-top:9px}
.pdf-attachment-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border-radius:14px;background:rgba(255,255,255,.48)}
.pdf-attachment-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8rem}
.pdf-attachment-actions{display:flex;align-items:center;gap:9px;flex:none}
.measurement-row{min-width:0;max-width:100%;overflow:visible}
.measurement-row>*{min-width:0;max-width:100%}
.test-search:focus{border-color:rgba(39,111,226,.55)!important;box-shadow:0 0 0 4px rgba(39,111,226,.1)!important}
.measurement-compact-summary{display:none;width:100%;min-height:52px;border:0;background:transparent;padding:4px 2px;grid-template-columns:minmax(0,1fr) auto 20px;align-items:center;gap:10px;text-align:left;color:var(--text)}
.measurement-compact-name{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.measurement-compact-value{font-weight:800;white-space:nowrap;color:#334866}
.measurement-compact-chevron{font-size:1.35rem;line-height:1;color:var(--muted)}
.measurement-row.measurement-collapsed{padding:9px 13px;border-radius:18px}
.measurement-row.measurement-collapsed>.field,.measurement-row.measurement-collapsed>.measurement-fields,.measurement-row.measurement-collapsed>.remove-measurement,.measurement-row.measurement-collapsed>.measurement-range-split{display:none!important}
.measurement-row.measurement-collapsed>.measurement-compact-summary{display:grid}
.measurement-range-split{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.measurement-range-split .field{min-width:0}.measurement-range-split input{width:100%;min-width:0}
.measurement-row .test-range{display:none!important}
.unit-power-tools{display:flex;gap:6px;overflow-x:auto;padding:7px 0 0;scrollbar-width:none}
.unit-power-tools::-webkit-scrollbar{display:none}
.unit-power-btn{border:1px solid rgba(90,115,150,.14);background:rgba(255,255,255,.6);border-radius:999px;padding:6px 9px;font-size:.7rem;font-weight:750;color:var(--muted);white-space:nowrap}
.unit-power-btn.active{background:rgba(45,134,255,.12);border-color:rgba(45,134,255,.24);color:#1764e8}
.report-card{cursor:pointer}
.report-card .edit-report{display:none!important}
.report-card .open-pdf-list{display:inline-flex!important}
@media(max-width:520px){#reportForm>.grid.two{grid-template-columns:1fr;gap:10px}.measurement-compact-summary{grid-template-columns:minmax(0,1fr) auto 16px;gap:7px}.measurement-compact-name{font-size:.86rem}.measurement-compact-value{font-size:.82rem}}
`;
document.head.appendChild(reportUiStyle);

function selectSection(name){
  sections.forEach(section=>section.classList.toggle('active',section.dataset.section===name));
  sectionButtons.forEach(button=>{const active=button.dataset.appSection===name;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
  if(appShell)appShell.scrollTo({top:0,behavior:'auto'});
}
sectionButtons.forEach(button=>button.addEventListener('click',()=>selectSection(button.dataset.appSection)));

function measurementLabel(row){const raw=row.querySelector('.test-search')?.value?.trim()||'Esame';const parts=raw.split(' — ');return parts.length>1?parts.slice(1).join(' — '):raw}
function updateMeasurementSummary(row){const summary=row.querySelector('.measurement-compact-summary');if(!summary)return;summary.querySelector('.measurement-compact-name').textContent=measurementLabel(row);const value=row.querySelector('.test-value')?.value?.trim()||'—';const unit=row.querySelector('.test-unit')?.value?.trim()||'';summary.querySelector('.measurement-compact-value').textContent=[value,unit].filter(Boolean).join(' ')}
function collapseMeasurement(row){const search=row.querySelector('.test-search')?.value?.trim();const value=row.querySelector('.test-value')?.value?.trim();if(!search||!value)return;updateMeasurementSummary(row);row.classList.add('measurement-collapsed')}
function expandMeasurement(row,focusSelector='.test-search'){row.classList.remove('measurement-collapsed');requestAnimationFrame(()=>{row.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>row.querySelector(focusSelector)?.focus({preventScroll:true}),100)})}
function parseRange(value){const raw=String(value||'').trim();if(!raw)return['',''];const normalized=raw.replace(/[–—]/g,'-');const m=normalized.match(/^\s*([^\-]+?)\s*-\s*([^\-]+?)\s*$/);return m?[m[1].trim(),m[2].trim()]:[raw,'']}
function syncRange(row){const hidden=row.querySelector('.test-range');if(!hidden)return;const min=row.querySelector('.test-range-min')?.value.trim()||'';const max=row.querySelector('.test-range-max')?.value.trim()||'';hidden.value=min&&max?`${min}–${max}`:(min||max||'')}
function superscript(n){return String(n).replace(/0/g,'⁰').replace(/1/g,'¹').replace(/2/g,'²').replace(/3/g,'³').replace(/4/g,'⁴').replace(/5/g,'⁵').replace(/6/g,'⁶').replace(/7/g,'⁷').replace(/8/g,'⁸').replace(/9/g,'⁹')}
function exponentOf(unit){const u=String(unit||'');for(const n of [12,9,6,3]){const pretty=`10${superscript(n)}`;if(u.includes(pretty)||new RegExp(`10\\s*(?:\\^|\\*)?\\s*${n}`).test(u))return n}return null}
function replaceExponent(unit,n){const raw=String(unit||'').trim(),pretty=`10${superscript(n)}`;const rx=/10\s*(?:\^|\*)?\s*(?:3|6|9|12)|10[³⁶⁹]|10¹²/;if(rx.test(raw))return raw.replace(rx,pretty);if(/\/L\b/i.test(raw)){const suffix=raw.slice(raw.toLowerCase().indexOf('/l'));return`${pretty}${suffix}`}return`${pretty}/L`}
function refreshPowerButtons(row){const unit=row.querySelector('.test-unit'),tools=row.querySelector('.unit-power-tools');if(!unit||!tools)return;const exp=exponentOf(unit.value);tools.querySelectorAll('.unit-power-btn').forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.power)===exp))}
function addSmartFields(row){
  const hidden=row.querySelector('.test-range');
  if(hidden&&!row.querySelector('.measurement-range-split')){const [min,max]=parseRange(hidden.value);const split=document.createElement('div');split.className='measurement-range-split';split.innerHTML=`<label class="field"><span>Min</span><input class="test-range-min" inputmode="decimal" placeholder="Min"></label><label class="field"><span>Max</span><input class="test-range-max" inputmode="decimal" placeholder="Max"></label>`;hidden.closest('.field')?.insertAdjacentElement('afterend',split);split.querySelector('.test-range-min').value=min;split.querySelector('.test-range-max').value=max;split.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>syncRange(row)));syncRange(row)}
  const unit=row.querySelector('.test-unit');
  if(unit&&!row.querySelector('.unit-power-tools')){const tools=document.createElement('div');tools.className='unit-power-tools';for(const power of POWERS){const btn=document.createElement('button');btn.type='button';btn.className='unit-power-btn';btn.dataset.power=String(power);btn.textContent=`10${superscript(power)}/L`;btn.addEventListener('click',()=>{unit.value=replaceExponent(unit.value,power);unit.dispatchEvent(new Event('input',{bubbles:true}));refreshPowerButtons(row)});tools.appendChild(btn)}unit.closest('.field')?.appendChild(tools);unit.addEventListener('input',()=>refreshPowerButtons(row));unit.addEventListener('change',()=>refreshPowerButtons(row));refreshPowerButtons(row)}
}
function enhanceMeasurementRow(row){
  if(row.dataset.compactEnhanced==='1')return;row.dataset.compactEnhanced='1';
  const summary=document.createElement('button');summary.type='button';summary.className='measurement-compact-summary';summary.innerHTML='<span class="measurement-compact-name"></span><span class="measurement-compact-value"></span><span class="measurement-compact-chevron">›</span>';summary.setAttribute('aria-label','Modifica valore');summary.addEventListener('click',()=>expandMeasurement(row));row.prepend(summary);
  addSmartFields(row);row.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>updateMeasurementSummary(row)));row.addEventListener('focusout',()=>setTimeout(()=>{if(!row.contains(document.activeElement))collapseMeasurement(row)},140));row.addEventListener('riferto:loinc-selected',()=>{updateMeasurementSummary(row);setTimeout(()=>refreshPowerButtons(row),0)});updateMeasurementSummary(row);if(row.querySelector('.test-search')?.value?.trim()&&row.querySelector('.test-value')?.value?.trim())row.classList.add('measurement-collapsed')
}
function enhanceMeasurements(){document.querySelectorAll('#measurementEditor .measurement-row').forEach(enhanceMeasurementRow)}
const measurementEditor=document.querySelector('#measurementEditor');if(measurementEditor)new MutationObserver(enhanceMeasurements).observe(measurementEditor,{childList:true,subtree:true});

const addMeasurementBtn=document.querySelector('#addMeasurementBtn');addMeasurementBtn?.addEventListener('click',()=>{requestAnimationFrame(()=>{const editor=document.querySelector('#measurementEditor');const rows=[...editor.querySelectorAll('.measurement-row')];const newest=rows.at(-1);if(!newest)return;if(editor.firstElementChild!==newest)editor.prepend(newest);enhanceMeasurementRow(newest);newest.classList.remove('measurement-collapsed');const search=newest.querySelector('.test-search');search.placeholder='Cerca esame o codice LOINC';search.setAttribute('autocomplete','off');search.setAttribute('enterkeyhint','search');newest.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{search.focus({preventScroll:true});search.select?.()},120)})});

document.querySelector('#reportForm')?.addEventListener('submit',()=>document.querySelectorAll('#measurementEditor .measurement-row').forEach(syncRange),true);

function enhanceReportCard(card){
  if(card.dataset.pdfActionEnhanced==='1')return;const edit=card.querySelector('.edit-report');if(!edit)return;card.dataset.pdfActionEnhanced='1';
  const actions=card.querySelector('.report-actions');const open=document.createElement('button');open.type='button';open.className='text-btn open-pdf-list';open.textContent='Apri PDF';
  open.addEventListener('click',event=>{event.stopPropagation();edit.click();setTimeout(()=>{const dialog=document.querySelector('#reportDialog');const pdfButtons=[...document.querySelectorAll('#pdfStatus .pdf-open')];if(pdfButtons.length===1){pdfButtons[0].click();dialog?.close()}else if(pdfButtons.length===0){alert('Nessun PDF allegato.')}else document.querySelector('#pdfStatus')?.scrollIntoView({behavior:'smooth',block:'center'})},220)});
  actions?.appendChild(open);card.addEventListener('click',event=>{if(event.target.closest('button,a,input,label'))return;edit.click()});
}
function enhanceReportCards(){document.querySelectorAll('#reportsList .report-card').forEach(enhanceReportCard)}
const reportsList=document.querySelector('#reportsList');if(reportsList)new MutationObserver(enhanceReportCards).observe(reportsList,{childList:true});

function applyLockState(){const locked=Boolean(lockScreen&&!lockScreen.classList.contains('hidden'));document.body.classList.toggle('vault-locked',locked);if(locked){appShell?.classList.add('hidden');appShell?.setAttribute('aria-hidden','true');appShell?.setAttribute('inert','');bottomNav?.classList.add('hidden')}else{appShell?.classList.remove('hidden');appShell?.setAttribute('aria-hidden','false');appShell?.removeAttribute('inert');bottomNav?.classList.remove('hidden')}}
if(lockScreen)new MutationObserver(applyLockState).observe(lockScreen,{attributes:true,attributeFilter:['class']});
applyLockState();enhanceMeasurements();enhanceReportCards();selectSection('reports');