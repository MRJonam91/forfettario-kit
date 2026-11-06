# Alfa 0.2.0-alpha.1 — definizione / definition

## 🇮🇹 Obiettivo

Una partita IVA forfettaria, senza aprire un terminale, deve poter rispondere in meno di un minuto a tre domande:

1. **Quanto mi resta al mese?** (netto dopo INPS e imposta)
2. **Quanto devo accantonare ogni mese?**
3. **Cosa pago, quando e con quale codice nell'F24 dell'anno prossimo?**

### Perimetro

| Incluso | Fuori dall'alfa |
|---|---|
| Web app statica (GitHub Pages, file unico, offline) e CLI | Login, salvataggio su server, account |
| Anno fiscale 2026, coefficienti Allegato 4 (ATECO 2007) | Anno 2025, tabella ATECO 2025 |
| Gestione separata, artigiani, commercianti (riduzioni 35%/50%), cassa con aliquota e minimo | Regole complete delle singole casse |
| Più attività con coefficienti diversi | Ricerca ATECO per descrizione |
| Scadenzario F24 dell'anno dopo: 1790/1791/1792, PXX, AF/AP, CF/CP; weekend e festivi spostati | Metodo previsionale, rateizzazione del saldo, maggiorazione 0,40% |
| Modalità «primo anno» (nessun acconto versato) | Confronto con il regime ordinario |
| Calendario `.ics` con promemoria 3 giorni prima | Notifiche push / email |
| IT/EN, tema chiaro/scuro, mobile | PWA installabile |

### Criteri di accettazione

- [x] Caso di riferimento: 40.000 €, ATECO 62.01, Gestione separata → netto 30.041,25 €, 2.503,44 €/mese; F24 2027 = 9.958,74 € (test automatici).
- [x] Contributi fissi 2026 identici alla circolare INPS 14/2026 (4.521,36 € artigiani, 4.611,64 € commercianti).
- [x] Rate fisse spostate al primo giorno lavorativo (16/05/2026 → 18/05/2026; 16/05/2027 → 17/05/2027).
- [x] File `.ics` conforme a RFC 5545 (CRLF, righe ≤ 75 ottetti, un evento per giorno, VALARM).
- [x] Web app: nessuna richiesta di rete, nessuno scroll orizzontale a 400 px, nessun errore in console.
- [x] Core < 1.500 righe, test e typecheck verdi in CI.
- [ ] Giro di prova con almeno 5 partite IVA e 1 commercialista (vedi sotto).

### Piano di prova per i tester

1. Apri la web app e inserisci i tuoi ricavi **dell'anno scorso**: il netto e lo scadenzario sono coerenti con quello che hai pagato quest'anno?
2. Confronta le righe F24 con i modelli F24 che hai pagato (codici, anni di riferimento, importi).
3. Prova «Primo anno», la riduzione 35% (artigiani/commercianti) e due attività con codici diversi.
4. Scarica il calendario e importalo in Google Calendar, Apple Calendario o Outlook.
5. Apri una issue con il modello «Bug / errore di calcolo» indicando il dato atteso e la fonte.

## 🇬🇧 Goal

A flat-rate freelancer, without a terminal, answers in under a minute: how much do I keep each month, how much should I set aside, and what do I pay, when and with which code in next year's F24. Scope, acceptance criteria and the tester plan are listed above; out of scope for the alpha: 2025 data, ATECO 2025 table, full professional-fund rules, forecast method, ordinary-regime comparison, PWA.
