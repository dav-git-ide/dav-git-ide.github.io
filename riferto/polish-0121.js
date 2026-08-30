const bottomNav=document.querySelector('#bottomNav');
const reportDialog=document.querySelector('#reportDialog');
const reportForm=document.querySelector('#reportForm');
const reportId=document.querySelector('#reportId');
const measurementEditor=document.querySelector('#measurementEditor');

const style=document.createElement('style');
style.textContent=`
#bottomNav{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-auto-flow:column!important;align-items:stretch!important;gap:4px!important}
#bottomNav.hidden{display:none!important}
#bottomNav .bottom-nav-btn{min-width:0!important;width:100%!important;padding-inline:4px!important;white-space:nowrap!important}
#bottomNav .bottom-nav-btn .nav-icon{width:20px;height:20px;display:grid;place-items:center;margin-inline:auto}
#bottomNav .bottom-nav-btn span:last-child{font-size:.68rem}
.unit-power-tools{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px!important;overflow:visible!important;padding-top:8px!important}
.unit-power-tools .unit-power-btn{width:100%;min-width:0;text-align:center;padding:7px 4px!important}
.unit-power-tools .unit-power-btn[data-power]{grid-column:auto}
.report-mode-toggle.new-report-hidden{display:none!important}
@media(max-width:390px){
  #bottomNav .bottom-nav-btn span:last-child{font-size:.64rem}
  .unit-power-tools{grid-template-columns:repeat(3,minmax(0,1fr))}
}
`;
document.head.appendChild(style);

function ensureUnitButtons(row){
  const tools=row.querySelector('.unit-power-tools');
  const unit=row.querySelector('.test-unit');
  if(!tools||!unit)return;
  const wanted=['%','pg','g/L','g/dL','fL'];
  for(const value of wanted){
    if(tools.querySelector(`[data-unit="${CSS.escape(value)}"]`))continue;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='unit-power-btn';
    btn.dataset.unit=value;
    btn.textContent=value;
    btn.addEventListener('click',()=>{
      unit.value=value;
      unit.dispatchEvent(new Event('input',{bubbles:true}));
      unit.dispatchEvent(new Event('change',{bubbles:true}));
      tools.querySelectorAll('.unit-power-btn').forEach(x=>x.classList.toggle('active',x===btn));
    });
    const firstPower=tools.querySelector('[data-power]');
    if(firstPower)tools.insertBefore(btn,firstPower);else tools.appendChild(btn);
  }
}
function enhanceUnits(){document.querySelectorAll('#measurementEditor .measurement-row').forEach(ensureUnitButtons)}
if(measurementEditor)new MutationObserver(()=>requestAnimationFrame(enhanceUnits)).observe(measurementEditor,{childList:true,subtree:true});
enhanceUnits();

function syncReportModeVisibility(){
  const toggle=reportForm?.querySelector('.report-mode-toggle');
  if(!toggle)return;
  const isNew=!reportId?.value;
  toggle.classList.toggle('new-report-hidden',isNew);
  if(isNew){
    reportForm?.classList.remove('report-view-mode');
    toggle.querySelectorAll('[data-report-mode]').forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.reportMode==='edit');
      btn.disabled=btn.dataset.reportMode==='view';
    });
  }
}

if(reportDialog)new MutationObserver(()=>{
  if(reportDialog.open)setTimeout(syncReportModeVisibility,260);
}).observe(reportDialog,{attributes:true,attributeFilter:['open']});
if(reportId)new MutationObserver(syncReportModeVisibility).observe(reportId,{attributes:true,attributeFilter:['value']});
reportForm?.addEventListener('reset',()=>setTimeout(syncReportModeVisibility,0));
reportForm?.addEventListener('submit',()=>{
  const wasNew=!reportId?.value;
  if(wasNew){
    const toggle=reportForm.querySelector('.report-mode-toggle');
    toggle?.classList.add('new-report-hidden');
  }
},true);
