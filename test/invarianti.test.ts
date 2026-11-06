// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)
//
// Proprietà che devono valere per qualunque input (generatore pseudo-casuale con seme fisso).

import { test } from "node:test";
import assert from "node:assert/strict";
import { calcola } from "../src/core/calc.ts";
import { calcolaScadenzario } from "../src/core/scadenze.ts";
import type { Gestione, Input, Riduzione } from "../src/core/types.ts";
import { anniDisponibili, caricaAnno } from "../src/adapters/rules.ts";

function prng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = prng(20261013);
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)] as T;
const CODICI = ["62.01", "47.91", "69.20", "41.20", "46.11", "56.10", "47.89", "10.71", "86.90"];
const GESTIONI: Gestione[] = ["separata", "artigiani", "commercianti", "cassa", "nessuna"];
const RIDUZIONI: Riduzione[] = ["nessuna", "forfettari", "nuoviIscritti"];

function casuale(): Input {
  const n = 1 + Math.floor(rnd() * 3);
  const input: Input = {
    attivita: Array.from({ length: n }, () => ({ ateco: pick(CODICI), ricavi: Math.round(rnd() * 120000) })),
    gestione: pick(GESTIONI),
    riduzione: pick(RIDUZIONI),
    startup: rnd() < 0.3,
    ante1996: rnd() < 0.2,
  };
  if (input.gestione === "cassa") input.cassa = { aliquota: 0.1 + rnd() * 0.15, minimo: Math.round(rnd() * 3000) };
  if (rnd() < 0.3) input.spese = Math.round(rnd() * 10000);
  return input;
}

const N = 400;

test(`invarianti su ${N} casi casuali per ogni anno`, () => {
  for (const anno of anniDisponibili()) {
    const rules = caricaAnno(anno);
    for (let i = 0; i < N; i++) {
      const input = casuale();
      const r = calcola(rules, input);
      const ctx = JSON.stringify({ anno, input });
      // il conto torna al centesimo
      assert.ok(Math.abs(r.ricavi - (input.spese ?? 0) - r.contributi.totale - r.imposta - r.netto) < 0.011, ctx);
      // niente valori negativi dove non hanno senso
      for (const v of [r.redditoLordo, r.contributi.totale, r.imponibile, r.imposta, r.acconti.prima, r.acconti.seconda]) assert.ok(v >= 0, ctx);
      // l'imponibile non supera il reddito lordo, l'imposta non supera il 15%
      assert.ok(r.imponibile <= r.redditoLordo + 0.001, ctx);
      assert.ok(r.imposta <= r.imponibile * 0.15 + 0.01, ctx);
      // acconti = 100% dell'imposta quando dovuti
      if (r.acconti.dovuti) assert.ok(Math.abs(r.acconti.prima + r.acconti.seconda - r.imposta) < 0.011, ctx);
      // scadenzario: date ordinate, solo giorni feriali, nell'anno dopo
      const s = calcolaScadenzario(rules, r);
      const date = s.voci.map((v) => v.data);
      assert.deepEqual(date, [...date].sort(), ctx);
      for (const d of date) {
        const g = new Date(`${d}T00:00:00Z`).getUTCDay();
        assert.ok(g !== 0 && g !== 6, `${d} ${ctx}`);
        assert.ok(d.startsWith(String(anno + 1)), ctx);
      }
      assert.ok(Math.abs(s.perMese.reduce((a, b) => a + b, 0) - s.totale) < 0.05, ctx);
    }
  }
});

test("monotonia: più ricavi non riducono mai contributi e imposta", () => {
  const rules = caricaAnno();
  for (const gestione of ["separata", "artigiani", "commercianti"] as Gestione[]) {
    let prec = { c: -1, i: -1 };
    for (let ricavi = 0; ricavi <= 200000; ricavi += 2500) {
      const r = calcola(rules, { attivita: [{ ateco: "62.01", ricavi }], gestione, contributiDedotti: 0 });
      assert.ok(r.contributi.totale >= prec.c && r.imposta >= prec.i, `${gestione} ${ricavi}`);
      prec = { c: r.contributi.totale, i: r.imposta };
    }
  }
});
