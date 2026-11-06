// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { calcolaContributi, r2 } from "./inps.ts";
import type { OpzioniScadenzario, Riduzione, Risultato, Scadenza, Scadenzario, VoceScadenza, YearRules } from "./types.ts";

/** Pasqua (gregoriana, algoritmo di Meeus/Jones/Butcher). */
function pasqua(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31);
  return new Date(Date.UTC(y, mese - 1, ((h + l - 7 * m + 114) % 31) + 1));
}

const iso = (d: Date): string => d.toISOString().slice(0, 10);

/** Festività nazionali italiane (date fisse + Lunedì dell'Angelo). */
export function festivi(y: number): Set<string> {
  const fisse = ["01-01", "01-06", "04-25", "05-01", "06-02", "08-15", "11-01", "12-08", "12-25", "12-26"];
  const s = new Set(fisse.map((md) => `${y}-${md}`));
  const p = pasqua(y);
  p.setUTCDate(p.getUTCDate() + 1);
  s.add(iso(p));
  return s;
}

/** Sabato, domenica e festivi slittano al primo giorno lavorativo successivo. */
export function giornoUtile(y: number, mmgg: string): string {
  const [m, g] = mmgg.split("-").map(Number);
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, g ?? 1));
  for (;;) {
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6 && !festivi(d.getUTCFullYear()).has(iso(d))) return iso(d);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

/**
 * Versamenti F24 dell'anno successivo a quello calcolato: saldo dell'anno,
 * acconti dell'anno dopo (metodo storico) e rate fisse INPS.
 * Senza opzioni si assume un anno "a regime" (acconti già versati = dovuti).
 */
export function calcolaScadenzario(rules: YearRules, r: Risultato, opz: OpzioniScadenzario = {}): Scadenzario {
  const cal = rules.calendario;
  const cod = cal.codici;
  const Y = r.anno + 1;
  const voci: Scadenza[] = [];
  const add = (mmgg: string, anno: number, voce: VoceScadenza, codice: string, riferimento: number, importo: number, rata?: number) => {
    if (importo > 0) voci.push({ data: giornoUtile(anno, mmgg), voce, codice, riferimento, importo: r2(importo), ...(rata ? { rata } : {}) });
  };

  // Imposta sostitutiva
  const versatiImposta = opz.accontiImpostaVersati ?? (opz.primoAnno ? 0 : r.acconti.prima + r.acconti.seconda);
  const crediti = { imposta: r2(Math.max(0, versatiImposta - r.imposta)), contributi: 0 };
  add(cal.saldoPrimoAcconto, Y, "imposta-saldo", cod.impostaSaldo, r.anno, r.imposta - versatiImposta);
  add(cal.saldoPrimoAcconto, Y, "imposta-acconto-1", cod.impostaPrimoAcconto, Y, r.acconti.prima);
  add(cal.secondoAcconto, Y, "imposta-acconto-2", cod.impostaSecondoAcconto, Y, r.acconti.seconda);

  // Contributi INPS
  const g = r.contributi.gestione;
  if (g === "separata") {
    const dovuto = r.contributi.totale;
    const acconto = dovuto * cal.accontoSeparata;
    const versati = opz.accontiContributiVersati ?? (opz.primoAnno ? 0 : acconto);
    crediti.contributi = r2(Math.max(0, versati - dovuto));
    add(cal.saldoPrimoAcconto, Y, "inps-saldo", cod.separata, r.anno, dovuto - versati);
    add(cal.saldoPrimoAcconto, Y, "inps-acconto-1", cod.separata, Y, acconto / 2);
    add(cal.secondoAcconto, Y, "inps-acconto-2", cod.separata, Y, acconto / 2);
  } else if (g === "artigiani" || g === "commercianti") {
    const fissi = g === "artigiani" ? cod.artigianiFissi : cod.commerciantiFissi;
    const ecc = g === "artigiani" ? cod.artigianiEccedenza : cod.commerciantiEccedenza;
    const rata = r.contributi.fissi / 4;
    const rataDopo = (opz.fissiAnnoDopo ?? r.contributi.fissi) / 4;
    const [f1, f2, f3, f4] = cal.fissi;
    add(f1, Y, "inps-fissi", fissi, r.anno, rata, 4);
    add(f2, Y, "inps-fissi", fissi, Y, rataDopo, 1);
    add(f3, Y, "inps-fissi", fissi, Y, rataDopo, 2);
    add(f4, Y, "inps-fissi", fissi, Y, rataDopo, 3);
    const acconto = r.contributi.eccedenza * cal.accontoIvs;
    const versati = opz.accontiContributiVersati ?? (opz.primoAnno ? 0 : acconto);
    crediti.contributi = r2(Math.max(0, versati - r.contributi.eccedenza));
    add(cal.saldoPrimoAcconto, Y, "inps-saldo", ecc, r.anno, r.contributi.eccedenza - versati);
    add(cal.saldoPrimoAcconto, Y, "inps-acconto-1", ecc, Y, acconto / 2);
    add(cal.secondoAcconto, Y, "inps-acconto-2", ecc, Y, acconto / 2);
  }

  voci.sort((a, b) => a.data.localeCompare(b.data));
  const perMese = Array.from({ length: 12 }, () => 0);
  for (const v of voci) {
    const m = Number(v.data.slice(5, 7)) - 1;
    perMese[m] = r2((perMese[m] ?? 0) + v.importo);
  }
  const giugno = giornoUtile(Y, cal.saldoPrimoAcconto);
  const dovutoGiugno = voci.filter((v) => v.data === giugno).reduce((s, v) => s + v.importo, 0);
  const differimento = {
    data: giornoUtile(Y, cal.differimento.data),
    maggiorazione: cal.differimento.maggiorazione,
    importo: r2(dovutoGiugno * (1 + cal.differimento.maggiorazione)),
  };
  return { anno: Y, voci, totale: r2(voci.reduce((s, v) => s + v.importo, 0)), perMese, crediti, differimento };
}

/** Contributi fissi annui dell'anno dopo con gli stessi parametri dell'utente (se l'anno dopo è disponibile). */
export function fissiAnnoDopo(next: YearRules | undefined, r: Risultato, riduzione: Riduzione = "nessuna"): number | undefined {
  const g = r.contributi.gestione;
  if (!next || (g !== "artigiani" && g !== "commercianti")) return undefined;
  return calcolaContributi(next, 0, g, riduzione).fissi;
}
