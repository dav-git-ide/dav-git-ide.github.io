const lockScreen=document.querySelector('#lockScreen');
const appShell=document.querySelector('#appShell');
const bottomNav=document.querySelector('#bottomNav');
const sectionButtons=[...document.querySelectorAll('[data-app-section]')];
const sections=[...document.querySelectorAll('.app-section')];

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
.measurement-row{min-width:0;max-width:100%;overflow:visible}
.measurement-row>*{min-width:0;max-width:100%}
.test-search:focus{border-color:rgba(39,111,226,.55)!important;box-shadow:0 0 0 4px rgba(39,111,226,.1)!important}
.measurement-compact-summary{display:none;width:100%;min-height:52px;border:0;background:transparent;padding:4px 2px;grid-template-columns:minmax(0,1fr) auto 20px;align-items:center;gap:10px;text-align:left;color:var(--text)}
.measurement-compact-name{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.measurement-compact-value{font-weight:800;white-space:nowrap;color:#334866}
.measurement-compact-chevron{font-size:1.35rem;line-height:1;color:var(--muted)}
.measurement-row.measurement-collapsed{padding:9px 13px;border-radius:18px}
.measurement-row.measurement-collapsed>.field,.measurement-row.measurement-collapsed>.measurement-fields,.measurement-row.measurement-collapsed>.remove-measurement{display:none!important}
.measurement-row.measurement-collapsed>.measurement-compact-summary{display:grid}
@media(max-width:520px){#reportForm>.grid.two{grid-template-columns:1fr;gap:10px}.measurement-compact-summary{grid-template-columns:minmax(0,1fr) auto 16px;gap:7px}.measurement-compact-name{font-size:.86rem}.measurement-compact-value{font-size:.82rem}}
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

function measurementLabel(row){
  const raw=row.querySelector('.test-search')?.value?.trim()||'Esame';
  const parts=raw.split(' — ');
  return parts.length>1?parts.slice(1).join(' — '):raw;
}
function updateMeasurementSummary(row){
  const summary=row.querySelector('.measurement-compact-summary');
  if(!summary)return;
  summary.querySelector('.measurement-compact-name').textContent=measurementLabel(row);
  const value=row.querySelector('.test-value')?.value?.trim()||'—';
  const unit=row.querySelector('.test-unit')?.value?.trim()||'';
  summary.querySelector('.measurement-compact-value').textContent=[value,unit].filter(Boolean).join(' ');
}
function collapseMeasurement(row){
  const search=row.querySelector('.test-search')?.value?.trim();
  const value=row.querySelector('.test-value')?.value?.trim();
  if(!search||!value)return;
  updateMeasurementSummary(row);
  row.classList.add('measurement-collapsed');
}
function expandMeasurement(row,focusSelector='.test-search'){
  row.classList.remove('measurement-collapsed');
  requestAnimationFrame(()=>{
    row.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>row.querySelector(focusSelector)?.focus({preventScroll:true}),100);
  });
}
function enhanceMeasurementRow(row){
  if(row.dataset.compactEnhanced==='1')return;
  row.dataset.compactEnhanced='1';
  const summary=document.createElement('button');
  summary.type='button';
  summary.className='measurement-compact-summary';
  summary.innerHTML='<span class="measurement-compact-name"></span><span class="measurement-compact-value"></span><span class="measurement-compact-chevron">›</span>';
  summary.setAttribute('aria-label','Modifica valore');
  summary.addEventListener('click',()=>expandMeasurement(row));
  row.prepend(summary);
  row.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>updateMeasurementSummary(row)));
  row.querySelector('.test-value')?.addEventListener('blur',()=>setTimeout(()=>collapseMeasurement(row),120));
  row.addEventListener('riferto:loinc-selected',()=>updateMeasurementSummary(row));
  updateMeasurementSummary(row);
  if(row.querySelector('.test-search')?.value?.trim()&&row.querySelector('.test-value')?.value?.trim())row.classList.add('measurement-collapsed');
}
function enhanceMeasurements(){document.querySelectorAll('#measurementEditor .measurement-row').forEach(enhanceMeasurementRow)}
const measurementEditor=document.querySelector('#measurementEditor');
if(measurementEditor)new MutationObserver(enhanceMeasurements).observe(measurementEditor,{childList:true,subtree:true});

const addMeasurementBtn=document.querySelector('#addMeasurementBtn');
addMeasurementBtn?.addEventListener('click',()=>{
  requestAnimationFrame(()=>{
    const editor=document.querySelector('#measurementEditor');
    const rows=[...editor.querySelectorAll('.measurement-row')];
    const newest=rows.at(-1);
    if(!newest)return;
    if(editor.firstElementChild!==newest)editor.prepend(newest);
    enhanceMeasurementRow(newest);
    newest.classList.remove('measurement-collapsed');
    const search=newest.querySelector('.test-search');
    search.placeholder='Cerca esame o codice LOINC';
    search.setAttribute('autocomplete','off');
    search.setAttribute('enterkeyhint','search');
    newest.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{search.focus({preventScroll:true});search.select?.()},120);
  });
});

function applyLockState(){
  const locked=Boolean(lockScreen&&!lockScreen.classList.contains('hidden'));
  document.body.classList.toggle('vault-locked',locked);
  if(locked){appShell?.classList.add('hidden');appShell?.setAttribute('aria-hidden','true');appShell?.setAttribute('inert','');bottomNav?.classList.add('hidden')}
  else{appShell?.classList.remove('hidden');appShell?.setAttribute('aria-hidden','false');appShell?.removeAttribute('inert');bottomNav?.classList.remove('hidden')}
}
if(lockScreen)new MutationObserver(applyLockState).observe(lockScreen,{attributes:true,attributeFilter:['class']});
applyLockState();
enhanceMeasurements();
selectSection('reports');
