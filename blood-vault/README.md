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
- The user's PIN is not stored directly.
- The PIN is processed with PBKDF2-HMAC-SHA-256 using a random salt and 310,000 iterations.
- The PBKDF2-derived key encrypts the random vault key.
- The decrypted vault key exists only in JavaScript memory while the vault is unlocked and is discarded when the user locks the vault or reloads the application.

## Biometric unlock

Blood Vault now includes optional WebAuthn platform-authenticator support for devices that expose both user verification and the WebAuthn PRF extension.

Enrollment flow:

1. The user unlocks Blood Vault and chooses **Enable Face ID / fingerprint**.
2. The current local PIN is verified.
3. A WebAuthn credential is created with `authenticatorAttachment: platform` and `userVerification: required`.
4. The app requests a WebAuthn PRF output bound to that credential.
5. That PRF output derives an AES key used to encrypt a local copy of the vault PIN.
6. The WebAuthn public key, credential ID, PRF salt and encrypted PIN envelope are stored locally in IndexedDB. Raw biometric data is never available to the PWA.

Unlock flow:

1. The PWA asks the platform authenticator to verify the user.
2. It checks the returned WebAuthn client challenge, origin, RP ID hash, user-presence/user-verification flags and cryptographic assertion signature locally.
3. It obtains the credential-bound PRF output.
4. The PRF-derived key decrypts the locally sealed PIN.
5. The normal PIN-key path unwraps the Blood Vault AES key.

The PIN remains the fallback and recovery path.

### Compatibility boundary

A device may support WebAuthn biometrics but not expose the PRF extension needed for secure PIN-less local vault unlock. In that case Blood Vault deliberately does **not** store a recoverable PIN merely to simulate biometric unlocking; the user continues to unlock with the PIN.

The exact system prompt is chosen by the operating system/browser. On supported Apple devices this can be Face ID or Touch ID; on supported Android devices it can be fingerprint, face verification, or another secure device credential. Blood Vault never receives biometric templates.

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

## Storage persistence

The app requests persistent browser storage with `navigator.storage.persist()` when supported. Browsers may still decline the request. Encrypted backups remain the recommended migration and recovery mechanism.

## Data model

Each report contains UUID, report date, laboratory name, notes, structured measurements and an optional separately encrypted PDF.

Each measurement contains UUID, LOINC code, localized display name, value, laboratory unit and laboratory reference interval. The application deliberately does not infer or replace laboratory reference ranges.

## LOINC

The repository includes a small starter catalog of common blood tests. It is not a complete LOINC distribution.

LOINC is maintained by Regenstrief Institute. Before distributing a complete LOINC dataset inside the application, verify the current LOINC license, attribution requirements and any third-party-content restrictions directly with the official LOINC documentation.

LOINC® is a registered trademark of Regenstrief Institute, Inc.

## PWA

The service worker caches only static application assets for offline use, including the biometric module. It does not copy IndexedDB health data into the service-worker cache.

## Current languages

- Italian
- English

## Security next steps

1. Add PIN change and recovery-key workflows.
2. Add automatic lock after inactivity/backgrounding.
3. Test biometric PRF behavior across current iOS Safari/PWA and Android Chrome/PWA versions.
4. Add verified deletion of legacy plaintext stores after successful v1-to-v2 migration.
5. Add backup integrity/version migration tests.
6. Add a Content Security Policy appropriate for GitHub Pages deployment.
7. Perform a dedicated security review before treating the PWA as production health-record software.

## Medical disclaimer

Blood Vault is an archive and data-management application. It does not provide diagnosis, treatment recommendations or medical interpretation.
