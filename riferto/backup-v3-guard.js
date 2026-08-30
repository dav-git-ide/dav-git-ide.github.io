localStorage.setItem('riferto-auto-backup-enabled','false');
const toggle=document.querySelector('#autoBackupToggle');
if(toggle){toggle.checked=false;toggle.disabled=true;toggle.closest('.backup-toggle')?.classList.add('hidden')}
const status=document.querySelector('#autoBackupStatus');
if(status)status.textContent='Nuovo formato .riferto attivo · backup manuale verificato e cifrato';
