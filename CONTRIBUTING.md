# Contribuire / Contributing

Grazie! / Thank you! 🙌

## 🇮🇹 Italiano

1. Apri prima una issue per discutere cambi grandi; per correzioni di dati o refusi vai pure diretto in PR.
2. Requisiti: Node ≥ 22.18 (esegue TypeScript direttamente, niente build per sviluppare).
3. `npm install`, poi `npm run check` (typecheck + test + dimensione del core) deve essere verde. Se tocchi la web app: `npm run test:e2e` (Playwright; la prima volta `npx playwright install chromium`).
4. Il core (`src/core/`) resta **senza I/O** e **sotto le 1.500 righe**. Rete, file e CLI vivono in `src/adapters/`.
5. **Un anno fiscale nuovo è un file di dati**: copia `data/years/2026.json`, aggiorna i valori citando la fonte in `sources` e in `docs/DATA_SOURCES.md`, aggiungi un test con un caso calcolato a mano.
6. Ogni file sorgente nuovo inizia con l'header SPDX (vedi i file esistenti).
7. **CLA obbligatorio**: il progetto ha doppia licenza (AGPL + commerciale), quindi alla prima PR commenta `I have read the CLA Document and I hereby sign the CLA`. Testo completo in [CLA.md](CLA.md).

**Issue facili**: regole complete di una cassa professionale (es. Inarcassa, ENPAP), traduzione dei messaggi in un'altra lingua, tabella dei coefficienti per codici ATECO 2025 appena pubblicata.

## 🇬🇧 English

1. Open an issue first for large changes; data fixes and typos can go straight to a PR.
2. Requirements: Node ≥ 22.18 (runs TypeScript directly, no build needed for development).
3. `npm install`, then `npm run check` (typecheck + tests + core size) must pass. If you touch the web app: `npm run test:e2e` (Playwright; first time `npx playwright install chromium`).
4. The core (`src/core/`) stays **I/O-free** and **under 1,500 lines**. Network, files and CLI live in `src/adapters/`.
5. **A new tax year is a data file**: copy `data/years/2026.json`, update the values citing the source in `sources` and in `docs/DATA_SOURCES.md`, add a test with a hand-computed case.
6. Every new source file starts with the SPDX header (see existing files).
7. **CLA required**: the project is dual-licensed (AGPL + commercial), so on your first PR comment `I have read the CLA Document and I hereby sign the CLA`. Full text in [CLA.md](CLA.md).

**Good first issues**: full rules for one professional fund (e.g. Inarcassa, ENPAP), message translation into another language, coefficient table for ATECO 2025 codes once published.
