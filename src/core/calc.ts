// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { FkError, gruppoPerId, trovaGruppo } from "./ateco.ts";
import { calcolaContributi, r2 } from "./inps.ts";
import type { Acconti, Avviso, Input, RigaAttivita, Risultato, YearRules } from "./types.ts";

/** Oltre questa cifra l'input è quasi certamente un errore di battitura. */
const MAX_RICAVI = 9_999_431;

function verificaImporto(n: unknown, campo: string): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0 || v > MAX_RICAVI) {
    throw new FkError("importo", `importo non valido per ${campo}: ${String(n)}`, campo);
  }
  return v;
}

/** Acconti dell'imposta sostitutiva per l'anno successivo (metodo storico). */
export function calcolaAcconti(rules: YearRules, imposta: number): Acconti {
  const a = rules.acconti;
  if (imposta <= a.minimo) return { dovuti: false, prima: 0, seconda: 0 };
  if (imposta <= a.unicaRata) return { dovuti: true, prima: 0, seconda: r2(imposta) };
  const prima = r2(imposta * a.primaRata);
  return { dovuti: true, prima, seconda: r2(imposta - prima) };
}

/** Calcolo completo di un anno nel regime forfettario. Funzione pura, nessun I/O. */
export function calcola(rules: YearRules, input: Input): Risultato {
  if (!input.attivita?.length) throw new FkError("attivita", "serve almeno un'attività (codice ATECO + ricavi)");

  const righe: RigaAttivita[] = input.attivita.map((a, i) => {
    const ricavi = verificaImporto(a.ricavi, `ricavi[${i}]`);
    const g = a.ateco?.trim() ? trovaGruppo(rules, a.ateco) : a.gruppo ? gruppoPerId(rules, a.gruppo) : undefined;
    if (!g) throw new FkError("attivita", `attività ${i + 1}: serve un codice ATECO o un settore`);
    const ateco = a.ateco?.trim() || g.id;
    return { ateco, ricavi, gruppo: g.id, coefficiente: g.coefficiente, redditoLordo: r2(ricavi * g.coefficiente) };
  });

  const ricavi = r2(righe.reduce((s, r) => s + r.ricavi, 0));
  const redditoLordo = r2(righe.reduce((s, r) => s + r.redditoLordo, 0));
  const contributi = calcolaContributi(rules, redditoLordo, input.gestione, input.riduzione, input.cassa, input.ante1996);

  const avvisi: Avviso[] = [];
  let contributiDedotti = contributi.totale;
  if (input.contributiDedotti !== undefined) {
    contributiDedotti = verificaImporto(input.contributiDedotti, "contributiDedotti");
  } else if (contributi.totale > 0) {
    avvisi.push({ codice: "contributi-a-regime" });
  }

  const imponibile = r2(Math.max(0, redditoLordo - contributiDedotti));
  const aliquota = input.startup ? rules.imposta.startup : rules.imposta.ordinaria;
  const imposta = r2(imponibile * aliquota);
  const acconti = calcolaAcconti(rules, imposta);

  const spese = input.spese === undefined ? 0 : verificaImporto(input.spese, "spese");
  const costoTotale = r2(contributi.totale + imposta);
  const netto = r2(ricavi - spese - costoTotale);

  const s = rules.soglie;
  if (ricavi > s.ricaviUscitaImmediata) avvisi.push({ codice: "uscita-immediata", valore: s.ricaviUscitaImmediata });
  else if (ricavi > s.ricavi) avvisi.push({ codice: "soglia-85k", valore: s.ricavi });
  else if (ricavi >= s.ricavi * 0.8) avvisi.push({ codice: "margine-soglia", valore: r2(s.ricavi - ricavi) });
  if ((input.redditoDipendente ?? 0) > s.redditoDipendente) {
    avvisi.push({ codice: "dipendente-oltre-limite", valore: s.redditoDipendente });
  }
  if (input.startup) avvisi.push({ codice: "startup-requisiti", valore: rules.imposta.startupAnni });
  if ((input.gestione === "artigiani" || input.gestione === "commercianti") && redditoLordo < rules.inps[input.gestione].minimale) {
    avvisi.push({ codice: "minimale-ivs", valore: rules.inps[input.gestione].minimale });
  }

  return {
    anno: rules.year,
    ricavi,
    righe,
    redditoLordo,
    contributi,
    contributiDedotti: r2(contributiDedotti),
    imponibile,
    aliquota,
    imposta,
    acconti,
    costoTotale,
    netto,
    nettoMensile: r2(netto / 12),
    accantonamentoMensile: r2(costoTotale / 12),
    pressione: ricavi > 0 ? r2((costoTotale / ricavi) * 100) / 100 : 0,
    avvisi,
    engine: rules.schema,
  };
}
