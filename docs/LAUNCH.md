# Lancio, SEO e promozione / Launch, SEO & promotion — forfettario-kit

## 1. Metadati repo / Repo metadata (impostati da `publish-private.ps1`)

- **Description (≤ 350 char, keyword first):** Italian flat-tax (regime forfettario) toolkit for freelancers: tax, INPS contributions, net income, target revenue, 40/60 advances and an iCal of F24/INPS deadlines. Yearly params as data.
- **Descrizione IT (per social/README):** Kit per partite IVA in regime forfettario: imposta sostitutiva, contributi INPS, netto, fatturato obiettivo, acconti 40/60 e calendario iCal delle scadenze F24/INPS. Parametri annuali come dati.
- **Topics (15/20):** `forfettario regime-forfettario partita-iva freelance tasse inps gestione-separata f24 italy tax-calculator ical cli typescript nodejs fintech`
- **Website:** GitHub Pages della demo / demo on GitHub Pages (`https://mrjonam91.github.io/forfettario-kit/`)
- **Social preview (1280×640):** titolo + una riga del problema + screenshot della demo → *Settings → General → Social preview*.
- **npm keywords:** già in `package.json`.

## 2. Parole chiave SEO / SEO keywords

- IT: calcolo tasse forfettario, calcolatore regime forfettario 2026, quanto pago di tasse partita iva forfettaria, scadenze forfettario calendario, acconti forfettario 40 60
- EN: italian flat tax calculator, forfettario calculator, italy freelancer tax

Regole: la parola chiave principale va nel nome repo, nella description, nel primo H1/H2 del README e nell'`alt` della demo.
GitHub indicizza README, description e topics; Google indicizza soprattutto README e GitHub Pages.

## 3. Checklist prima di rendere pubblica / Before going public

- [ ] `npm test` verde, CI verde / tests and CI green
- [ ] Demo GIF/SVG aggiornata (`vhs docs/demo.tape`) / demo refreshed
- [ ] Social preview caricata / social preview uploaded
- [ ] Sponsorship attiva (Settings → Features → Sponsorships) / Sponsorships enabled
- [ ] Release `v0.1.0` con note IT/EN / release with IT/EN notes
- [ ] Marker anti-plagio registrati in `_provenance/` (privato) / markers registered privately
- [ ] GitHub Pages attivo per la demo web (se presente) / Pages enabled for the web demo

## 4. Dove condividere / Where to share

🇮🇹
- r/ItaliaPersonalFinance, r/italyfinance, r/ItalyInformatica (tanti dev freelance)
- Gruppi Facebook/Telegram 'Partita IVA forfettaria', community freelance (Freelancecamp, Slow Working, Developers Italia)
- LinkedIn: post a giugno e novembre (scadenze) con il calendario iCal gratuito
- Newsletter per freelance e podcast di fisco per partite IVA

🌍
- r/digitalnomad, r/expats, r/italy (foreign freelancers moving to Italy)
- Show HN (tax-rules-as-data angle)

Tempistica consigliata: martedì–giovedì, 9:00–11:00 CET per l'Italia; 15:00–17:00 CET per HN/Reddit (mattina USA).
Rispondi a tutti i commenti nelle prime 3 ore: è ciò che spinge il post in alto.

## 5. Bozze post / Draft posts

**Hacker News (Show HN):**
> Show HN: Italian flat-tax calculator with yearly rules as reviewable JSON

**Post IT (LinkedIn / Telegram / Facebook):**
> Partita IVA forfettaria? forfettario-kit ti dice in 2 secondi tasse, INPS, netto, quanto fatturare per il netto che vuoi e ti dà il calendario delle scadenze da importare nel telefono. Gratis, open source, parametri annuali verificabili da tutti.

**Post EN (Reddit / X / Mastodon / Bluesky):**
> Moving to Italy as a freelancer? The 'regime forfettario' is great but confusing. forfettario-kit computes tax, social security, net income and exports every deadline to your calendar. Apache-2.0.

## 6. Crescita continua / Ongoing growth

- Una issue `good first issue` sempre aperta per ogni fonte dati o città/Paese mancante.
- Release frequenti e piccole (ogni release = nuova notifica ai watcher).
- Aggiungi il progetto alle liste *awesome-* pertinenti: awesome-italy, awesome-freelance, awesome-fintech.
- Scrivi un post tecnico (dev.to / Medium / blog personale) su "come l'ho costruito", con link alla repo.
- Badge "Sponsor" e link donazioni in README, `--help` e footer CLI (già presenti).
