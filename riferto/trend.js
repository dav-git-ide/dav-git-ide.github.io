const section=document.querySelector('.app-section[data-section="trend"]');
const reportsList=document.querySelector('#reportsList');
if(!section)throw new Error('Trend section missing');

const style=document.createElement('style');
style.textContent=`
.trend-hero{padding:18px;margin-bottom:14px}.trend-hero h2{margin:4px 0 7px}.trend-search-card{padding:14px;margin-bottom:14px;display:grid;gap:12px}.trend-controls{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end}.trend-segment{display:grid;grid-template-columns:repeat(2,1fr);gap:3px;padding:3px;border-radius:14px;background:rgba(92,116,150,.1)}.trend-segment button{border:0;background:transparent;border-radius:11px;padding:8px 11px;font-weight:750;color:var(--muted)}.trend-segment button.active{background:rgba(255,255,255,.88);color:var(--text);box-shadow:0 1px 5px rgba(50,70,100,.08)}.trend-result{padding:15px;display:grid;gap:14px}.trend-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.trend-head h3{margin:0}.trend-unit{font-size:.72rem;color:var(--muted)}.trend-chart-wrap{width:100%;overflow:hidden}.trend-chart{display:block;width:100%;height:auto;min-height:220px}.trend-axis{stroke:rgba(70,94,126,.18);stroke-width:1}.trend-line{fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.trend-point{fill:currentColor}.trend-label{font-size:10px;fill:var(--muted)}.trend-value-label{font-size:10px;fill:var(--text);font-weight:700}.trend-empty{text-align:center;padding:28px 18px}.trend-table{width:100%;border-collapse:collapse;font-size:.78rem}.trend-table th,.trend-table td{padding:9px 6px;border-bottom:1px solid rgba(80,105,140,.09);text-align:left}.trend-table th:last-child,.trend-table td:last-child{text-align:right}.trend-note{font-size:.7rem;color:var(--muted)}@media(max-width:520px){.trend-controls{grid-template-columns:1fr}.trend-search-card{padding:12px}.trend-result{padding:13px}}
`;
document.head.appendChild(style);

section.innerHTML=`
<section class="glass trend-hero"><p class="eyebrow">Trend</p><h2>Segui i tuoi valori nel tempo</h2><p class="muted">Seleziona un esame presente nei referti e confronta l'andamento per mese o trimestre.</p></section>
<section class="glass trend-search-card">
  <label class="field"><span>Esame</span><select id="trendExam" class="glass-control"><option value="">Seleziona un esame</option></select></label>
  <div class="trend-controls"><div class="trend-segment" aria-label="Raggruppamento"><button type="button" data-group="month" class="active">Mese</button><button type="button" data-group="quarter">Trimestre</button></div><div class="trend-segment" aria-label="Vista"><button type="button" data-view="chart" class="active">Grafico</button><button type="button" data-view="table">Tabella</button></div></div>
</section>
<section id="trendOutput" class="glass trend-result"><div class="trend-empty"><strong>Seleziona un esame</strong><p class="muted">Il trend apparirà qui quando lo stesso esame è presente in uno o più referti.</p></div></section>`;

const examSelect=section.querySelector('#trendExam');
const output=section.querySelector('#trendOutput');
let groupMode='month',viewMode='chart';

const months={gennaio:1,febbraio:2,marzo:3,aprile:4,maggio:5,giugno:6,luglio:7,agosto:8,settembre:9,ottobre:10,novembre:11,dicembre:12,january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
function parseDateLabel(label){const p=String(label||'').trim().toLowerCase().replace(/,/g,'').split(/\s+/);if(p.length<3)return null;const day=Number(p[0]),month=months[p[1]],year=Number(p[2]);return day&&month&&year?{day,month,year}:null}
function numeric(v){const n=Number(String(v||'').replace(',','.').match(/[-+]?\d+(?:[.,]\d+)?/)?.[0]?.replace(',','.'));return Number.isFinite(n)?n:null}
function observations(){
  const out=[];
  for(const card of [...(reportsList?.querySelectorAll('.report-card')||[])]){
    const date=parseDateLabel(card.querySelector('.report-top h3')?.textContent);if(!date)continue;
    for(const item of [...card.querySelectorAll('.measurement-item')]){
      const name=item.querySelector('.measurement-name')?.textContent?.trim()||'';
      const codeText=item.querySelector('.measurement-code')?.textContent||'';
      const code=codeText.match(/LOINC\s+([^·\s]+)/i)?.[1]||name;
      const raw=item.querySelector('.measurement-value')?.textContent?.trim()||'';
      const value=numeric(raw);if(value===null)continue;
      const numberMatch=raw.match(/[-+]?\d+(?:[.,]\d+)?/);const unit=numberMatch?raw.slice((numberMatch.index||0)+numberMatch[0].length).trim():'';
      out.push({key:code,name,code,value,unit,date});
    }
  }
  return out;
}
function rebuildOptions(){const obs=observations(),current=examSelect.value;const map=new Map();for(const o of obs)if(!map.has(o.key))map.set(o.key,o);const items=[...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'it'));examSelect.innerHTML='<option value="">Seleziona un esame</option>'+items.map(o=>`<option value="${o.key.replace(/"/g,'&quot;')}">${o.name} · ${o.code}</option>`).join('');if(items.some(x=>x.key===current))examSelect.value=current;render()}
function periodKey(d){if(groupMode==='quarter')return `${d.year}-Q${Math.ceil(d.month/3)}`;return `${d.year}-${String(d.month).padStart(2,'0')}`}
function periodLabel(k){if(k.includes('-Q')){const [y,q]=k.split('-');return `${q} ${y}`}const [y,m]=k.split('-');return new Intl.DateTimeFormat('it-IT',{month:'short',year:'2-digit'}).format(new Date(Number(y),Number(m)-1,1))}
function aggregate(rows){const bins=new Map();for(const r of rows){const k=periodKey(r.date);if(!bins.has(k))bins.set(k,[]);bins.get(k).push(r.value)}return [...bins.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([key,vals])=>({key,label:periodLabel(key),value:vals.reduce((a,b)=>a+b,0)/vals.length,count:vals.length,min:Math.min(...vals),max:Math.max(...vals)}))}
function fmt(n){return Number.isInteger(n)?String(n):n.toLocaleString('it-IT',{maximumFractionDigits:2})}
function chartSvg(data){if(!data.length)return'';const w=640,h=250,p={l:42,r:18,t:28,b:42};let min=Math.min(...data.map(d=>d.value)),max=Math.max(...data.map(d=>d.value));if(min===max){min-=1;max+=1}const x=i=>p.l+(i*(w-p.l-p.r)/Math.max(1,data.length-1));const y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min);const path=data.map((d,i)=>`${i?'L':'M'} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ');const grid=[0,.25,.5,.75,1].map(t=>{const yy=p.t+t*(h-p.t-p.b),val=max-t*(max-min);return`<line class="trend-axis" x1="${p.l}" x2="${w-p.r}" y1="${yy}" y2="${yy}"/><text class="trend-label" x="4" y="${yy+3}">${fmt(val)}</text>`}).join('');const pts=data.map((d,i)=>`<circle class="trend-point" cx="${x(i)}" cy="${y(d.value)}" r="4"/><text class="trend-value-label" text-anchor="middle" x="${x(i)}" y="${Math.max(12,y(d.value)-9)}">${fmt(d.value)}</text><text class="trend-label" text-anchor="middle" x="${x(i)}" y="${h-14}">${d.label}</text>`).join('');return`<svg class="trend-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafico del trend">${grid}<path class="trend-line" d="${path}"/>${pts}</svg>`}
function render(){const key=examSelect.value;if(!key){output.innerHTML='<div class="trend-empty"><strong>Seleziona un esame</strong><p class="muted">Il trend apparirà qui quando lo stesso esame è presente in uno o più referti.</p></div>';return}const all=observations().filter(o=>o.key===key);if(!all.length)return;const latest=[...all].sort((a,b)=>`${b.date.year}-${b.date.month}-${b.date.day}`.localeCompare(`${a.date.year}-${a.date.month}-${a.date.day}`))[0];const rows=all.filter(o=>o.unit===latest.unit);const ignored=all.length-rows.length;const data=aggregate(rows);const body=viewMode==='chart'?`<div class="trend-chart-wrap">${chartSvg(data)}</div>`:`<div style="overflow-x:auto"><table class="trend-table"><thead><tr><th>Periodo</th><th>Media</th><th>N.</th><th>Min–Max</th></tr></thead><tbody>${data.map(d=>`<tr><td>${d.label}</td><td>${fmt(d.value)} ${latest.unit}</td><td>${d.count}</td><td>${fmt(d.min)}–${fmt(d.max)}</td></tr>`).join('')}</tbody></table></div>`;output.innerHTML=`<div class="trend-head"><div><h3>${latest.name}</h3><div class="trend-unit">LOINC ${latest.code} · ${latest.unit||'unità non indicata'}</div></div><span class="pill">${rows.length} valori</span></div>${body}${ignored?`<div class="trend-note">${ignored} valore/i con unità diversa non sono stati aggregati.</div>`:''}`}
examSelect.addEventListener('change',render);
section.querySelectorAll('[data-group]').forEach(btn=>btn.addEventListener('click',()=>{groupMode=btn.dataset.group;section.querySelectorAll('[data-group]').forEach(x=>x.classList.toggle('active',x===btn));render()}));
section.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{viewMode=btn.dataset.view;section.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===btn));render()}));
if(reportsList)new MutationObserver(()=>requestAnimationFrame(rebuildOptions)).observe(reportsList,{childList:true,subtree:true});
rebuildOptions();
