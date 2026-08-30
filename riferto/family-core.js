const DB_NAME='riferto-db',DB_VERSION=1,META_STORE='meta';
const reportsList=document.querySelector('#reportsList');
const reportForm=document.querySelector('#reportForm');
const reportIdInput=document.querySelector('#reportId');
const reportDate=document.querySelector('#reportDate');
const laboratory=document.querySelector('#laboratory');
const notes=document.querySelector('#notes');
const editor=document.querySelector('#measurementEditor');
const reportCount=document.querySelector('#reportCount');
const measurementCount=document.querySelector('#measurementCount');
const ACTIVE_KEY='riferto-active-person';
let applying=false;

function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function metaGet(id){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(META_STORE,'readonly'),r=tx.objectStore(META_STORE).get(id);r.onsuccess=()=>{db.close();resolve(r.result)};r.onerror=()=>{db.close();reject(r.error)}})}
async function metaPut(value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(META_STORE,'readwrite'),r=tx.objectStore(META_STORE).put(value);r.onsuccess=()=>{db.close();resolve(value)};r.onerror=()=>{db.close();reject(r.error)}})}
function id(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}
function normalize(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function selectedPerson(){return localStorage.getItem(ACTIVE_KEY)||''}
function dispatch(name,detail={}){window.dispatchEvent(new CustomEvent(name,{detail}))}

async function ensureProfiles(){let row=await metaGet('family:profiles');if(!row?.profiles?.length){const p={id:id(),name:'Io',birthDate:'',sex:'',createdAt:new Date().toISOString()};row={id:'family:profiles',profiles:[p]};await metaPut(row);localStorage.setItem(ACTIVE_KEY,p.id)}else if(!row.profiles.some(p=>p.id===selectedPerson()))localStorage.setItem(ACTIVE_KEY,row.profiles[0].id);return row.profiles}
async function listProfiles(){return (await ensureProfiles()).map(p=>({...p}))}
async function saveProfiles(profiles){await metaPut({id:'family:profiles',profiles});return profiles}
async function addProfile(data){const profiles=await listProfiles(),p={id:id(),name:String(data.name||'Persona').trim()||'Persona',birthDate:data.birthDate||'',sex:data.sex||'',createdAt:new Date().toISOString()};profiles.push(p);await saveProfiles(profiles);await setActivePersonId(p.id);return p}
async function updateProfile(personId,data){const profiles=await listProfiles(),i=profiles.findIndex(p=>p.id===personId);if(i<0)throw new Error('Persona non trovata.');profiles[i]={...profiles[i],name:String(data.name||profiles[i].name).trim()||profiles[i].name,birthDate:data.birthDate??profiles[i].birthDate,sex:data.sex??profiles[i].sex};await saveProfiles(profiles);dispatch('riferto:family-ready');return profiles[i]}
async function deleteProfile(personId){const profiles=await listProfiles();if(profiles.length<=1)throw new Error('Deve rimanere almeno una persona.');const mappings=await getMappings();if(Object.values(mappings).some(x=>x.personId===personId))throw new Error('Questa persona ha referti associati. Spostali o eliminali prima.');const next=profiles.filter(p=>p.id!==personId);await saveProfiles(next);if(selectedPerson()===personId)await setActivePersonId(next[0].id);dispatch('riferto:family-ready')}
async function setActivePersonId(personId){localStorage.setItem(ACTIVE_KEY,personId);await applyPersonFilter();dispatch('riferto:person-changed',{personId});return personId}
function getActivePersonId(){return selectedPerson()}

async function getMappings(){return (await metaGet('family:report-map'))?.map||{}}
async function setMapping(reportId,data){const row=await metaGet('family:report-map')||{id:'family:report-map',map:{}};row.map[reportId]={...(row.map[reportId]||{}),...data};await metaPut(row);return row.map[reportId]}
function measurementFingerprintFromForm(){return [...(editor?.querySelectorAll('.measurement-row')||[])].map(row=>{const exam=row.querySelector('.test-search')?.value?.trim()||'',value=row.querySelector('.test-value')?.value?.trim()||'',unit=row.querySelector('.test-unit')?.value?.trim()||'';return`${exam}|${value}|${unit}`}).join('||')}
function formSignature(){return[reportDate?.value||'',normalize(laboratory?.value),normalize(notes?.value),normalize(measurementFingerprintFromForm())].join('::')}
function cardSignature(card){const date=card.querySelector('.report-top h3')?.textContent?.trim()||'',lab=normalize(card.querySelector('.report-meta')?.textContent),note=normalize(card.querySelector('.catalog-desc')?.textContent),ms=[...card.querySelectorAll('.measurement-item')].map(item=>`${normalize(item.querySelector('.measurement-name')?.textContent)}|${normalize(item.querySelector('.measurement-value')?.textContent)}`).join('||');return{date,lab,note,ms}}
function isoToLongDate(iso){if(!iso)return'';try{return new Intl.DateTimeFormat('it-IT',{dateStyle:'long'}).format(new Date(`${iso}T12:00:00`))}catch{return iso}}
function mappingMatchesCard(m,card){const s=cardSignature(card);if(normalize(isoToLongDate(m.date))!==normalize(s.date))return false;if(normalize(m.laboratory)!==s.lab)return false;if(normalize(m.notes||'')!==s.note)return false;return true}

async function getUnitPreferences(){return (await metaGet('family:unit-preferences'))?.map||{}}
function prefKey(personId,lab,loinc){return`${personId}::${normalize(lab)}::${String(loinc||'').trim().toLowerCase()}`}
async function preferredUnit(personId,lab,loinc){const map=await getUnitPreferences();return map[prefKey(personId,lab,loinc)]?.unit||''}
async function saveUnitPreference(personId,lab,loinc,unit){if(!personId||!lab||!loinc||!unit)return;const row=await metaGet('family:unit-preferences')||{id:'family:unit-preferences',map:{}};row.map[prefKey(personId,lab,loinc)]={personId,laboratory:lab,loinc,unit,updatedAt:new Date().toISOString()};await metaPut(row)}
async function learnUnitPreferences(){const personId=selectedPerson(),lab=laboratory?.value.trim();if(!personId||!lab)return;for(const row of [...(editor?.querySelectorAll('.measurement-row')||[])]){const raw=row.querySelector('.test-search')?.value?.trim()||'',loinc=(row.dataset.loincCode||raw.split(' — ')[0]).trim(),unit=row.querySelector('.test-unit')?.value?.trim()||'';if(loinc&&unit)await saveUnitPreference(personId,lab,loinc,unit)}}
async function applyPreferredUnit(row){const personId=selectedPerson(),lab=laboratory?.value.trim(),raw=row.querySelector('.test-search')?.value?.trim()||'',loinc=(row.dataset.loincCode||raw.split(' — ')[0]).trim(),input=row.querySelector('.test-unit');if(!personId||!lab||!loinc||!input)return;const unit=await preferredUnit(personId,lab,loinc);if(unit&&!input.value.trim()){input.value=unit;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))}}

const stash=document.createElement('div');stash.id='familyReportStash';stash.hidden=true;document.body.appendChild(stash);
async function assignCards(){if(!reportsList)return;const profiles=await ensureProfiles(),fallback=profiles[0].id,mappings=await getMappings(),entries=Object.entries(mappings);for(const card of [...reportsList.querySelectorAll('.report-card'),...stash.querySelectorAll('.report-card')]){if(card.dataset.personId)continue;let match=entries.find(([,m])=>mappingMatchesCard(m,card));card.dataset.personId=match?.[1]?.personId||fallback}}
async function applyPersonFilter(){if(applying||!reportsList)return;applying=true;try{await assignCards();const active=selectedPerson();for(const card of [...stash.querySelectorAll('.report-card')])if(card.dataset.personId===active)reportsList.appendChild(card);for(const card of [...reportsList.querySelectorAll('.report-card')])if(card.dataset.personId!==active)stash.appendChild(card);const visible=[...reportsList.querySelectorAll('.report-card')];if(reportCount)reportCount.textContent=String(visible.length);if(measurementCount)measurementCount.textContent=String(visible.reduce((n,c)=>n+Number.parseInt(c.querySelector('.pill')?.textContent||'0',10),0));const empty=document.querySelector('#emptyState');if(empty)empty.classList.toggle('hidden',visible.length>0);dispatch('riferto:person-filter-applied',{personId:active})}finally{applying=false}}

reportForm?.addEventListener('submit',async event=>{const isNew=!reportIdInput.value;if(isNew)reportIdInput.value=id();const reportId=reportIdInput.value,personId=selectedPerson(),mapping={personId,date:reportDate?.value||'',laboratory:laboratory?.value.trim()||'',notes:notes?.value.trim()||'',signature:formSignature(),updatedAt:new Date().toISOString()};await setMapping(reportId,mapping);await learnUnitPreferences();setTimeout(applyPersonFilter,180)},true);
editor?.addEventListener('change',event=>{const row=event.target.closest('.measurement-row');if(row&&event.target.matches('.test-search,.test-unit'))setTimeout(()=>applyPreferredUnit(row),30)});
laboratory?.addEventListener('change',()=>{for(const row of [...(editor?.querySelectorAll('.measurement-row')||[])])applyPreferredUnit(row)});
if(reportsList)new MutationObserver(()=>setTimeout(applyPersonFilter,40)).observe(reportsList,{childList:true});
window.addEventListener('riferto:loinc-selected',event=>{const row=event.target?.closest?.('.measurement-row');if(row)applyPreferredUnit(row)});

window.RifertoFamily={listProfiles,addProfile,updateProfile,deleteProfile,setActivePersonId,getActivePersonId,preferredUnit,saveUnitPreference,applyPersonFilter};
(async()=>{await ensureProfiles();await applyPersonFilter();dispatch('riferto:family-ready')})();
