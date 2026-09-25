# Contribuire / Contributing — forfettario-kit

## 🇮🇹 Italiano

Grazie! Il progetto è pensato per essere capito in un'ora: il **core** (`src/core/`) resta sotto le
**1.500 righe** e tutto il resto (fonti dati, output, integrazioni) vive in `src/adapters/` o `plugins/`.

1. Apri una issue per discutere modifiche importanti.
2. `npm ci && npm test` devono essere verdi (Node ≥ 22.18, nessuna build necessaria).
3. Un test per ogni bug risolto o funzione aggiunta.
4. Header SPDX in ogni nuovo file sorgente (copia da un file esistente).
5. Messaggi di commit in stile [Conventional Commits](https://www.conventionalcommits.org/it/).
6. Firma ogni commit con il DCO: `git commit -s`.

Aggiungere una fonte dati o un'integrazione: vedi [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), sezione "Estendere".

## 🇬🇧 English

Thanks! The project is designed to be understood in one hour: the **core** (`src/core/`) stays under
**1,500 lines** and everything else (data sources, outputs, integrations) lives in `src/adapters/` or `plugins/`.

1. Open an issue to discuss significant changes.
2. `npm ci && npm test` must pass (Node ≥ 22.18, no build step needed).
3. One test for every fixed bug or added feature.
4. SPDX header in every new source file (copy it from an existing file).
5. [Conventional Commits](https://www.conventionalcommits.org/) messages.
6. Sign off every commit with the DCO: `git commit -s`.

Adding a data source or integration: see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), "Extending".
