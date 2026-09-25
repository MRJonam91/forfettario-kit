# Architettura / Architecture — forfettario-kit

```
data/years/2026.json ──► loadYear ──► calculate(input) ──► Result ──► CLI · JSON · web
                                   ├─► revenueForNet (bisezione)
                                   └─► deadlinesFor ──► toIcs
```

## 🇮🇹 Concetti del core
1. **YearParams**: tutto ciò che cambia ogni anno (aliquote, coefficienti, minimali, massimali, soglie, scadenze) è dato, non codice.
2. **calculate**: ricavi × coefficiente → reddito lordo → contributi (per cassa) → imponibile → imposta → netto → acconti anno successivo (metodo storico, 40/60, soglie 51,65 € e 257,52 €).
3. **ICS**: scadenze filtrate per cassa, eventi giornalieri con promemoria.

### Estendere
- Nuovo anno: copia il JSON, aggiorna i valori con le fonti, aggiungi un test con un caso calcolato a mano.
- Casse professionali (Inarcassa, Cassa Forense…): nuovo tipo `Fund` + parametri; il calcolo resta nel core.
- Web app: stesso core compilato in ES module, form statico su GitHub Pages.

## 🇬🇧 Core concepts
1. **YearParams**: everything that changes yearly is data. 2. **calculate**: revenue → gross income → contributions → taxable → tax → net → next-year advances. 3. **ICS** export per fund.

### Extending
- New year = JSON + hand-checked test. Professional funds = new `Fund`. Web = same core as ES module.
