<h1 align="center">🧾 forfettario-kit</h1>
<p align="center"><b>Calcolatore regime forfettario 2026 da terminale: tasse, contributi INPS, netto mensile e acconti in un comando.</b></p>
<p align="center">🇮🇹 Italiano · <a href="README.md">🇬🇧 English</a> · <b><a href="https://mrjonam91.github.io/forfettario-kit/">▶ Apri la web app</a></b></p>
<p align="center">
  <img src="docs/assets/demo.svg" alt="Demo nel terminale: npx forfettario-kit 40000 --ateco 62.01 mostra reddito lordo, contributi INPS, imposta al 15%, netto annuo e mensile e acconti" width="720">
  <br><sub>40.000 € di ricavi, ATECO 62.01, Gestione separata: quanto ti resta davvero, in meno di un secondo.</sub>
</p>
<p align="center">
  <a href="https://github.com/MRJonam91/forfettario-kit/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/MRJonam91/forfettario-kit/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSING.md"><img alt="Licenza: AGPL-3.0 + commerciale" src="https://img.shields.io/badge/licenza-AGPL--3.0%20%2B%20commerciale-blue"></a>
  <img alt="Node >= 22.18" src="https://img.shields.io/badge/node-%3E%3D22.18-339933?logo=nodedotjs&logoColor=white">
  <img alt="core < 1500 righe" src="https://img.shields.io/badge/core-%3C%201500%20righe-informational">
  <img alt="zero dipendenze" src="https://img.shields.io/badge/dipendenze%20runtime-0-brightgreen">
  <img alt="versione 0.2.0-beta.1" src="https://img.shields.io/badge/versione-0.2.0--beta.1-orange">
</p>

## 🧭 Cos'è

Se hai la partita IVA in regime forfettario, il saldo del conto ti inganna: una parte di ogni fattura è dell'INPS e del fisco, e te ne accorgi a giugno. **forfettario-kit** risponde a "quanto è davvero mio?" dal terminale, con i parametri ufficiali 2025 e 2026.

- **Coefficiente di redditività** dal codice ATECO (Allegato 4, L. 190/2014) o, se non lo conosci, dal **settore**; anche con **più attività** nello stesso anno.
- **INPS 2025 e 2026**: Gestione separata 26,07%, artigiani e commercianti (contributi fissi + scaglioni, riduzione **35%** o **50%**, massimale ridotto per chi ha contributi prima del 1996), cassa professionale personalizzabile.
- **Imposta sostitutiva 15%** o **5%** per le nuove attività, con i contributi dedotti per cassa.
- **Netto annuo e mensile**, quanto **accantonare ogni mese**, pressione fiscale effettiva.
- **Scadenzario F24**: tutte le date dell'anno dopo con **codici tributo e causali INPS** (1790/1791/1792, PXX, AF/AP, CF/CP), weekend e festivi già spostati, modalità primo anno, acconti versati in eccesso come **crediti**, opzione **30/07 con +0,40%** e **file calendario (.ics)** con promemoria 3 giorni prima.
- Avvisi su soglie **85.000 / 100.000 €** (con quanto puoi ancora fatturare) e limite **35.000 €** di reddito da dipendente.
- **Web app** per chi non usa il terminale: stesso motore, una pagina statica, nessun dato lascia il browser.
- **Zero dipendenze a runtime**, nessuna chiamata di rete, output JSON, italiano o inglese.

## 🖥️ Web app

**[mrjonam91.github.io/forfettario-kit](https://mrjonam91.github.io/forfettario-kit/)**: inserisci ricavi e codice ATECO, leggi il netto al mese e i versamenti F24, aggiungili al calendario. È generata dallo stesso core con `npm run build:web`, in un unico file HTML autosufficiente (`site/index.html`, allegato anche a ogni release) che funziona offline. Una Content Security Policy rigida blocca qualsiasi richiesta di rete: i tuoi numeri non lasciano il browser.

<p align="center"><img src="docs/assets/webapp.png" alt="Web app: a sinistra il modulo con codice ATECO e ricavi, a destra il netto di 2.503,44 euro al mese, la barra di ripartizione dei ricavi e il conto dal lordo al netto" width="720"></p>

## 🚀 Avvio rapido​‌​​‌‌​‌​‌​‌​​‌​​‌​​‌​‌​​​‌‌‌​​‌​​‌‌​​​‌​​‌​‌‌​‌​‌‌​​‌‌​​‌‌​‌​‌‌​​‌​‌‌​‌​‌‌​​​‌​​​‌‌​‌​​​​‌‌​​​‌​‌‌​​‌​‌​​‌‌‌​​‌​‌‌​​​‌‌

```bash
npx forfettario-kit 40000 --ateco 62.01                    # professionista, Gestione separata
npx forfettario-kit 30k --ateco 47.91 -g commercianti --riduzione 35 --startup
npx forfettario-kit --ateco 62.01:30000 --ateco 47.91:12000 --json
npx forfettario-kit ateco 69.20.11                         # coefficiente di un codice
npx forfettario-kit 40000 -a 62.01 --scadenze --ics f24.ics # scadenzario F24 + calendario
npx forfettario-kit 55000 --settore professioni --anno 2025 -s # senza codice ATECO, redditi 2025
npx forfettario-kit settori                                # settori e coefficienti
```

Opzioni utili: `--scadenze` versamenti F24 dell'anno dopo, `--ics <file>` file calendario, `--primo-anno` primo anno di attività, `--dedotti <euro>` contributi realmente versati nell'anno (default: stima a regime), `--spese <euro>` spese reali per il netto in tasca, `--cassa-aliquota 14 --cassa-minimo 2000` per le casse professionali, `--ante-1996` massimale IVS ridotto, `--lang en`, `--anno 2025`. Tutto il resto: `npx forfettario-kit --help`.

Come libreria:

```ts
import { calcola, caricaAnno } from "forfettario-kit";

const r = calcola(caricaAnno(2026), {
  attivita: [{ ateco: "62.01", ricavi: 40000 }],
  gestione: "separata",
});
console.log(r.netto, r.acconti); // 30041.25 { dovuti: true, prima: 1188.8, seconda: 1783.19 }
```

## 🗂️ Fonti dei dati · ⚠️ Limiti

I parametri sono in [`data/years/`](data/years/) (2025, 2026), ognuno con la sua fonte in [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md): L. 190/2014, Leggi di Bilancio 2025 e 2026, circolari INPS 27 e 38 del 2025, 8 e 14 del 2026.

- I coefficienti seguono la corrispondenza ATECO 2007 dell'Allegato 4, in vigore finché non arriva la tabella per i codici ATECO 2025.
- Senza `--dedotti` si assume che i contributi dedotti siano quelli dell'anno (anno a regime). Il primo anno deduci solo quello che hai davvero versato.
- Le casse professionali (Inarcassa, ENPAP, …) si gestiscono con aliquota e minimo propri, non ancora con tutte le regole di ogni cassa.
- **È una stima, non una consulenza fiscale.** Verifica con il tuo commercialista prima di pagare.

## ✅ Qualità

`npm run check` esegue typecheck, test unitari e controllo delle dimensioni del core; `npm run test:e2e` costruisce la web app e la prova con Playwright su desktop e mobile, con verifica di accessibilità axe. In CI: Node 22 e 24, copertura, controllo del pacchetto npm, test e2e. Stato della beta e report dei test: [docs/BETA.md](docs/BETA.md).

## 🧱 Architettura e roadmap

Il core (`src/core/`, ~460 righe, nessun I/O) è una funzione pura: `calcola(regole, input)`. Le regole di ogni anno sono JSON: **un anno nuovo è un file di dati, non codice**. Vedi [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e [docs/ROADMAP.md](docs/ROADMAP.md).

## 🤝 Contribuire

Prima issue facile: **le regole complete di una cassa professionale** (es. Inarcassa o ENPAP) in `calcolaContributi`, con un test calcolato a mano. Leggi [CONTRIBUTING.md](CONTRIBUTING.md); i contributi esterni richiedono il [CLA](CLA.md).

---

⭐ Se ti ha evitato un foglio Excel, una stella aiuta altre partite IVA a trovarlo.

## ❤️ Sostieni il progetto

IT — Se questo progetto ti fa risparmiare tempo, puoi offrirmi un caffè.
EN — If this project saves you time, you can buy me a coffee.

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-MRJonam91-ea4aaa?logo=githubsponsors)](https://github.com/sponsors/MRJonam91)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-mrjonam-ff5e5b?logo=kofi&logoColor=white)](https://ko-fi.com/mrjonam)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-mrjonam-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/mrjonam)
[![PayPal](https://img.shields.io/badge/PayPal-manorollo-00457c?logo=paypal&logoColor=white)](https://paypal.me/manorollo)

## 📄 Licenza

Codice: [AGPL-3.0-only](LICENSE) — lo usi in un prodotto chiuso o in un SaaS? È disponibile una [licenza commerciale](COMMERCIAL-LICENSE.md). Documentazione: CC BY-SA 4.0. Dettagli in [LICENSING.md](LICENSING.md).

Copyright (c) 2026 Manoj Rollo ([@MRJonam91](https://github.com/MRJonam91))
