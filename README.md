<h1 align="center">🧮 forfettario-kit</h1>

<p align="center"><b>How much do I really keep? Tax, INPS, net and deadlines for Italian flat-tax freelancers.</b></p>

<p align="center">[Italiano](README.it.md)</p>

<p align="center">
  <img src="docs/assets/demo.svg" alt="40k revenue as a professional: tax, contributions, net and next year's advances." width="720">
  <br><sub>40k revenue as a professional: tax, contributions, net and next year's advances.</sub>
</p>

<p align="center">

[![CI](https://github.com/MRJonam91/forfettario-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/MRJonam91/forfettario-kit/actions/workflows/ci.yml) [![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE) ![Node >= 22.18](https://img.shields.io/badge/node-%3E%3D22.18-339933?logo=node.js&logoColor=white) ![core < 1500 LOC](https://img.shields.io/badge/core-%3C1500%20LOC-8a2be2)

</p>

## 🧭 What it is

The Italian *regime forfettario* (flat tax for freelancers and small businesses up to €85k) is simple in theory,
confusing in practice: coefficients, INPS funds, deductible contributions, advances split 40/60, dozens of deadlines.
**forfettario-kit** puts it in one tool:

- 💶 `calcola`: gross income, INPS contributions (separate fund, craftsmen, traders, 35% reduction), tax 15%/5%, net
- 🎯 `obiettivo`: revenue needed to take home a target net
- 📅 `scadenze`: F24/INPS deadlines as a list or **iCal** with 3-day reminders
- 📄 Yearly parameters in `data/years/<year>.json`, reviewable in a Pull Request
- ⚠️ Warnings for the €85k / €100k thresholds

## 🚀 Quick start​‌​​‌‌​‌​‌​‌​​‌​​‌​​‌​‌​​​‌‌‌​​‌​​‌‌​​​‌​​‌​‌‌​‌​‌‌​​‌‌​​‌‌​‌​‌‌​​‌​‌‌​‌​​‌‌​​​​​‌‌​​​‌​​​‌‌‌​​​​‌‌​​‌​​​​‌‌​‌​​​​‌‌​‌​​

```bash
npx forfettario-kit calcola --ricavi 40000 --attivita professionisti
npx forfettario-kit calcola --ricavi 30000 --attivita commercio --cassa commercianti --riduzione
npx forfettario-kit obiettivo --netto 30000 --attivita professionisti
npx forfettario-kit scadenze --cassa artigiani --ics > scadenze.ics
```

## ⚠️ Disclaimer

Estimates for planning, **not tax advice**. The 2026 parameters are marked `verified: false` until checked against
INPS circulars and the Revenue Agency; the tool says so on every output. Deductible contributions default to those due
in the year (cash basis may differ). Talk to your accountant. Sources in [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md).

## 🧱 Architecture & roadmap

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/ROADMAP.md](docs/ROADMAP.md) · [docs/superpowers/plans/](docs/superpowers/plans/)

## 🤝 Contributing

Each new year = one JSON file + tests, reviewed in public. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

⭐ If it's useful, a star helps other people find it.

## ❤️ Support this project

If this project saves you time or money, you can buy me a coffee. Every contribution keeps it free and maintained.

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-MRJonam91-ea4aaa?logo=githubsponsors)](https://github.com/sponsors/MRJonam91)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-mrjonam-ff5e5b?logo=kofi&logoColor=white)](https://ko-fi.com/mrjonam)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-mrjonam-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/mrjonam)
[![PayPal](https://img.shields.io/badge/PayPal-manorollo-00457c?logo=paypal&logoColor=white)](https://paypal.me/manorollo)

## 📄 License

Code: **Apache-2.0** — see [LICENSE](LICENSE) and [NOTICE](NOTICE) (attribution required). Documentation: CC BY-SA 4.0. Contributions use the DCO (`git commit -s`). For custom versions, white-label or support contracts, contact the author.

© 2026 Manoj Rollo (MRJonam91)
