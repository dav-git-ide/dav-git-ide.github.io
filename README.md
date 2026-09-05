# Riferto

**I tuoi referti. Sul tuo dispositivo.**

Riferto è una PWA per archiviare referti medici, PDF allegati e valori strutturati direttamente sul dispositivo dell'utente. L'archivio locale è cifrato e protetto da PIN; l'app non richiede un server per conservare i referti.

## Funzioni principali

- Archivio locale cifrato di referti e PDF.
- Codici LOINC e normalizzazione delle unità orientata a UCUM quando la conversione è sicura.
- Trend nel tempo con grafico, dettaglio e matrice.
- Layout responsive distinto per portrait e landscape.
- Gestione di più persone/familiari nello stesso archivio.
- Filtri di Referti e Trend in base alla persona selezionata.
- Preferenza dell'unità ricordata per combinazione **persona + struttura/laboratorio + esame**.
- Backup cifrato esportabile e successivamente importabile.
- PWA installabile su iPhone/iPad e dispositivi compatibili.

## Privacy e backup

Riferto mantiene i dati sanitari sul dispositivo. Eliminare la PWA o cancellare i dati del sito può eliminare l'archivio locale.

Dalla v0.13.2 il formato principale di backup è un file **`.riferto`**. Internamente contiene un pacchetto ZIP strutturato con manifest, database, persone, impostazioni e allegati PDF. Ogni elemento è verificato tramite SHA-256 e il pacchetto completo viene cifrato con AES-GCM prima del salvataggio.

Il ripristino è fail-safe: Riferto verifica prima password, cifratura, struttura ZIP, CRC, file richiesti e checksum. Se un controllo fallisce, il database locale non viene modificato. La scrittura finale avviene in una singola transazione IndexedDB.

È consigliato conservare il file `.riferto` fuori dall'app, ad esempio in File o iCloud Drive. La password del backup è necessaria per il ripristino. I vecchi backup JSON restano importabili per compatibilità.

Riferto non è un dispositivo medico e non fornisce diagnosi o interpretazioni cliniche.

## Versione corrente

**v0.13.2**

Consulta [CHANGELOG.md](./CHANGELOG.md) per la cronologia delle modifiche oppure la pagina web [Changelog Riferto](https://give-me-lemons.github.io/riferto/changelog.html).

## App

Riferto è disponibile come PWA su:

https://give-me-lemons.github.io/riferto/

## Repository

https://github.com/give-me-lemons/riferto

## Standard

LOINC® è un marchio registrato di Regenstrief Institute, Inc. Le unità vengono conservate anche nella forma originale del referto; la normalizzazione viene applicata solo quando l'app dispone di una conversione compatibile.

## Licenza e utilizzo

© 2026 Riferto. Tutti i diritti riservati. Vietati riutilizzo, redistribuzione, rivendita, white-label e uso commerciale del software o di parti sostanziali del codice senza autorizzazione scritta.
