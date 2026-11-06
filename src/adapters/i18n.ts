// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import type { Avviso, Gestione, Scadenza } from "../core/types.ts";

export type Lang = "it" | "en";

const eur = (lang: Lang, n: number): string =>
  new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-IE", { style: "currency", currency: "EUR", useGrouping: "always" }).format(n);

export const fmt = {
  eur,
  pct: (lang: Lang, n: number, digits = 0): string =>
    new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-IE", { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n),
};

export const T = {
  it: {
    anno: "anno",
    gestione: { separata: "Gestione separata", artigiani: "artigiani", commercianti: "commercianti", cassa: "cassa professionale", nessuna: "nessuna gestione" },
    ricavi: "Ricavi incassati",
    redditoLordo: "Reddito lordo",
    coeff: "coeff.",
    contributi: "Contributi previdenziali",
    dedotti: "Contributi dedotti",
    imponibile: "Imponibile",
    imposta: "Imposta sostitutiva",
    netto: "Netto annuo",
    nettoMese: "Netto al mese",
    accantona: "Accantona ogni mese",
    accantonaNota: "tasse + contributi",
    pressione: "Pressione effettiva",
    acconti: "Acconti imposta",
    entro: "entro",
    nessunAcconto: "nessun acconto dovuto",
    stima: "Stima indicativa, non è consulenza fiscale.",
    errore: "errore",
  },
  en: {
    anno: "year",
    gestione: { separata: "INPS Gestione separata", artigiani: "INPS craftsmen", commercianti: "INPS traders", cassa: "professional fund", nessuna: "no pension fund" },
    ricavi: "Revenue collected",
    redditoLordo: "Taxable income (gross)",
    coeff: "coeff.",
    contributi: "Social security",
    dedotti: "Contributions deducted",
    imponibile: "Tax base",
    imposta: "Flat tax",
    netto: "Net per year",
    nettoMese: "Net per month",
    accantona: "Set aside monthly",
    accantonaNota: "tax + contributions",
    pressione: "Effective tax rate",
    acconti: "Tax advances",
    entro: "by",
    nessunAcconto: "no advance due",
    stima: "Estimate only, not tax advice.",
    errore: "error",
  },
} as const;

export function avviso(lang: Lang, a: Avviso): string {
  const v = a.valore ?? 0;
  const e = eur(lang, v);
  const it: Record<Avviso["codice"], string> = {
    "soglia-85k": `ricavi oltre ${e}: dal prossimo anno esci dal forfettario`,
    "uscita-immediata": `ricavi oltre ${e}: esci dal regime già quest'anno, IVA dalla fattura che supera la soglia`,
    "dipendente-oltre-limite": `redditi da lavoro dipendente/pensione oltre ${e}: causa ostativa per l'anno successivo`,
    "startup-requisiti": `aliquota 5% solo per i primi ${v} anni e con i requisiti di nuova attività`,
    "contributi-a-regime": "dedotti i contributi dell'anno (stima a regime): --dedotti per il valore reale",
    "minimale-ivs": `sotto il minimale di ${e} paghi comunque i contributi fissi`,
    "margine-soglia": `puoi incassare ancora ${e} prima della soglia di 85.000 €`,
  };
  const en: Record<Avviso["codice"], string> = {
    "soglia-85k": `revenue above ${e}: you leave the flat-rate regime next year`,
    "uscita-immediata": `revenue above ${e}: you leave the regime this year, VAT applies from the invoice that crosses it`,
    "dipendente-oltre-limite": `employment/pension income above ${e}: not eligible next year`,
    "startup-requisiti": `5% rate only for the first ${v} years and if start-up requirements are met`,
    "contributi-a-regime": "deducting this year's contributions (steady state): --dedotti for actual amount",
    "minimale-ivs": `below the ${e} minimum you still pay the fixed contributions`,
    "margine-soglia": `you can still collect ${e} before the 85,000 € threshold`,
  };
  return (lang === "it" ? it : en)[a.codice];
}

/** Descrizione di una riga dello scadenzario F24. */
export function voce(lang: Lang, v: Scadenza, gestione: Gestione): string {
  const ivs = gestione === "artigiani" || gestione === "commercianti";
  const r = v.riferimento;
  if (lang === "en") {
    switch (v.voce) {
      case "imposta-saldo": return `Flat tax balance ${r}`;
      case "imposta-acconto-1": return `Flat tax 1st advance ${r}`;
      case "imposta-acconto-2": return `Flat tax 2nd advance ${r}`;
      case "inps-saldo": return ivs ? `INPS balance above minimum ${r}` : `INPS balance ${r}`;
      case "inps-acconto-1": return ivs ? `INPS 1st advance above minimum ${r}` : `INPS 1st advance ${r}`;
      case "inps-acconto-2": return ivs ? `INPS 2nd advance above minimum ${r}` : `INPS 2nd advance ${r}`;
      case "inps-fissi": return `INPS fixed contributions ${r}, instalment ${v.rata}/4`;
    }
  }
  switch (v.voce) {
    case "imposta-saldo": return `Saldo imposta sostitutiva ${r}`;
    case "imposta-acconto-1": return `1° acconto imposta sostitutiva ${r}`;
    case "imposta-acconto-2": return `2° acconto imposta sostitutiva ${r}`;
    case "inps-saldo": return ivs ? `Saldo INPS sull'eccedenza del minimale ${r}` : `Saldo contributi INPS ${r}`;
    case "inps-acconto-1": return ivs ? `1° acconto INPS sull'eccedenza ${r}` : `1° acconto contributi INPS ${r}`;
    case "inps-acconto-2": return ivs ? `2° acconto INPS sull'eccedenza ${r}` : `2° acconto contributi INPS ${r}`;
    case "inps-fissi": return `Contributi fissi INPS ${r}, rata ${v.rata}/4`;
  }
}

/** "2027-06-30" -> "30/06/2027" (it) o "30 Jun 2027" (en). */
export function data(lang: Lang, isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-GB", { day: "2-digit", month: lang === "it" ? "2-digit" : "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)));
}

/** Nomi dei settori dell'Allegato 4 in inglese (in italiano si usa la label del JSON). */
export const SETTORI_EN: Record<string, string> = {
  alimentari: "Food and beverage manufacturing",
  commercio: "Wholesale and retail trade",
  "ambulante-alimentari": "Street trade of food and beverages",
  "ambulante-altro": "Street trade of other goods",
  costruzioni: "Construction and real estate",
  intermediari: "Trade intermediaries",
  alloggio: "Accommodation and food services",
  professioni: "Professional, scientific, technical, health, education, financial and insurance services",
  altre: "Other economic activities",
};

export const settore = (lang: Lang, g: { id: string; label: string }): string => (lang === "en" ? SETTORI_EN[g.id] ?? g.label : g.label);
