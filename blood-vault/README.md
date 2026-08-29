# Blood Vault PWA

Mobile-first Progressive Web App for archiving blood-test reports and structured laboratory values.

## Privacy model

Blood Vault is local-first. Clinical data, structured measurements and attached PDFs are stored in the browser's IndexedDB on the device where the PWA is running. GitHub Pages serves only the static application assets.

No medical record, PDF or measurement is intentionally uploaded to GitHub by the application.

Important consequences:

- Clearing browser/site data can delete the vault.
- Removing the installed PWA may also remove local storage depending on the operating system/browser.
- Use **Export encrypted backup** before clearing browser data or changing device.
- The exported JSON backup is encrypted but must still be treated as sensitive health data.

## Encryption model

Version 2 introduces application-level encryption with the browser Web Crypto API.

- The vault has a random 256-bit AES key generated on-device.
- Reports are encrypted with AES-GCM before being stored in IndexedDB.
- PDF bytes are encrypted with AES-GCM before being stored in IndexedDB.
- AES-GCM also authenticates ciphertext, so corrupted or modified encrypted records fail to decrypt.
- The user's PIN is not stored.
- The PIN is processed with PBKDF2-HMAC-SHA-256 using a random salt and 310,000 iterations.
- The PBKDF2-derived key encrypts the random vault key. This separation makes later PIN changes possible without re-encrypting every medical record.
- The decrypted vault key exists only in JavaScript memory while the vault is unlocked and is discarded when the user locks the vault or reloads the application.

This protects the IndexedDB contents from straightforward inspection while the vault is locked. It does not claim to defend against a compromised operating system, malicious browser extension with sufficient privileges, injected code, or an attacker who can execute code in the application origin while the vault is unlocked.

## Encrypted portable backups

Backup export creates a JSON envelope containing encrypted payload data.

- The user chooses a backup password at export time.
- A new random PBKDF2 salt is generated for each export.
- Backup contents are encrypted with AES-256-GCM.
- The backup contains structured reports plus PDF bytes.
- Import requires the backup password.

The backup password is independent of the local vault PIN and is not stored by the app.

## Existing-data migration

When upgrading a previous local Blood Vault installation, the legacy IndexedDB `reports` and `pdfs` stores are read after the user creates the first PIN. Their contents are copied into the encrypted v2 vault stores. The legacy stores are intentionally not automatically deleted in this prototype so migration is non-destructive; a later audited migration can remove them after successful verification.

## Device lock and biometrics

The current implementation provides a local PIN lock. WebAuthn/platform-authenticator support can be added later for Face ID, Touch ID, Android biometrics or device credentials where supported.

A biometric feature is not represented as complete yet. WebAuthn normally involves cryptographic challenge verification and browser/device support varies, so it should be implemented and tested explicitly rather than simulated with a cosmetic biometric prompt.

## Storage persistence

The app requests persistent browser storage with `navigator.storage.persist()` when supported. Browsers may still decline the request. Encrypted backups remain the recommended migration and recovery mechanism.

## Data model

Each report contains:

- UUID
- report date
- laboratory name
- notes
- zero or more structured measurements
- optional PDF stored as a separate encrypted vault entry

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

## Security next steps

1. Add PIN change and recovery-key workflows.
2. Add automatic lock after inactivity/backgrounding.
3. Add WebAuthn/platform-authenticator unlock as an optional convenience mechanism.
4. Add verified deletion of legacy plaintext stores after successful v1-to-v2 migration.
5. Add backup integrity/version migration tests.
6. Add a Content Security Policy appropriate for GitHub Pages deployment.
7. Perform a dedicated security review before treating the PWA as production health-record software.

## Medical disclaimer

Blood Vault is an archive and data-management application. It does not provide diagnosis, treatment recommendations or medical interpretation.
