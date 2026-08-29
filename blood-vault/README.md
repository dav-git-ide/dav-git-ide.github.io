# Blood Vault PWA

Mobile-first Progressive Web App for archiving blood-test reports and structured laboratory values.

## Privacy model

Blood Vault is local-first. Clinical data, structured measurements and attached PDFs are stored in the browser's IndexedDB on the device where the PWA is running. GitHub Pages serves only the static application assets.

No medical record, PDF or measurement is intentionally uploaded to GitHub by the application.

Important consequences:

- Clearing browser/site data can delete the vault.
- Removing the installed PWA may also remove local storage depending on the operating system/browser.
- Use **Export JSON** to create a portable backup before clearing browser data or changing device.
- The JSON export contains the reports plus PDF files encoded as data URLs, so the backup itself must be treated as sensitive health data.

## Data model

Each report contains:

- UUID
- report date
- laboratory name
- notes
- zero or more structured measurements
- optional PDF stored in a separate IndexedDB object store

Each measurement contains:

- UUID
- LOINC code
- localized display name
- value as entered by the user
- unit as reported by the laboratory
- reference interval as reported by the laboratory

The application deliberately does not infer or replace laboratory reference ranges.

## LOINC

The repository includes a small starter catalog of common blood tests. It is not a complete LOINC distribution.

LOINC is maintained by Regenstrief Institute. Before distributing a complete LOINC dataset inside the application, verify the current LOINC license, attribution requirements and any third-party-content restrictions directly with the official LOINC documentation.

LOINC® is a registered trademark of Regenstrief Institute, Inc.

## PWA

The service worker caches only static application assets for offline use. It does not copy IndexedDB health data into the service-worker cache.

## Current languages

- Italian
- English

The translation structure is extensible to additional languages.

## Security roadmap

Recommended next steps before using the application for real health records:

1. Encrypt exported backups with a user-controlled passphrase.
2. Consider application-level encryption for IndexedDB using Web Crypto.
3. Add an explicit local-vault lock using passcode/biometric capabilities where supported.
4. Add storage-persistence checks (`navigator.storage.persist()`) and a clear warning when persistent storage is not granted.
5. Add automatic schema-version migrations and backup validation.
6. Expand the LOINC catalog only from a license-compliant source and preserve provenance/version metadata.

## Medical disclaimer

Blood Vault is an archive and data-management application. It does not provide diagnosis, treatment recommendations or medical interpretation.
