const lang=()=>localStorage.getItem('riferto-lang')||'it';
let catalog=[];

function nameOf(item){return item.names?.[lang()]||item.names?.it||item.names?.en||item.loincName||item.code}
function descriptionOf(item){return item.description?.[lang()]||item.description?.it||item.description?.en||''}
function normalize(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function score(item,q){const n=normalize(nameOf(item)),c=normalize(item.code),d=normalize(descriptionOf(item));if(c===q||n===q)return 0;if(c.startsWith(q)||n.startsWith(q))return 1;if(n.includes(q)||c.includes(q))return 2;if(d.includes(q))return 3;return 99}

const style=document.createElement('style');
style.textContent=`
.loinc-autocomplete{position:relative;min-width:0}
.loinc-results{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:40000;display:none;max-height:280px;overflow-y:auto;overflow-x:hidden;border-radius:18px;border:1px solid rgba(255,255,255,.82);background:rgba(248,251,255,.98);box-shadow:0 18px 45px rgba(31,54,88,.2);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px)}
.loinc-results.open{display:block}
.loinc-result{width:100%;border:0;background:transparent;text-align:left;padding:12px 14px;display:block;color:#10203a;overflow:hidden}
.loinc-result+.loinc-result{border-top:1px solid rgba(80,104,140,.1)}
.loinc-result strong{display:block;font-size:.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.loinc-result small{display:block;margin-top:3px;color:#61708a;font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.loinc-empty{padding:13px 14px;color:#61708a;font-size:.8rem}
`;
document.head.appendChild(style);

function closeAll(except=null){document.querySelectorAll('.loinc-results.open').forEach(el=>{if(el!==except)el.classList.remove('open')})}

function attach(input){
  if(input.dataset.loincAutocomplete==='1')return;
  input.dataset.loincAutocomplete='1';input.removeAttribute('list');
  const field=input.closest('.field');if(!field)return;field.classList.add('loinc-autocomplete');
  const results=document.createElement('div');results.className='loinc-results';field.appendChild(results);
  const render=()=>{
    const q=normalize(input.value);if(!q){results.innerHTML='';results.classList.remove('open');return}
    const matches=catalog.map(item=>({item,s:score(item,q)})).filter(x=>x.s<99).sort((a,b)=>a.s-b.s||nameOf(a.item).localeCompare(nameOf(b.item))).slice(0,12).map(x=>x.item);
    if(!matches.length){results.innerHTML='<div class="loinc-empty">Nessun esame trovato</div>';results.classList.add('open');closeAll(results);return}
    results.innerHTML='';
    for(const item of matches){
      const button=document.createElement('button');button.type='button';button.className='loinc-result';
      const strong=document.createElement('strong');strong.textContent=nameOf(item);
      const small=document.createElement('small');small.textContent=`LOINC ${item.code}${descriptionOf(item)?` · ${descriptionOf(item)}`:''}`;
      button.append(strong,small);button.addEventListener('pointerdown',e=>e.preventDefault());
      button.addEventListener('click',()=>{
        const row=input.closest('.measurement-row');
        input.value=`${item.code} — ${nameOf(item)}`;row.dataset.loincCode=item.code;
        const unit=row.querySelector('.test-unit');if(unit&&!unit.value&&item.commonUnits?.[0])unit.value=item.commonUnits[0];
        results.classList.remove('open');input.dispatchEvent(new Event('change',{bubbles:true}));row.dispatchEvent(new CustomEvent('riferto:loinc-selected',{bubbles:true}));
        setTimeout(()=>row.querySelector('.test-value')?.focus(),60);
      });results.appendChild(button);
    }
    results.classList.add('open');closeAll(results);
  };
  input.addEventListener('input',render);input.addEventListener('focus',()=>{if(input.value&&!input.value.includes(' — '))render()});input.addEventListener('keydown',e=>{if(e.key==='Escape')results.classList.remove('open')});input.addEventListener('blur',()=>setTimeout(()=>results.classList.remove('open'),180));
}
function scan(){document.querySelectorAll('.test-search').forEach(attach)}
(async()=>{try{catalog=await fetch(`./loinc-common.json?t=${Date.now()}`,{cache:'no-store'}).then(r=>r.json())}catch(error){console.warn('LOINC search unavailable',error);catalog=[]}scan();new MutationObserver(scan).observe(document.body,{subtree:true,childList:true})})();
