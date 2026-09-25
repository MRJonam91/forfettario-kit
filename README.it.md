<h1 align="center">🧮 forfettario-kit</h1>

<p align="center"><b>Quanto mi resta davvero? Tasse, INPS, netto e scadenze per chi è in regime forfettario.</b></p>

<p align="center">[English](README.md)</p>

<p align="center">
  <img src="docs/assets/demo.svg" alt="40.000 € di ricavi da professionista: tasse, contributi, netto e acconti dell'anno dopo." width="720">
  <br><sub>40.000 € di ricavi da professionista: tasse, contributi, netto e acconti dell'anno dopo.</sub>
</p>

<p align="center">

[![CI](https://github.com/MRJonam91/forfettario-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/MRJonam91/forfettario-kit/actions/workflows/ci.yml) [![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE) ![Node >= 22.18](https://img.shields.io/badge/node-%3E%3D22.18-339933?logo=node.js&logoColor=white) ![core < 1500 LOC](https://img.shields.io/badge/core-%3C1500%20LOC-8a2be2)

</p>

## 🧭 Cos'è

Il *regime forfettario* è semplice sulla carta e complicato nella pratica: coefficienti, casse INPS, contributi deducibili,
acconti 40/60, decine di scadenze. **forfettario-kit** mette tutto in un solo strumento:

- 💶 `calcola`: reddito lordo, contributi INPS (gestione separata, artigiani, commercianti, riduzione 35%), imposta 15%/5%, netto
- 🎯 `obiettivo`: quanto fatturare per ottenere il netto che vuoi
- 📅 `scadenze`: scadenze F24/INPS in elenco o **iCal** con promemoria 3 giorni prima
- 📄 Parametri annuali in `data/years/<anno>.json`, verificabili in una Pull Request
- ⚠️ Avvisi per le soglie di 85.000 € / 100.000 €

## 🚀 Avvio rapido​‌​​‌‌​‌​‌​‌​​‌​​‌​​‌​‌​​​‌‌‌​​‌​​‌‌​​​‌​​‌​‌‌​‌​‌‌​​‌‌​​‌‌​‌​‌‌​​‌​‌‌​‌​​‌‌​​​​​‌‌​​​‌​​​‌‌‌​​​​‌‌​​‌​​​​‌‌​‌​​​​‌‌​‌​​

```bash
npx forfettario-kit calcola --ricavi 40000 --attivita professionisti
npx forfettario-kit calcola --ricavi 30000 --attivita commercio --cassa commercianti --riduzione
npx forfettario-kit obiettivo --netto 30000 --attivita professionisti
npx forfettario-kit scadenze --cassa artigiani --ics > scadenze.ics
```

## ⚠️ Avvertenze

Stime per pianificare, **non consulenza fiscale**. I parametri 2026 sono marcati `verified: false` finché non vengono
confrontati con circolari INPS e Agenzia delle Entrate; lo strumento lo segnala a ogni risultato. Di default i contributi
dedotti sono quelli dovuti nell'anno (per cassa può essere diverso). Parlane con il tuo commercialista. Fonti in [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md).

## 🧱 Architettura e roadmap

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/ROADMAP.md](docs/ROADMAP.md) · [docs/superpowers/plans/](docs/superpowers/plans/)

## 🤝 Contribuire

Ogni nuovo anno = un file JSON + test, revisionato in pubblico. Vedi [CONTRIBUTING.md](CONTRIBUTING.md).

---

⭐ Se ti è utile, una stella aiuta altre persone a trovarlo.

## ❤️ Sostieni il progetto

Se questo progetto ti fa risparmiare tempo o soldi, puoi offrirmi un caffè. Ogni contributo lo mantiene gratuito e aggiornato.

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-MRJonam91-ea4aaa?logo=githubsponsors)](https://github.com/sponsors/MRJonam91)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-mrjonam-ff5e5b?logo=kofi&logoColor=white)](https://ko-fi.com/mrjonam)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-mrjonam-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/mrjonam)
[![PayPal](https://img.shields.io/badge/PayPal-manorollo-00457c?logo=paypal&logoColor=white)](https://paypal.me/manorollo)

## 📄 Licenza

Codice: **Apache-2.0** — vedi [LICENSE](LICENSE) e [NOTICE](NOTICE) (attribuzione obbligatoria). Documentazione: CC BY-SA 4.0. I contributi usano il DCO (`git commit -s`). Per versioni personalizzate, white-label o supporto, contatta l'autore.

© 2026 Manoj Rollo (MRJonam91)
