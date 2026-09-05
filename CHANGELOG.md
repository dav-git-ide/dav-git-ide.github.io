# Changelog

## v0.13.4 — 2026-09-05
- Corretto il deployment GitHub Pages: viene pubblicata direttamente la PWA invece della root Jekyll/README.
- Aggiunta in **Impostazioni → Aggiornamento** la gestione dell'URL sorgente usato per controllare nuove versioni.
- È possibile salvare, aprire o ripristinare l'URL predefinito dell'app.
- Se l'URL passa a un dominio diverso, Riferto avvisa che l'archivio locale non può essere trasferito automaticamente tra origini diverse e richiede prima un backup `.riferto`.
- Nuova icona PWA senza orologio: documento/referto, provetta/esame e scudo con lucchetto per rappresentare privacy e dati sanitari.
- Nome PWA esplicitamente impostato a **Riferto** nel manifest e nei metadati dell'app.
- Aggiornata la gestione del service worker per non dipendere da un percorso `/riferto/` codificato nel codice.

## v0.13.3 — 2026-09-05
- Aggiornati i riferimenti GitHub al nuovo account `making-lemonade`.
- Aggiornati i link pubblici a repository, PWA e changelog.
- Aggiunto il collegamento al repository direttamente nelle informazioni dell'app.
- Rifinito il design generale con superfici più pulite, spaziature più coerenti e migliore leggibilità.
- Migliorato il layout desktop/tablet con contenuto più ampio e Impostazioni organizzate su due colonne quando c'è spazio.
- Corretta e resa esplicita la bottom navigation a tre sezioni: Referti, Trend e Impostazioni.
- Migliorato il comportamento responsive su schermi piccoli e grandi.

## v0.13.2 — 2026-08-30
- Nuovo formato di backup `.riferto`.
- Il contenuto viene organizzato come ZIP con `manifest.json`, database, persone, impostazioni e allegati PDF.
- Il pacchetto ZIP completo viene cifrato con AES-GCM prima di essere salvato.
- Ogni elemento del pacchetto è registrato nel manifest con dimensione e checksum SHA-256; lo ZIP usa anche CRC32.
- Il ripristino verifica completamente il backup prima di modificare il database locale.
- In caso di password errata, file troncato, ZIP corrotto, elemento mancante o checksum errato il ripristino viene interrotto senza importazione parziale.
- Il ripristino del database viene eseguito in una singola transazione IndexedDB, così un errore durante la scrittura annulla l'operazione.
- I vecchi backup JSON rimangono importabili.
- Il vecchio backup automatico JSON viene disattivato; il nuovo `.riferto` viene esportato manualmente e va conservato fuori dalla PWA.

## v0.13.1 — 2026-08-30
- Corretto il bug portrait che lasciava visibile la sezione Trend entrando in Impostazioni.
- La barra persona viene nascosta quando si apre Impostazioni.
- La card “Aggiornamento disponibile” diventa rossa e molto più evidente.
- Aggiunto avviso permanente sul rischio di perdita dell'archivio locale se la PWA o i dati del sito vengono rimossi.
- Aggiunto changelog dentro l'app e pagina changelog pubblica.
- Aggiornato il README del repository.

## v0.13.0 — 2026-08-30
- Gestione di più persone/familiari nello stesso archivio.
- Selettore persona globale e filtri coerenti in Referti e Trend.
- Preferenza unità per persona + struttura/laboratorio + esame.
- Layout Trend distinto per portrait e landscape.
- Nuova icona PWA dedicata all'archivio sanitario locale.

## v0.12.6
- Migliorata la matrice Trend su mobile.
- Nomi esame lunghi distribuiti su più righe e sigle separate dalla descrizione.

## v0.12.5
- Notifica aggiornamento nella bottom bar trasformata in pallino rosso persistente.

## v0.12.3
- Aggiunta normalizzazione delle unità orientata a UCUM.
- Conservazione dell'unità originale e del valore canonico quando convertibile.
- Corretto il parsing del range che poteva interpretare il trattino del codice LOINC come intervallo numerico.

## v0.12.2
- Viste Trend: Grafico, Dettaglio e Matrice.
- Filtri temporali, ricerca esami e preferiti.

## v0.11.x
- Referti in modalità visualizzazione/modifica.
- Gestione multi-PDF.
- Intervalli min/max, valori compatti e indicazione degli outlier.
- Miglioramenti a PIN, Face ID/WebAuthn e impostazioni.

## v0.10.x
- Introduzione ricerca LOINC e miglioramenti progressivi dell'interfaccia Referti.
