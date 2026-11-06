# Changelog

Formato / Format: [Keep a Changelog](https://keepachangelog.com/it/1.1.0/) · [SemVer](https://semver.org/lang/it/).

## [Unreleased]

## [0.2.0-beta.1] - 2026-10-13

### Added / Aggiunto
- **Anno 2025** (circolari INPS 27/2025 e 38/2025): calcolo dei redditi 2025 e scadenzario dei versamenti 2026. / 2025 tax year.
- **Settore al posto del codice ATECO** (web: menu per riga; CLI: `--settore professioni`, `forfettario-kit settori`). / Sector instead of ATECO code.
- **Massimale ridotto IVS** per chi ha contributi prima del 1996 (`--ante-1996`, casella nella web app). / Lower IVS cap for pre-1996 contributors.
- Scadenzario: **crediti** da acconti versati in eccesso, **differimento al 30/07 con +0,40%**, rate fisse dell'anno dopo con i parametri nuovi quando disponibili. / Credits, July deferral, next-year fixed instalments.
- Avviso **margine verso 85.000 €** quando i ricavi superano l'80% della soglia. / Headroom to the 85k threshold.
- Web app: pulsante **Ricomincia**, anni etichettati «redditi 2026 · F24 2027», **Content Security Policy** rigida con hash dello script, `referrer` disattivato.
- Test: **property test** su 800 casi casuali (2 anni), **monotonia**, **e2e Playwright** desktop + mobile con **axe** (24 casi), copertura nel CI, controllo `npm pack`.
- Workflow **release** (release GitHub con la web app offline allegata, `npm publish --provenance` se è presente `NPM_TOKEN`) e **Dependabot**.

### Fixed / Corretto
- Importi in formato inglese (`40,000` era letto come 40). / English thousands separators.
- `--cassa-aliquota` accetta `14`, `14%` e `0,14`. / Fund rate accepts percentages.
- `--anno` non numerico ora dà un errore chiaro. / Clear error for invalid `--anno`.
- Web: la tabella F24 scorrevole è raggiungibile da tastiera (axe `scrollable-region-focusable`); il campo ATECO errato è segnalato con `aria-invalid`.
- Web: la riduzione INPS non viene più applicata se si torna alla Gestione separata.
- Il pacchetto npm non include più la web app compilata (`src/web` escluso dalla build).


## [0.2.0-alpha.1] - 2026-10-10

### Added / Aggiunto
- **Web app statica** (`npm run build:web` → `site/index.html`): form con più attività, gestioni INPS, riduzioni, cassa, primo anno; netto al mese, ripartizione dei ricavi, conto dal lordo al netto, IT/EN, tema chiaro/scuro, font inclusi, nessuna richiesta di rete. / **Static web app**: same engine, single self-contained HTML file, no network requests.
- **Scadenzario F24** dell'anno successivo con codici tributo (1790, 1791, 1792) e causali INPS (PXX, AF/AP, CF/CP), rate fisse 16/02 · 16/05 · 20/08 · 16/11, slittamento di weekend e festivi, modalità primo anno. / **F24 schedule** with tax codes, INPS reasons, weekend/holiday shifts and first-year mode.
- **Calendario `.ics`** con un evento per giorno di pagamento e promemoria 3 giorni prima (CLI `--ics`, pulsante nella web app). / **`.ics` calendar** export.
- CLI: `--scadenze` / `-s`, `--ics <file>`, `--primo-anno`; il JSON include `scadenzario`.
- Workflow GitHub Pages (`pages.yml`).

## [0.1.0] - 2026-10-08

### Added / Aggiunto
- Motore di calcolo del regime forfettario 2026: coefficienti di redditività (Allegato 4 L. 190/2014), imposta sostitutiva 15% / 5%, acconti 30/06 e 30/11. / Flat-rate regime engine for 2026: profitability coefficients, 15% / 5% substitute tax, June/November advances.
- Contributi INPS 2026: Gestione separata (26,07%), artigiani e commercianti con riduzione 35% o 50%, cassa professionale personalizzabile. / INPS 2026 contributions: Gestione separata, craftsmen and traders with 35% / 50% reductions, custom professional fund.
- Più attività con codici ATECO diversi nello stesso anno. / Multiple ATECO activities in the same year.
- Avvisi su soglie 85.000 / 100.000 euro e limite redditi da dipendente 35.000 euro. / Warnings for the 85k / 100k thresholds and the 35k employment income limit.
- CLI `forfettario-kit` (IT/EN, output JSON) e libreria TypeScript senza dipendenze a runtime. / `forfettario-kit` CLI (IT/EN, JSON output) and TypeScript library with no runtime dependencies.

[Unreleased]: https://github.com/MRJonam91/forfettario-kit/compare/v0.2.0-alpha.1...HEAD
[0.2.0-alpha.1]: https://github.com/MRJonam91/forfettario-kit/releases/tag/v0.2.0-alpha.1
[0.1.0]: https://github.com/MRJonam91/forfettario-kit/releases/tag/v0.1.0
