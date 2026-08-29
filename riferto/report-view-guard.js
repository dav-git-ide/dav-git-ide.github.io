const reportForm=document.querySelector('#reportForm');
const pdfInput=document.querySelector('#pdfInput');
const pdfHelp=pdfInput?.nextElementSibling;

function syncPdfViewMode(){
  if(!reportForm||!pdfInput)return;
  const viewing=reportForm.classList.contains('report-view-mode');
  pdfInput.disabled=viewing;
  if(viewing)pdfInput.value='';
  if(pdfHelp)pdfHelp.classList.toggle('hidden',viewing);
}

if(reportForm){
  new MutationObserver(syncPdfViewMode).observe(reportForm,{attributes:true,attributeFilter:['class']});
}

syncPdfViewMode();
