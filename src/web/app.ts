// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)
//
// Interfaccia web statica: stesso core della CLI, nessun server, nessun dato inviato.

import { gruppoPerId, trovaGruppo } from "../core/ateco.ts";
import { calcola } from "../core/calc.ts";
import { calcolaScadenzario, fissiAnnoDopo } from "../core/scadenze.ts";
import type { Attivita, Gestione, Input, Riduzione, Risultato, Scadenzario, YearRules } from "../core/types.ts";
import { avviso, data, fmt, settore, voce, type Lang } from "../adapters/i18n.ts";
import { scadenzarioIcs } from "../adapters/ics.ts";
import { parseAliquota, parseImporto } from "../adapters/importi.ts";

declare const __FK_YEARS__: YearRules[];
const YEARS = [...__FK_YEARS__].sort((a, b) => b.year - a.year);
const STORE = "fk.web.v1";

const W = {
  it: {
    h1: "Quanto ti resta davvero, in regime forfettario",
    lead: "Inserisci ricavi e codice ATECO: contributi INPS, imposta sostitutiva, netto al mese e tutte le date dell'F24 con i codici tributo. I dati restano nel tuo browser.",
    formTitle: "I tuoi dati", example: "Esempio", activities: "Attività e ricavi incassati", addActivity: "+ Aggiungi un'altra attività",
    pension: "Previdenza", gSeparata: "Gestione separata", gArtigiani: "Artigiani", gCommercianti: "Commercianti", gCassa: "Cassa professionale",
    reduction: "Riduzione contributi", redNone: "Nessuna", red35: "35% (forfettari, su domanda)", red50: "50% (nuovi iscritti dal 2025)",
    fundRate: "Aliquota cassa (%)", fundMin: "Contributo minimo (€)", situation: "Situazione",
    startup: "Nuova attività: aliquota 5% per i primi 5 anni", firstYear: "Primo anno: non hai ancora versato acconti",
    advanced: "Valori precisi (facoltativi)", deducted: "Contributi versati nell'anno (€)", costs: "Spese reali dell'anno (€)",
    employee: "Redditi da dipendente o pensione, anno prima (€)", youKeep: "Ti restano", perMonth: "al mese", perYear: "all'anno",
    setAside: "accantona", perMonthShort: "al mese", ledgerTitle: "Dal lordo al netto", f24Title: "Versamenti F24",
    addCalendar: "Aggiungi al calendario", copyList: "Copia elenco", thDate: "Scadenza", thSection: "Sezione", thCode: "Codice",
    thWhat: "Voce", thAmount: "Importo", total: "Totale", coffeeTitle: "Ti ha evitato un pomeriggio di fogli Excel?",
    coffeeText: "forfettario-kit è gratuito e open source. Se ti è utile, puoi sostenerlo.", howTitle: "Come si calcola",
    how1t: "Coefficiente di redditività", how1: "Nel forfettario non deduci le spese: il reddito è una percentuale fissa dei ricavi, dal 40% all'86% secondo il codice ATECO (Allegato 4, L. 190/2014).",
    how2t: "Contributi INPS", how2: "Si calcolano sul reddito lordo. Gestione separata 26,07%; artigiani e commercianti pagano contributi fissi fino al minimale di 18.808 € più una percentuale sull'eccedenza.",
    how3t: "Imposta sostitutiva", how3: "15%, o 5% per i primi 5 anni di una nuova attività, sul reddito lordo meno i contributi versati nell'anno.",
    how4t: "Acconti", how4: "Ogni anno paghi il saldo dell'anno prima e gli acconti di quello in corso: 40% a giugno e 60% a novembre per l'imposta, 80% dei contributi per la Gestione separata.",
    disclaimer: "Stima indicativa basata sui parametri ufficiali dell'anno: non è una consulenza fiscale. Verifica con il tuo commercialista prima di pagare.",
    privacy: "Nessun dato viene inviato: il calcolo avviene nel tuo browser.", sources: "Fonti",
    // dinamici
    atecoCode: "Codice ATECO", revenue: "Ricavi (€)", remove: "Rimuovi attività", dedottiPh: "stima automatica",
    ricavi: "Ricavi incassati", redditoLordo: "Reddito lordo", contributi: "Contributi INPS", contributiCassa: "Contributi cassa",
    imponibile: "Imponibile", imposta: "Imposta sostitutiva", spese: "Spese reali", netto: "Netto annuo",
    dedottiNote: "dedotti", netShort: "Netto", inpsShort: "Contributi", taxShort: "Imposta", costsShort: "Spese",
    erario: "Erario", inps: "INPS", rif: "anno di rif.", noPayments: "Nessun versamento dovuto.",
    notaRegime: "Ipotesi: anno a regime, con gli acconti dell'anno prima già versati. Spunta «Primo anno» se hai aperto da poco.",
    notaPrimo: "Primo anno: nessun acconto versato, quindi a giugno paghi il saldo intero più il primo acconto.",
    notaCassa: "I contributi della cassa seguono il calendario della tua cassa e non sono inclusi.",
    atecoNote: "Coefficienti ATECO 2007 (Allegato 4), in attesa della tabella per i codici ATECO 2025.",
    badCode: "Codice non riconosciuto: controlla le prime cifre.", needActivity: "Inserisci almeno un codice ATECO valido con i ricavi.",
    icsReady: "Calendario creato. Se il download non parte, usa «Copia elenco»", copied: "Elenco copiato negli appunti.", copyFail: "Copia non riuscita: seleziona la tabella e copiala a mano.",
    contributiAuto: "stima a regime",
    orSector: "oppure scegli il settore", sectorPh: "— settore —", ante1996: "Contributi versati prima del 1996 (massimale ridotto)",
    reset: "Ricomincia", yearOpt: "redditi", f24Opt: "F24",
    differimento: "Puoi pagare le voci di giugno entro il {data} con la maggiorazione dello {pct}: {importo}.",
    credito: "Acconti versati in eccesso, da compensare nell'F24: {voci}.", creditoImposta: "imposta", creditoInps: "INPS",
  },
  en: {
    h1: "What you really keep under Italy's flat-rate regime",
    lead: "Enter revenue and ATECO code: INPS contributions, flat tax, monthly net and every F24 payment date with its tax code. Your data stays in your browser.",
    formTitle: "Your data", example: "Example", activities: "Activities and revenue collected", addActivity: "+ Add another activity",
    pension: "Pension fund", gSeparata: "Gestione separata", gArtigiani: "Craftsmen", gCommercianti: "Traders", gCassa: "Professional fund",
    reduction: "Contribution reduction", redNone: "None", red35: "35% (flat-rate, on request)", red50: "50% (new from 2025)",
    fundRate: "Fund rate (%)", fundMin: "Minimum contribution (€)", situation: "Situation",
    startup: "New business: 5% rate for the first 5 years", firstYear: "First year: no advances paid yet",
    advanced: "Exact values (optional)", deducted: "Contributions paid this year (€)", costs: "Actual costs this year (€)",
    employee: "Employment or pension income, previous year (€)", youKeep: "You keep", perMonth: "per month", perYear: "per year",
    setAside: "set aside", perMonthShort: "monthly", ledgerTitle: "From gross to net", f24Title: "F24 payments",
    addCalendar: "Add to calendar", copyList: "Copy list", thDate: "Due", thSection: "Section", thCode: "Code",
    thWhat: "Item", thAmount: "Amount", total: "Total", coffeeTitle: "Saved you an afternoon of spreadsheets?",
    coffeeText: "forfettario-kit is free and open source. If it helps you, you can support it.", howTitle: "How it works",
    how1t: "Profitability coefficient", how1: "Costs are not deducted: taxable income is a fixed share of revenue, from 40% to 86% depending on the ATECO code (Allegato 4, L. 190/2014).",
    how2t: "INPS contributions", how2: "Computed on gross income. Gestione separata 26.07%; craftsmen and traders pay fixed contributions up to the 18,808 € minimum plus a percentage above it.",
    how3t: "Flat tax", how3: "15%, or 5% for the first 5 years of a new business, on gross income minus contributions paid during the year.",
    how4t: "Advances", how4: "Each year you pay last year's balance and this year's advances: 40% in June and 60% in November for the tax, 80% of contributions for Gestione separata.",
    disclaimer: "Estimate based on the year's official parameters, not tax advice. Check with your accountant before paying.",
    privacy: "No data is sent anywhere: everything runs in your browser.", sources: "Sources",
    atecoCode: "ATECO code", revenue: "Revenue (€)", remove: "Remove activity", dedottiPh: "automatic estimate",
    ricavi: "Revenue collected", redditoLordo: "Gross taxable income", contributi: "INPS contributions", contributiCassa: "Fund contributions",
    imponibile: "Tax base", imposta: "Flat tax", spese: "Actual costs", netto: "Net per year",
    dedottiNote: "deducted", netShort: "Net", inpsShort: "Contributions", taxShort: "Tax", costsShort: "Costs",
    erario: "Tax office", inps: "INPS", rif: "ref. year", noPayments: "No payments due.",
    notaRegime: "Assumes a steady year, with last year's advances already paid. Tick “First year” if you started recently.",
    notaPrimo: "First year: no advances paid, so in June you pay the full balance plus the first advance.",
    notaCassa: "Professional fund contributions follow your fund's own calendar and are not included.",
    atecoNote: "ATECO 2007 coefficients (Allegato 4), pending the table for ATECO 2025 codes.",
    badCode: "Code not recognised: check the first digits.", needActivity: "Enter at least one valid ATECO code with revenue.",
    icsReady: "Calendar created. If the download does not start, use “Copy list”", copied: "List copied to the clipboard.", copyFail: "Copy failed: select the table and copy it manually.",
    contributiAuto: "steady-state estimate",
    orSector: "or pick your sector", sectorPh: "— sector —", ante1996: "Contributions paid before 1996 (lower cap)",
    reset: "Start over", yearOpt: "income", f24Opt: "F24",
    differimento: "You can pay the June items by {data} with a {pct} surcharge: {importo}.",
    credito: "Advances overpaid, to offset in the F24: {voci}.", creditoImposta: "tax", creditoInps: "INPS",
  },
} as const;
type Key = keyof (typeof W)["it"];

interface Stato {
  lang: Lang;
  anno: number;
  attivita: { ateco: string; gruppo?: string; ricavi: string }[];
  gestione: Gestione;
  riduzione: Riduzione;
  cassaAliquota: string;
  cassaMinimo: string;
  startup: boolean;
  primoAnno: boolean;
  ante1996: boolean;
  dedotti: string;
  spese: string;
  dipendente: string;
  esempio: boolean;
}

const ESEMPIO: Stato = {
  lang: navigator.language?.toLowerCase().startsWith("it") === false ? "en" : "it",
  anno: YEARS[0]?.year ?? 2026,
  attivita: [{ ateco: "62.01", ricavi: "40.000" }],
  gestione: "separata",
  riduzione: "nessuna",
  cassaAliquota: "14",
  cassaMinimo: "0",
  startup: false,
  primoAnno: false,
  ante1996: false,
  dedotti: "",
  spese: "",
  dipendente: "",
  esempio: true,
};

function carica(): Stato {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return { ...ESEMPIO, ...(JSON.parse(raw) as Partial<Stato>) };
  } catch {
    /* storage non disponibile */
  }
  return structuredClone(ESEMPIO);
}
function salva(): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(st));
  } catch {
    /* storage non disponibile */
  }
}

let st = carica();
if (!YEARS.some((y) => y.year === st.anno)) st.anno = YEARS[0]?.year ?? st.anno;
let ultimo: { r: Risultato; s: Scadenzario } | undefined;

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const t = (k: Key): string => W[st.lang][k];
const eur = (n: number) => fmt.eur(st.lang, n);
const num = (s: string): number | undefined => {
  if (!s.trim()) return undefined;
  try {
    return parseImporto(s);
  } catch {
    return undefined;
  }
};
const el = (tag: string, attrs: Record<string, string> = {}, text = ""): HTMLElement => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text) e.textContent = text;
  return e;
};
const rules = (): YearRules => YEARS.find((y) => y.year === st.anno) ?? (YEARS[0] as YearRules);

/* ---------- lingua ---------- */
function applicaLingua(): void {
  document.documentElement.lang = st.lang;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((n) => {
    const k = n.dataset.i18n as Key;
    if (k in W[st.lang]) n.textContent = W[st.lang][k];
  });
  $("lang-it").setAttribute("aria-pressed", String(st.lang === "it"));
  $("lang-en").setAttribute("aria-pressed", String(st.lang === "en"));
  $<HTMLInputElement>("dedotti").placeholder = t("dedottiPh");
}

/* ---------- form ---------- */
function disegnaAttivita(): void {
  const box = $("attivita");
  box.replaceChildren();
  st.attivita.forEach((a, i) => {
    const row = el("div", { class: "att" });
    const fc = el("div", { class: "field" });
    fc.append(el("label", { for: `att-code-${i}` }, t("atecoCode")));
    const code = el("input", { id: `att-code-${i}`, type: "text", inputmode: "decimal", value: a.ateco, placeholder: "62.01" }) as HTMLInputElement;
    fc.append(code);
    const fr = el("div", { class: "field" });
    fr.append(el("label", { for: `att-ric-${i}` }, t("revenue")));
    const ric = el("input", { id: `att-ric-${i}`, type: "text", inputmode: "decimal", value: a.ricavi, placeholder: "40.000" }) as HTMLInputElement;
    fr.append(ric);
    const rm = el("button", { type: "button", class: "rm", "aria-label": t("remove"), title: t("remove") }, "×") as HTMLButtonElement;
    rm.disabled = st.attivita.length === 1;
    rm.addEventListener("click", () => {
      st.attivita.splice(i, 1);
      modificato();
      disegnaAttivita();
      aggiorna();
    });
    const hint = el("p", { class: "hint", id: `att-hint-${i}` });
    const alt = el("div", { class: "alt" });
    alt.append(el("label", { for: `att-set-${i}` }, t("orSector")));
    const sel = el("select", { id: `att-set-${i}` }) as HTMLSelectElement;
    sel.append(el("option", { value: "" }, t("sectorPh")));
    for (const g of rules().ateco.groups) {
      const o = el("option", { value: g.id }, `${fmt.pct(st.lang, g.coefficiente)} · ${settore(st.lang, g)}`) as HTMLOptionElement;
      o.selected = !a.ateco.trim() && a.gruppo === g.id;
      sel.append(o);
    }
    alt.append(sel);
    code.addEventListener("input", () => {
      a.ateco = code.value;
      if (code.value.trim()) { delete a.gruppo; sel.value = ""; }
      modificato();
      aggiorna();
    });
    sel.addEventListener("change", () => {
      if (sel.value) { a.gruppo = sel.value; a.ateco = ""; code.value = ""; } else delete a.gruppo;
      modificato();
      aggiorna();
    });
    ric.addEventListener("input", () => { a.ricavi = ric.value; modificato(); aggiorna(); });
    row.append(fc, fr, rm, hint, alt);
    box.append(row);
  });
}

function sincronizzaForm(): void {
  const sel = $<HTMLSelectElement>("anno");
  sel.replaceChildren(...YEARS.map((y) => {
    const o = el("option", { value: String(y.year) }, `${t("yearOpt")} ${y.year} · ${t("f24Opt")} ${y.year + 1}`) as HTMLOptionElement;
    o.selected = y.year === st.anno;
    return o;
  }));
  const radio = document.querySelector<HTMLInputElement>(`input[name="gestione"][value="${st.gestione}"]`);
  if (radio) radio.checked = true;
  $<HTMLSelectElement>("riduzione").value = st.riduzione;
  $<HTMLInputElement>("cassa-aliquota").value = st.cassaAliquota;
  $<HTMLInputElement>("cassa-minimo").value = st.cassaMinimo;
  $<HTMLInputElement>("startup").checked = st.startup;
  $<HTMLInputElement>("primo-anno").checked = st.primoAnno;
  $<HTMLInputElement>("ante1996").checked = st.ante1996;
  $<HTMLInputElement>("dedotti").value = st.dedotti;
  $<HTMLInputElement>("spese").value = st.spese;
  $<HTMLInputElement>("dipendente").value = st.dipendente;
  disegnaAttivita();
}

function modificato(): void {
  st.esempio = false;
  salva();
}

function leggiInput(): Input | undefined {
  const r = rules();
  const valide: Attivita[] = [];
  st.attivita.forEach((a, i) => {
    const hint = document.getElementById(`att-hint-${i}`);
    const code = document.getElementById(`att-code-${i}`);
    const ricavi = num(a.ricavi);
    let att: Attivita | undefined;
    if (hint) { hint.replaceChildren(); hint.classList.remove("bad"); }
    code?.removeAttribute("aria-invalid");
    try {
      const g = a.ateco.trim() ? trovaGruppo(r, a.ateco) : a.gruppo ? gruppoPerId(r, a.gruppo) : undefined;
      if (g) {
        att = a.ateco.trim() ? { ateco: a.ateco.trim(), ricavi: ricavi ?? 0 } : { gruppo: g.id, ricavi: ricavi ?? 0 };
        hint?.append(el("b", {}, fmt.pct(st.lang, g.coefficiente)), document.createTextNode(` · ${settore(st.lang, g)}`));
      }
    } catch {
      hint?.classList.add("bad");
      code?.setAttribute("aria-invalid", "true");
      if (hint) hint.textContent = t("badCode");
    }
    if (att && ricavi !== undefined) valide.push(att);
  });
  if (!valide.length) return undefined;
  const ivs = st.gestione === "artigiani" || st.gestione === "commercianti";
  const input: Input = { attivita: valide, gestione: st.gestione, riduzione: ivs ? st.riduzione : "nessuna", startup: st.startup };
  if (ivs && st.ante1996) input.ante1996 = true;
  if (st.gestione === "cassa") {
    let aliquota = 0;
    try { aliquota = parseAliquota(st.cassaAliquota); } catch { /* resta 0: errore mostrato dal core */ }
    input.cassa = { aliquota, minimo: num(st.cassaMinimo) ?? 0 };
  }
  const ded = num(st.dedotti), sp = num(st.spese), dip = num(st.dipendente);
  if (ded !== undefined) input.contributiDedotti = ded;
  if (sp !== undefined) input.spese = sp;
  if (dip !== undefined) input.redditoDipendente = dip;
  return input;
}

/* ---------- esito ---------- */
function aggiorna(): void {
  $("esempio").hidden = !st.esempio;
  $("reset").hidden = st.esempio;
  $("riduzione-wrap").hidden = !(st.gestione === "artigiani" || st.gestione === "commercianti");
  $("cassa-wrap").hidden = st.gestione !== "cassa";
  const err = $("errore");
  const input = leggiInput();
  if (!input) {
    err.textContent = t("needActivity");
    err.hidden = false;
    return;
  }
  try {
    const r = calcola(rules(), input);
    const fissi = fissiAnnoDopo(YEARS.find((y) => y.year === st.anno + 1), r, input.riduzione);
    const s = calcolaScadenzario(rules(), r, { primoAnno: st.primoAnno, ...(fissi !== undefined ? { fissiAnnoDopo: fissi } : {}) });
    err.hidden = true;
    ultimo = { r, s };
    disegnaSintesi(r, input.spese ?? 0);
    disegnaLedger(r, input.spese ?? 0);
    disegnaF24(r, s);
  } catch (e) {
    err.textContent = e instanceof Error ? e.message : String(e);
    err.hidden = false;
  }
}

function disegnaSintesi(r: Risultato, spese: number): void {
  $("netto-mese").textContent = eur(r.nettoMensile);
  $("netto-anno").textContent = eur(r.netto);
  $("accantona").textContent = eur(r.accantonamentoMensile);
  const parti = [
    { k: "netShort" as Key, v: Math.max(0, r.netto), c: "var(--accent)" },
    { k: "inpsShort" as Key, v: r.contributi.totale, c: "var(--inps)" },
    { k: "taxShort" as Key, v: r.imposta, c: "var(--tax)" },
    { k: "costsShort" as Key, v: spese, c: "var(--spese)" },
  ].filter((p) => p.v > 0);
  const tot = parti.reduce((s, p) => s + p.v, 0) || 1;
  const barra = $("barra");
  barra.replaceChildren(...parti.map((p) => {
    const s = el("span", { title: `${t(p.k)}: ${eur(p.v)}` });
    s.style.width = `${(p.v / tot) * 100}%`;
    s.style.background = p.c;
    return s;
  }));
  barra.setAttribute("aria-label", parti.map((p) => `${t(p.k)} ${fmt.pct(st.lang, p.v / tot)}`).join(", "));
  $("legenda").replaceChildren(...parti.map((p) => {
    const li = el("li");
    const i = el("i");
    i.style.background = p.c;
    li.append(i, document.createTextNode(`${t(p.k)} `), el("b", {}, `${eur(p.v)} · ${fmt.pct(st.lang, p.v / tot)}`));
    return li;
  }));
}

function disegnaLedger(r: Risultato, spese: number): void {
  const coeffs = r.righe.map((x) => `${x.ateco} → ${fmt.pct(st.lang, x.coefficiente)}`).join(" · ");
  const dedNote = r.contributiDedotti !== r.contributi.totale ? `${t("dedottiNote")} ${eur(r.contributiDedotti)}` : `${t("dedottiNote")}: ${t("contributiAuto")}`;
  const righe: [string, string, string, number, string?][] = [
    ["", t("ricavi"), "", r.ricavi],
    ["×", t("redditoLordo"), coeffs, r.redditoLordo],
    ["−", r.contributi.gestione === "cassa" ? t("contributiCassa") : t("contributi"), "", r.contributi.totale],
    ["=", t("imponibile"), dedNote, r.imponibile],
    ["−", `${t("imposta")} ${fmt.pct(st.lang, r.aliquota)}`, "", r.imposta],
  ];
  if (spese > 0) righe.push(["−", t("spese"), "", spese]);
  righe.push(["=", t("netto"), "", r.netto, "tot"]);
  $("ledger").replaceChildren(...righe.map(([op, label, note, v, cls]) => {
    const tr = el("tr", cls ? { class: cls } : {});
    const tdL = el("td", {}, label);
    if (note) tdL.append(el("span", { class: "note" }, note));
    tr.append(el("td", { class: "op" }, op), tdL, el("td", {}, eur(v)));
    return tr;
  }));
  const av = r.avvisi.filter((a) => a.codice !== "contributi-a-regime").map((a) => el("li", {}, avviso(st.lang, a)));
  av.push(el("li", { class: "info" }, t("atecoNote")));
  $("avvisi").replaceChildren(...av);
}

function disegnaF24(r: Risultato, s: Scadenzario): void {
  $("f24-anno").textContent = String(s.anno);
  const note = [st.primoAnno ? t("notaPrimo") : t("notaRegime")];
  if (r.contributi.gestione === "cassa") note.push(t("notaCassa"));
  const d = s.differimento;
  if (d.importo > 0) {
    note.push(t("differimento").replace("{data}", data(st.lang, d.data)).replace("{pct}", fmt.pct(st.lang, d.maggiorazione, 2)).replace("{importo}", eur(d.importo)));
  }
  const cr = [s.crediti.imposta > 0 ? `${t("creditoImposta")} ${eur(s.crediti.imposta)}` : "", s.crediti.contributi > 0 ? `${t("creditoInps")} ${eur(s.crediti.contributi)}` : ""].filter(Boolean);
  if (cr.length) note.push(t("credito").replace("{voci}", cr.join(" · ")));
  $("f24-nota").textContent = note.join(" ");
  const body = $("f24");
  let ultimaData = "";
  const rows = s.voci.map((v) => {
    const first = v.data !== ultimaData;
    ultimaData = v.data;
    const tr = el("tr", first ? { class: "first" } : {});
    const erario = /^\d+$/.test(v.codice);
    const tdV = el("td", {}, voce(st.lang, v, r.contributi.gestione));
    tr.append(
      el("td", { class: "data" }, first ? data(st.lang, v.data) : ""),
      el("td", { class: "sez" }, erario ? t("erario") : t("inps")),
      (() => { const td = el("td"); td.append(el("span", { class: "cod" }, v.codice)); return td; })(),
      tdV,
      el("td", { class: "num" }, eur(v.importo)),
    );
    return tr;
  });
  if (!rows.length) {
    const tr = el("tr");
    tr.append(el("td", { colspan: "5" }, t("noPayments")));
    rows.push(tr);
  }
  body.replaceChildren(...rows);
  $("f24-tot").textContent = eur(s.totale);
}

function testoElenco(): string {
  if (!ultimo) return "";
  const { r, s } = ultimo;
  const lines = s.voci.map((v) => `${data(st.lang, v.data)}\t${v.codice}\t${voce(st.lang, v, r.contributi.gestione)}\t${eur(v.importo)}`);
  return [`${t("f24Title")} ${s.anno}`, ...lines, `${t("total")}\t${eur(s.totale)}`].join("\n");
}

function toast(msg: string): void {
  const n = $("toast");
  n.textContent = msg;
  n.hidden = false;
}

/* ---------- eventi ---------- */
function collega(): void {
  $("dati").addEventListener("submit", (e) => e.preventDefault());
  $("add-att").addEventListener("click", () => {
    st.attivita.push({ ateco: "", ricavi: "" });
    modificato();
    disegnaAttivita();
    aggiorna();
    ($(`att-code-${st.attivita.length - 1}`) as HTMLInputElement).focus();
  });
  document.querySelectorAll<HTMLInputElement>('input[name="gestione"]').forEach((r) =>
    r.addEventListener("change", () => { st.gestione = r.value as Gestione; modificato(); aggiorna(); }),
  );
  const bind = (id: string, key: "cassaAliquota" | "cassaMinimo" | "dedotti" | "spese" | "dipendente") =>
    $<HTMLInputElement>(id).addEventListener("input", (e) => { st[key] = (e.target as HTMLInputElement).value; modificato(); aggiorna(); });
  bind("cassa-aliquota", "cassaAliquota");
  bind("cassa-minimo", "cassaMinimo");
  bind("dedotti", "dedotti");
  bind("spese", "spese");
  bind("dipendente", "dipendente");
  $<HTMLSelectElement>("riduzione").addEventListener("change", (e) => { st.riduzione = (e.target as HTMLSelectElement).value as Riduzione; modificato(); aggiorna(); });
  $<HTMLSelectElement>("anno").addEventListener("change", (e) => { st.anno = Number((e.target as HTMLSelectElement).value); salva(); disegnaAttivita(); aggiorna(); });
  $<HTMLInputElement>("startup").addEventListener("change", (e) => { st.startup = (e.target as HTMLInputElement).checked; modificato(); aggiorna(); });
  $<HTMLInputElement>("primo-anno").addEventListener("change", (e) => { st.primoAnno = (e.target as HTMLInputElement).checked; modificato(); aggiorna(); });
  $<HTMLInputElement>("ante1996").addEventListener("change", (e) => { st.ante1996 = (e.target as HTMLInputElement).checked; modificato(); aggiorna(); });
  $("reset").addEventListener("click", () => {
    const lang = st.lang;
    st = { ...structuredClone(ESEMPIO), lang };
    try { localStorage.removeItem(STORE); } catch { /* storage non disponibile */ }
    sincronizzaForm();
    aggiorna();
  });
  const setLang = (l: Lang) => { st.lang = l; salva(); applicaLingua(); sincronizzaForm(); aggiorna(); };
  $("lang-it").addEventListener("click", () => setLang("it"));
  $("lang-en").addEventListener("click", () => setLang("en"));

  $("ics").addEventListener("click", () => {
    if (!ultimo) return;
    const name = `scadenze-forfettario-${ultimo.s.anno}.ics`;
    const blob = new Blob([scadenzarioIcs(ultimo.s, ultimo.r.contributi.gestione, st.lang)], { type: "text/calendar;charset=utf-8" });
    const a = el("a", { href: URL.createObjectURL(blob), download: name }) as HTMLAnchorElement;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast(`${t("icsReady")}: ${name}`);
  });
  $("copia").addEventListener("click", () => {
    const text = testoElenco();
    navigator.clipboard?.writeText(text).then(() => toast(t("copied")), () => toast(t("copyFail"))) ?? toast(t("copyFail"));
  });
}

applicaLingua();
sincronizzaForm();
collega();
aggiorna();
