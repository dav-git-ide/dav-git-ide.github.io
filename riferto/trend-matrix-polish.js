const trendSection=document.querySelector('.app-section[data-section="trend"]');

const style=document.createElement('style');
style.textContent=`
.trend-table-wrap{max-width:100%;overflow-x:auto!important;-webkit-overflow-scrolling:touch}
.trend-matrix{width:max-content!important;min-width:100%!important;table-layout:auto!important}
.trend-matrix th:first-child,.trend-matrix td:first-child{width:170px!important;min-width:170px!important;max-width:170px!important;white-space:normal!important;vertical-align:top!important;overflow:hidden!important}
.trend-matrix td:first-child strong{display:block;white-space:normal!important;overflow-wrap:anywhere;word-break:normal;line-height:1.14;font-size:.78rem}
.trend-matrix td:first-child small{display:block;margin-top:3px;white-space:normal!important;line-height:1.1;color:var(--muted);font-size:.64rem}
.trend-matrix .trend-exam-short{display:block;font-size:.82rem;font-weight:850;line-height:1.05}
.trend-matrix .trend-exam-long{display:block;margin-top:2px;font-size:.68rem;font-weight:700;line-height:1.12;color:var(--text);overflow-wrap:anywhere}
.trend-matrix td:not(:first-child),.trend-matrix th:not(:first-child){min-width:112px;white-space:nowrap!important}
@media(max-width:520px){
  .trend-matrix th:first-child,.trend-matrix td:first-child{width:138px!important;min-width:138px!important;max-width:138px!important}
  .trend-matrix td:not(:first-child),.trend-matrix th:not(:first-child){min-width:104px}
}
`;
document.head.appendChild(style);

function splitExamName(name){
  const text=String(name||'').trim();
  const match=text.match(/^([A-Z][A-Z0-9]{1,8})\s*[-–—]\s*(.+)$/);
  return match?{short:match[1],long:match[2]}:{short:'',long:text};
}

function polishMatrix(){
  trendSection?.querySelectorAll('.trend-matrix tbody td:first-child').forEach(cell=>{
    if(cell.dataset.matrixPolished==='1')return;
    const strong=cell.querySelector('strong');
    if(!strong)return;
    const parts=splitExamName(strong.textContent);
    if(parts.short){
      strong.innerHTML=`<span class="trend-exam-short">${parts.short}</span><span class="trend-exam-long">${parts.long}</span>`;
    }
    cell.dataset.matrixPolished='1';
  });
}

if(trendSection)new MutationObserver(()=>requestAnimationFrame(polishMatrix)).observe(trendSection,{childList:true,subtree:true});
polishMatrix();
