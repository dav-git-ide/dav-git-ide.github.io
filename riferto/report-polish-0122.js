const reportDialog=document.querySelector('#reportDialog');
const reportForm=document.querySelector('#reportForm');
const dialogTitle=document.querySelector('#dialogTitle');

const eyeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.3-5 9-5 9 5 9 5-3.3 5-9 5-9-5-9-5Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
const editIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16-.8 4 4-.8L18 9.4 14.6 6 5 16Zm8.6-9 3.4-3.4L20.4 7 17 10.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const style=document.createElement('style');
style.textContent=`
.report-mode-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:7px}
.report-mode-btn svg{width:17px;height:17px;flex:none}
#reportForm.report-view-mode .measurement-compact-chevron{display:none!important}
#reportForm.report-view-mode .measurement-compact-summary{grid-template-columns:minmax(0,1fr) auto!important}
`;
document.head.appendChild(style);

function decorateModeButtons(){
  const view=reportForm?.querySelector('[data-report-mode="view"]');
  const edit=reportForm?.querySelector('[data-report-mode="edit"]');
  if(view&&!view.dataset.iconDone){view.dataset.iconDone='1';view.innerHTML=`${eyeIcon}<span>Visualizza</span>`}
  if(edit&&!edit.dataset.iconDone){edit.dataset.iconDone='1';edit.innerHTML=`${editIcon}<span>Modifica</span>`}
}
function syncTitle(){
  if(!dialogTitle||!reportForm)return;
  const existing=Boolean(document.querySelector('#reportId')?.value);
  if(!existing){dialogTitle.textContent='Nuovo referto';return}
  dialogTitle.textContent=reportForm.classList.contains('report-view-mode')?'Visualizza referto':'Modifica referto';
}
function sync(){decorateModeButtons();syncTitle()}

reportForm?.addEventListener('click',event=>{if(event.target.closest('[data-report-mode]'))requestAnimationFrame(sync)});
if(reportForm)new MutationObserver(sync).observe(reportForm,{attributes:true,attributeFilter:['class']});
if(reportDialog)new MutationObserver(()=>{if(reportDialog.open)setTimeout(sync,260)}).observe(reportDialog,{attributes:true,attributeFilter:['open']});
sync();
