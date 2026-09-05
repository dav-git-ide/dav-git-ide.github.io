<div align="center">
  <img src="./riferto/icon-riferto.svg" width="96" height="96" alt="Riferto logo">

  # Riferto

  **Your reports. On your device.**

  Private, local-first PWA for medical reports, structured lab values and PDF attachments.

  [Open Riferto](https://making-lemonade.github.io/riferto/) · [Changelog](./CHANGELOG.md) · [Italiano](./README.it.md) · **English**

  <br>

  ![Version](https://img.shields.io/badge/version-0.13.3-1764e8?style=flat-square)
  ![PWA](https://img.shields.io/badge/PWA-installable-1764e8?style=flat-square)
  ![Storage](https://img.shields.io/badge/storage-local--first-23735b?style=flat-square)
  ![Encryption](https://img.shields.io/badge/vault-AES--GCM-23735b?style=flat-square)
</div>

---

## What is Riferto?

Riferto is a personal health-record PWA designed to keep medical reports **on the user's device**. It stores reports, original PDF attachments and structured values in a local archive protected by a PIN.

It does not require an application server to store your reports. GitHub Pages hosts the static application files; health data is kept in the browser/PWA local storage used by Riferto.

### Highlights

| | Feature |
|---|---|
| 🔐 | Encrypted local archive for reports and PDF attachments |
| 👥 | Multiple people / family profiles in the same archive |
| 📈 | Trends over time with chart, detail and matrix views |
| 🧪 | LOINC codes and conservative UCUM-oriented unit normalization |
| 📄 | Multiple original PDF attachments per report |
| 💾 | Encrypted `.riferto` backup format with integrity verification |
| 📱 | Installable PWA with responsive portrait and landscape layouts |

## Privacy and security

The report vault and PDF content are encrypted locally. Riferto uses a random 256-bit vault key and AES-GCM for protected data; the PIN protects access to the vault key through a PBKDF2-SHA-256 based mechanism.

Riferto is local-first, but local browser/PWA storage is **not a backup**. Removing the PWA or clearing site data may delete the local archive.

### Backup format

Since v0.13.2, the primary backup is a **`.riferto`** file. Its logical contents include:

```text
manifest.json
database/
people.json
settings.json
pdf/
```

The package is integrity-checked with SHA-256 and ZIP CRC checks, then encrypted with AES-GCM before export. Restore validation runs before the local database is replaced; a corrupted or incomplete package is rejected instead of being silently imported partially.

Keep exported backups outside the app, for example in Files, iCloud Drive or another storage location you control. The backup password is required for recovery. Legacy JSON backups remain importable for compatibility.

## Current version

**v0.13.3**

See the [project changelog](./CHANGELOG.md) or the [web changelog](https://making-lemonade.github.io/riferto/changelog.html).

## Install

Open:

**https://making-lemonade.github.io/riferto/**

On iPhone/iPad, open the page in Safari and use **Share → Add to Home Screen**. Riferto initializes the local archive when launched as the installed PWA.

## Standards

LOINC® is a registered trademark of Regenstrief Institute, Inc. Riferto preserves the unit reported by the laboratory and only applies normalization when a compatible conversion is explicitly supported.

## Medical disclaimer

Riferto is a personal archive. It is **not a medical device** and does not provide diagnoses or medical interpretations.

## License and use

© 2026 Riferto. All rights reserved.

Reuse, redistribution, resale, white-labeling and commercial use of the software or substantial portions of the source code are prohibited without prior written authorization from the rights holder.

---

<div align="center">
  <sub>Riferto · local-first personal health archive</sub>
</div>
