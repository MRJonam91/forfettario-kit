# Lancio / Launch

## Metadati / Metadata

- **Nome / Name**: `forfettario-kit`
- **Description**: `Calcolatore regime forfettario 2026: tasse, contributi INPS, netto mensile e scadenze F24 con codici tributo. Web app + CLI, i dati restano nel browser. Italian flat-rate tax calculator.`
- **Website**: https://mrjonam91.github.io/forfettario-kit/
- **Topics (18)**: `forfettario` `regime-forfettario` `partita-iva` `flat-tax` `tasse` `calcolatore` `inps` `gestione-separata` `fisco-italiano` `freelance` `italy` `tax-calculator` `cli` `typescript` `nodejs` `ateco` `contributi-inps` `open-source`
- **Social preview**: `docs/assets/social-preview.png` (1280×640) — Settings → General → Social preview.
- **Parole chiave / Keywords IT**: calcolo tasse forfettario, quanto pago di tasse partita iva, calcolatore forfettario 2026, contributi inps forfettario, netto partita iva forfettaria, acconti forfettario.
- **Keywords EN**: italian flat tax calculator, regime forfettario calculator, italy freelancer taxes, italian vat number tax, digital nomad italy tax.

## Checklist pre-pubblicazione / Pre-publication checklist

- [ ] CI verde su `main` / CI green
- [ ] Sponsorship attiva: Settings → General → Features → Sponsorships (+ GitHub Sponsors abilitato su MRJonam91)
- [ ] Social preview caricata / uploaded
- [ ] Release `v0.2.0-beta.1` (pre-release) creata dal workflow `release.yml` con la web app offline allegata / Release created by the release workflow
- [ ] (facoltativo) secret `NPM_TOKEN` nel repo per pubblicare su npm con tag `next` / optional npm publish
- [ ] GitHub Pages: Settings → Pages → Source = **GitHub Actions** (funziona con repo pubblica o piano Pro), poi verifica https://mrjonam91.github.io/forfettario-kit/
- [ ] Inviare il link della web app a 3–5 partite IVA e 1 commercialista per un giro di prova (alfa)
- [ ] App CLA (workflow `cla.yml`) testata con una PR di prova / tested with a dummy PR
- [ ] `npm publish` (nome `forfettario-kit` libero su npm) → `npx forfettario-kit` funziona
- [ ] 3 issue `good first issue` aperte: anno 2025, Inarcassa, tabella ATECO 2025
- [ ] Repo resa pubblica: `gh repo edit MRJonam91/forfettario-kit --visibility public --accept-visibility-change-consequences`

## Canali e tempi / Channels and timing

- **Momento migliore**: inizio giugno (saldo e primo acconto al 30/06) o metà novembre (secondo acconto al 30/11); in alternativa gennaio (nuove aliquote INPS). Martedì–giovedì, 9–11 per il pubblico italiano.
- r/ItaliaPersonalFinance, r/ItalyInformatica, r/italy (flair Economia), r/commercialisti, gruppi Facebook/Telegram "Partita IVA forfettaria", LinkedIn con la GIF/SVG.
- EN: r/digitalnomad e r/ItalyExpat (nomadi digitali con partita IVA italiana), Show HN, liste `awesome-italy` / `awesome-cli-apps`.
- Articolo dev.to/Medium: "Ho trasformato il regime forfettario in una funzione pura da 300 righe".
- Rispondere a tutti i commenti nelle prime 3 ore. / Reply to every comment in the first 3 hours.

## Bozze / Drafts

**LinkedIn / Reddit (IT)**
> Ogni giugno la stessa domanda: "quanto devo mettere da parte?". Ho scritto forfettario-kit, un calcolatore open source per il regime forfettario 2026: un comando e vedi contributi INPS, imposta, netto mensile e acconti. Zero dipendenze, dati con le fonti (circolari INPS 2026), funziona anche come libreria. `npx forfettario-kit 40000 --ateco 62.01` — feedback benvenuti, soprattutto da commercialisti.

**Show HN (EN)**
> Show HN: forfettario-kit – Italy's flat-rate freelancer tax in one command

**Telegram / X (IT)**
> 💶 Forfettario 2026: quanto ti resta davvero? `npx forfettario-kit 40000 --ateco 62.01` → tasse, INPS, netto mensile e acconti. Open source.
