# Architettura / Architecture

```
data/years/2026.json ─► src/adapters/rules.ts ─► src/core/calc.ts ─► src/core/scadenze.ts ─┬► src/adapters/cli.ts   (terminale, JSON, .ics)
  (regole dell'anno)      (legge il JSON)          (funzione pura)    (F24 dell'anno dopo)      └► src/web/app.ts       (web app, build con esbuild)
```

## 🇮🇹 I 5 concetti del core

1. **`YearRules`** (`src/core/types.ts`) — tutto ciò che cambia ogni anno: soglie, aliquote, tabella ATECO, parametri INPS. Vive in `data/years/<anno>.json`, mai nel codice.
2. **`trovaGruppo`** (`src/core/ateco.ts`) — dal codice ATECO al coefficiente di redditività, con il prefisso più lungo che combacia (`47.81` batte `47.8x`, `46.1` batte `46`).
3. **`calcolaContributi`** (`src/core/inps.ts`) — Gestione separata, artigiani/commercianti (fissi sul minimale + eccedenza a due fasce, riduzioni 35%/50%), cassa con aliquota e minimo.
4. **`calcola`** (`src/core/calc.ts`) — reddito lordo → contributi → imponibile → imposta → acconti → netto e avvisi. Nessun I/O: stesso input, stesso output.
5. **`calcolaScadenzario`** (`src/core/scadenze.ts`) — dal risultato alle righe F24 dell'anno dopo: data effettiva (weekend e festivi spostati), codice tributo o causale, anno di riferimento, importo. Date, percentuali di acconto e codici stanno nel blocco `calendario` del JSON.

La web app (`src/web/app.ts` + `web/app.html` + `web/app.css`) importa lo stesso core; `scripts/build-web.mjs` la impacchetta con esbuild in un solo HTML con CSS, font IBM Plex (OFL), JS e dati inclusi. / The web app imports the same core and is bundled into one self-contained HTML file.

### Estendere

- **Un anno nuovo**: aggiungi `data/years/2027.json`. `caricaAnno()` lo trova da solo e il test `ogni divisione ATECO 2007 è coperta in ogni anno` lo verifica.
- **Un calcolo nuovo** (es. una cassa specifica): aggiungi un `case` in `calcolaContributi` e i parametri nel JSON dell'anno.
- **Una nuova interfaccia** (bot Telegram, API HTTP, pagina web): scrivi un adapter in `src/adapters/` che chiama `calcola()`. Esempio pronto: [`examples/confronto-gestioni.ts`](../examples/confronto-gestioni.ts).

## 🇬🇧 The 5 core concepts

1. **`YearRules`** — everything that changes yearly (thresholds, rates, ATECO table, INPS parameters) lives in `data/years/<year>.json`, never in code.
2. **`trovaGruppo`** — ATECO code to profitability coefficient, longest matching prefix wins.
3. **`calcolaContributi`** — Gestione separata, craftsmen/traders (fixed part on the minimum + two-bracket surplus, 35%/50% reductions), professional fund with rate and minimum.
4. **`calcola`** — gross income → contributions → tax base → tax → advances → net and warnings. No I/O.
5. **`calcolaScadenzario`** — from the result to next year's F24 rows: actual due date (weekends and holidays shifted), tax code or INPS reason, reference year, amount.

### Extending

- **New year**: add `data/years/2027.json`; it is picked up and validated by tests automatically.
- **New calculation** (e.g. a specific fund): add a `case` to `calcolaContributi` and its parameters to the year JSON.
- **New interface** (Telegram bot, HTTP API, web page): write an adapter in `src/adapters/` that calls `calcola()`. Ready-made example: [`examples/confronto-gestioni.ts`](../examples/confronto-gestioni.ts).

Vincolo / Constraint: `src/core/` < 1.500 righe non vuote, verificato in CI / non-empty lines, checked in CI.
