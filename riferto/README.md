# Riferto

**I tuoi referti. Sul tuo dispositivo.**

Riferto è una PWA local-first per archiviare referti sanitari, PDF originali e valori strutturati. La pagina web normale mostra solo l'installazione; l'archivio viene inizializzato esclusivamente quando la PWA è aperta in modalità standalone.

## Versione

0.7.0 — clean rebuild.

## Privacy e sicurezza

- IndexedDB dedicato: `riferto-db`.
- Store: `vault` e `meta`.
- Dati dei referti e PDF cifrati con AES-GCM.
- Chiave del vault casuale a 256 bit.
- PIN usato tramite PBKDF2-SHA-256 (310000 iterazioni) per proteggere la chiave del vault.
- Nome del PDF cifrato insieme ai metadati del PDF.
- Backup JSON portabile cifrato con password separata.
- Nessun dato sanitario viene inviato a GitHub Pages: GitHub ospita solo file statici.

Il valore PBKDF2 di 310000 iterazioni è un parametro implementativo del progetto, non una dichiarazione di conformità o una raccomandazione normativa.

## Biometria

Lo sblocco biometrico è opzionale e usa WebAuthn con autenticatore di piattaforma (`userVerification: required`) e PRF. Se la PRF non è disponibile, Riferto non abilita uno sblocco biometrico simulato o puramente cosmetico.

Il comportamento reale su specifiche versioni di iOS/Safari/PWA e Android/Chrome/PWA resta da verificare su dispositivi fisici.

## Aggiornamenti PWA

Il pulsante **Aggiorna app** forza il controllo del service worker, rimuove il service worker dello scope `/riferto/`, elimina solo le cache `riferto-*` e ricarica con un parametro anti-cache. Non elimina intenzionalmente IndexedDB `riferto-db`.

## LOINC

Il catalogo incluso è un sottoinsieme iniziale di esami comuni. LOINC® è un marchio registrato di Regenstrief Institute, Inc. Prima di distribuire un catalogo LOINC completo occorre verificare le condizioni di licenza e attribuzione applicabili.

## Supporto

Donazione volontaria PayPal: `https://www.paypal.com/qrcodes/p2pqrc/GRN7DK9PJ69BA`

## Copyright

© 2026 Riferto. Tutti i diritti riservati.

È vietato il riutilizzo, la redistribuzione, la rivendita, il white-label e qualsiasi uso commerciale del software o di parti sostanziali del codice senza preventiva autorizzazione scritta del titolare dei diritti.