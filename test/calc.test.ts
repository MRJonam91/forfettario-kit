// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { test } from "node:test";
import assert from "node:assert/strict";
import { calcola, calcolaAcconti } from "../src/core/calc.ts";
import { calcolaContributi } from "../src/core/inps.ts";
import { caricaAnno } from "../src/adapters/rules.ts";

const rules = caricaAnno(2026);

test("professionista in Gestione separata, 40.000 euro, ATECO 62.01", () => {
  const r = calcola(rules, { attivita: [{ ateco: "62.01", ricavi: 40000 }], gestione: "separata" });
  assert.equal(r.redditoLordo, 26800);
  assert.equal(r.contributi.totale, 6986.76);
  assert.equal(r.imponibile, 19813.24);
  assert.equal(r.imposta, 2971.99);
  assert.deepEqual(r.acconti, { dovuti: true, prima: 1188.8, seconda: 1783.19 });
  assert.equal(r.netto, 30041.25);
  assert.ok(r.avvisi.some((a) => a.codice === "contributi-a-regime"));
});

test("commerciante sotto il minimale, riduzione 35% e startup 5%", () => {
  const r = calcola(rules, {
    attivita: [{ ateco: "47.91", ricavi: 30000 }],
    gestione: "commercianti",
    riduzione: "forfettari",
    startup: true,
  });
  assert.equal(r.redditoLordo, 12000);
  assert.equal(r.contributi.totale, 3000.17);
  assert.equal(r.imposta, 449.99);
  assert.deepEqual(r.acconti, { dovuti: true, prima: 180, seconda: 269.99 });
  assert.ok(r.avvisi.some((a) => a.codice === "minimale-ivs"));
});

test("artigiano oltre il primo scaglione: fissi + due fasce di eccedenza", () => {
  const c = calcolaContributi(rules, 67000, "artigiani");
  assert.equal(c.fissi, 4521.36);
  assert.equal(c.eccedenza, 11673.84);
  assert.equal(c.totale, 16195.2);
});

test("contributi fissi 2026 coerenti con la circolare INPS 14/2026", () => {
  assert.equal(calcolaContributi(rules, 0, "artigiani").totale, 4521.36);
  assert.equal(calcolaContributi(rules, 0, "commercianti").totale, 4611.64);
});

test("Gestione separata: massimale", () => {
  assert.equal(calcolaContributi(rules, 500000, "separata").totale, 31882.31);
});

test("cassa professionale con minimo", () => {
  assert.equal(calcolaContributi(rules, 10000, "cassa", "nessuna", { aliquota: 0.14, minimo: 2000 }).totale, 2000);
  assert.equal(calcolaContributi(rules, 30000, "cassa", "nessuna", { aliquota: 0.14, minimo: 2000 }).totale, 4200);
  assert.throws(() => calcolaContributi(rules, 1, "cassa"), /aliquota/);
});

test("contributi dedotti espliciti e spese reali", () => {
  const r = calcola(rules, {
    attivita: [{ ateco: "62.01", ricavi: 40000 }],
    gestione: "separata",
    contributiDedotti: 5000,
    spese: 1000,
  });
  assert.equal(r.imponibile, 21800);
  assert.equal(r.imposta, 3270);
  assert.equal(r.netto, 28743.24);
  assert.ok(!r.avvisi.some((a) => a.codice === "contributi-a-regime"));
});

test("più attività con coefficienti diversi", () => {
  const r = calcola(rules, {
    attivita: [
      { ateco: "62.01", ricavi: 30000 },
      { ateco: "47.91", ricavi: 10000 },
    ],
    gestione: "nessuna",
  });
  assert.equal(r.redditoLordo, 30000 * 0.67 + 10000 * 0.4);
  assert.equal(r.imposta, 3615);
});

test("soglie: 85k, 100k e redditi da dipendente", () => {
  const codici = (ricavi: number, dip = 0) =>
    calcola(rules, { attivita: [{ ateco: "62.01", ricavi }], gestione: "nessuna", redditoDipendente: dip }).avvisi.map((a) => a.codice);
  assert.ok(codici(86000).includes("soglia-85k"));
  assert.ok(codici(100001).includes("uscita-immediata"));
  assert.ok(!codici(85000).includes("soglia-85k"));
  assert.ok(codici(10000, 36000).includes("dipendente-oltre-limite"));
});

test("acconti: soglie 51,65 e 257,52", () => {
  assert.deepEqual(calcolaAcconti(rules, 50), { dovuti: false, prima: 0, seconda: 0 });
  assert.deepEqual(calcolaAcconti(rules, 200), { dovuti: true, prima: 0, seconda: 200 });
  assert.deepEqual(calcolaAcconti(rules, 1000), { dovuti: true, prima: 400, seconda: 600 });
});

test("input non validi", () => {
  assert.throws(() => calcola(rules, { attivita: [], gestione: "separata" }), /almeno/);
  assert.throws(() => calcola(rules, { attivita: [{ ateco: "62.01", ricavi: -1 }], gestione: "separata" }), /non valido/);
});
