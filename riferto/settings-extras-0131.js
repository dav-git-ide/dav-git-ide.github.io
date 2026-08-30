const settingsStack=document.querySelector('.settings-stack');
const updateCard=document.querySelector('#settingsUpdateAvailable');
const exportBtn=document.querySelector('#exportBtn');
const backupDetails=[...document.querySelectorAll('.settings-disclosure')].find(d=>d.querySelector('summary')?.textContent?.includes('Backup'));
const LAST_BACKUP_KEY='riferto-last-exported-backup';
let exportArmedUntil=0;

const style=document.createElement('style');
style.textContent=`
#settingsUpdateAvailable:not(.hidden){
  background:linear-gradient(145deg,rgba(255,238,238,.98),rgba(255,222,222,.94))!important;
  border:1px solid rgba(194,45,45,.28)!important;
  box-shadow:0 10px 30px rgba(150,35,35,.12)!important;
}
#settingsUpdateAvailable:not(.hidden) .eyebrow,#settingsUpdateAvailable:not(.hidden) h3{color:#a82222!important}
#settingsUpdateAvailable:not(.hidden) .update-dot{background:#d83b3b!important;box-shadow:0 0 0 5px rgba(216,59,59,.12)!important}
#settingsUpdateAvailable:not(.hidden) .primary-btn{background:#c93636!important;border-color:#c93636!important;color:#fff!important}
.backup-safety-note{padding:12px 13px;border-radius:14px;background:rgba(255,246,224,.82);border:1px solid rgba(183,124,20,.18);display:grid;gap:5px;margin-bottom:10px}
.backup-safety-note strong{font-size:.78rem;color:#8a5a09}.backup-safety-note p{margin:0;font-size:.72rem;line-height:1.35;color:var(--muted)}
.backup-last-line{font-size:.68rem!important}.backup-last-line[data-has-backup="true"]{color:#23735b!important;font-weight:750}
.changelog-card{order:65}.changelog-list{display:grid;gap:9px;margin-top:8px}.changelog-entry{padding:10px 11px;border-radius:13px;background:rgba(255,255,255,.48)}.changelog-entry strong{display:block;font-size:.76rem}.changelog-entry small{display:block;margin-top:3px;color:var(--muted);font-size:.68rem;line-height:1.35}
`;
document.head.appendChild(style);

function formatBackupTime(value){if(!value)return'Mai registrato';try{return new Intl.DateTimeFormat('it-IT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return value}}
function renderBackupStatus(){const line=document.querySelector('#lastLocalBackupStatus');if(!line)return;const last=localStorage.getItem(LAST_BACKUP_KEY);line.textContent=`Ultimo backup esportato: ${formatBackupTime(last)}`;line.dataset.hasBackup=last?'true':'false'}

if(backupDetails){
  const body=backupDetails.querySelector('.settings-disclosure-body');
  const note=document.createElement('div');
  note.className='backup-safety-note';
  note.innerHTML='<strong>Backup consigliato</strong><p>I dati principali di Riferto restano sul dispositivo. La rimozione della PWA o la cancellazione dei dati del sito può eliminare l\'archivio locale. Conserva periodicamente un backup cifrato fuori dall’app, ad esempio in File o iCloud Drive.</p><p id="lastLocalBackupStatus" class="backup-last-line"></p>';
  body?.prepend(note);
  renderBackupStatus();
}

if(exportBtn){
  exportBtn.addEventListener('click',()=>{exportArmedUntil=Date.now()+15000},true);
  const originalCreateObjectURL=URL.createObjectURL.bind(URL);
  URL.createObjectURL=function(object){
    const url=originalCreateObjectURL(object);
    if(Date.now()<exportArmedUntil&&object instanceof Blob&&String(object.type||'').includes('json')){
      const now=new Date().toISOString();
      localStorage.setItem(LAST_BACKUP_KEY,now);
      exportArmedUntil=0;
      queueMicrotask(renderBackupStatus);
    }
    return url;
  };
}

if(settingsStack){
  const card=document.createElement('article');
  card.className='glass settings-card changelog-card';
  card.innerHTML=`<div><p class="eyebrow">Riferto</p><h3>Novità e changelog</h3><p class="muted">Le modifiche principali delle versioni recenti.</p></div><details class="settings-disclosure"><summary><span>Mostra changelog</span><small>Dalla v0.13.1</small></summary><div class="settings-disclosure-body changelog-list"><div class="changelog-entry"><strong>v0.13.1</strong><small>Corretto il layout portrait: Trend non resta visibile dentro Impostazioni, barra persona nascosta in Impostazioni, aggiornamento disponibile evidenziato in rosso, avviso e stato backup locale, changelog integrato.</small></div><div class="changelog-entry"><strong>v0.13.0</strong><small>Gestione famiglia e più persone, filtro per persona, preferenza unità per persona + struttura + esame, layout Trend portrait/landscape e nuova icona PWA.</small></div><div class="changelog-entry"><strong>v0.12.6</strong><small>Matrice Trend migliorata per nomi esame lunghi e dispositivi mobili.</small></div><div class="changelog-entry"><strong>v0.12.5</strong><small>Notifica aggiornamento trasformata in pallino rosso persistente fino all’aggiornamento.</small></div><div class="changelog-entry"><strong>v0.12.3</strong><small>Normalizzazione unità orientata UCUM e correzione del confronto con gli intervalli di riferimento.</small></div></div></details>`;
  settingsStack.appendChild(card);
}
