# Beta 0.2.0-beta.1

## 🇮🇹 Cosa cambia rispetto all'alfa

| Area | Novità |
|---|---|
| Dati | Anno **2025** (circolari INPS 27 e 38/2025) accanto al 2026: a ottobre-novembre 2026 calcoli il secondo acconto e il saldo di giugno partendo dai redditi 2025 |
| Input | **Settore** al posto del codice ATECO; **massimale ridotto** per chi ha contributi prima del 1996; importi in formato italiano e inglese; aliquota cassa in percentuale |
| Scadenzario | **Crediti** da acconti versati in eccesso; **30/07 con +0,40%**; rate fisse dell'anno dopo con i parametri nuovi |
| Avvisi | Quanto puoi ancora incassare prima di **85.000 €** (sopra l'80% della soglia) |
| Web app | **Ricomincia**, anni etichettati «redditi · F24», **CSP** rigida senza rete, tabella F24 navigabile da tastiera, campi errati segnalati agli screen reader |
| Rilascio | Workflow **release** con web app offline allegata e npm opzionale, **Dependabot**, controllo del pacchetto npm in CI |

## Report dei test

| Livello | Cosa | Esito |
|---|---|---|
| Unità | 40 test (`node:test`): casi calcolati a mano, totali ufficiali delle circolari INPS 2025 e 2026, ATECO, CLI, `.ics` | ✅ 40/40 |
| Proprietà | 400 input casuali per anno (2 anni) con seme fisso: il conto torna al centesimo, nessun valore negativo, imposta ≤ 15%, scadenze solo in giorni feriali, ordinate e nell'anno giusto; monotonia di contributi e imposta | ✅ |
| E2E | 12 scenari Playwright × desktop e mobile = 24: caso di riferimento, nessuna richiesta di rete, commerciante primo anno, ATECO errato, settore + seconda attività, IT/EN, anno 2025, persistenza e Ricomincia, download `.ics`, niente scroll orizzontale | ✅ 24/24 |
| Accessibilità | axe WCAG 2 A/AA su desktop e mobile, contrasto in tema scuro | ✅ nessuna violazione grave |
| Copertura | righe 96%, funzioni 97% (core: 98–100%) | ✅ |
| Pacchetto | `npm pack` + installazione in una cartella pulita: `npx forfettario-kit` e `import { calcola }` funzionano | ✅ |
| Dimensioni | core 462 righe (limite 1.500); web app 185 KB in un file, JS 37 KB | ✅ |

## Limiti noti

- Coefficienti con la corrispondenza ATECO 2007 dell'Allegato 4, in attesa della tabella ufficiale per i codici ATECO 2025.
- Casse professionali: solo aliquota e contributo minimo, non le regole complete di ogni cassa.
- Acconti con il solo metodo storico; niente metodo previsionale né rateizzazione del saldo.
- Regole da far confermare a un commercialista: acconti Gestione separata 80% (40 + 40), acconti sull'eccedenza IVS 100% (50 + 50), causali AP/CP anche per il saldo.

## Come dare feedback

Apri una issue con il modello «Bug / errore di calcolo»: comando o dati inseriti, risultato atteso e fonte (F24 pagato, circolare, calcolo del commercialista).

## 🇬🇧 Summary

The beta adds the 2025 tax year, a sector picker for people who don't know their ATECO code, the pre-1996 contribution cap, credits for overpaid advances, the July +0.40% option, a strict CSP for the web app, property-based and Playwright end-to-end tests with axe accessibility checks, and a release workflow that attaches the offline web app to every GitHub release. Test report and known limits are in the tables above.
