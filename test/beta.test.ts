// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { test } from "node:test";
import assert from "node:assert/strict";
import { calcola } from "../src/core/calc.ts";
import { calcolaContributi } from "../src/core/inps.ts";
import { calcolaScadenzario, fissiAnnoDopo } from "../src/core/scadenze.ts";
import { gruppoPerId } from "../src/core/ateco.ts";
import { parseAliquota, parseImporto } from "../src/adapters/importi.ts";
import { caricaAnno } from "../src/adapters/rules.ts";

const r25 = caricaAnno(2025);
const r26 = caricaAnno(2026);

test("2025: contributi fissi della circolare INPS 38/2025", () => {
  assert.equal(calcolaContributi(r25, 0, "artigiani").totale, 4460.64);
  assert.equal(calcolaContributi(r25, 0, "commercianti").totale, 4549.7);
  assert.equal(calcolaContributi(r25, 1e6, "separata").totale, 31442.24); // 120.607 x 26,07% = 31.442,2449
});

test("2025: totali massimi IVS con e senza anzianità al 1995 (circolare 38/2025)", () => {
  assert.equal(calcolaContributi(r25, 1e6, "artigiani").totale, 29604.71);
  assert.equal(calcolaContributi(r25, 1e6, "artigiani", "nessuna", undefined, true).totale, 22556.21);
  assert.equal(calcolaContributi(r25, 1e6, "commercianti").totale, 30183.62);
  assert.equal(calcolaContributi(r25, 1e6, "commercianti", "nessuna", undefined, true).totale, 22999.79);
});

test("2026: massimale ridotto per anzianità al 1995", () => {
  const pieno = calcolaContributi(r26, 1e6, "artigiani").totale;
  const ridotto = calcolaContributi(r26, 1e6, "artigiani", "nessuna", undefined, true).totale;
  assert.ok(ridotto < pieno);
  assert.equal(ridotto, calcolaContributi(r26, 93707, "artigiani").totale);
});

test("settore al posto del codice ATECO", () => {
  const r = calcola(r26, { attivita: [{ gruppo: "professioni", ricavi: 40000 }], gestione: "nessuna" });
  assert.equal(r.redditoLordo, 31200);
  assert.equal(r.righe[0]?.ateco, "professioni");
  assert.throws(() => gruppoPerId(r26, "boh"), /settore sconosciuto/);
  assert.throws(() => calcola(r26, { attivita: [{ ricavi: 1 }], gestione: "nessuna" }), /codice ATECO o un settore/);
});

test("margine verso la soglia sopra l'80%", () => {
  const avv = (ricavi: number) => calcola(r26, { attivita: [{ ateco: "62.01", ricavi }], gestione: "nessuna" }).avvisi;
  assert.deepEqual(avv(70000).find((a) => a.codice === "margine-soglia"), { codice: "margine-soglia", valore: 15000 });
  assert.equal(avv(60000).find((a) => a.codice === "margine-soglia"), undefined);
});

test("crediti quando gli acconti versati superano il dovuto", () => {
  const r = calcola(r26, { attivita: [{ ateco: "62.01", ricavi: 20000 }], gestione: "separata" });
  const s = calcolaScadenzario(r26, r, { accontiImpostaVersati: r.imposta + 300, accontiContributiVersati: r.contributi.totale + 100 });
  assert.deepEqual(s.crediti, { imposta: 300, contributi: 100 });
  assert.ok(!s.voci.some((v) => v.voce === "imposta-saldo" || v.voce === "inps-saldo"));
});

test("differimento al 30/07 con maggiorazione 0,40% sulle voci di giugno", () => {
  const r = calcola(r26, { attivita: [{ ateco: "62.01", ricavi: 40000 }], gestione: "separata" });
  const s = calcolaScadenzario(r26, r);
  const giugno = s.voci.filter((v) => v.data === "2027-06-30").reduce((t, v) => t + v.importo, 0);
  assert.equal(s.differimento.data, "2027-07-30");
  assert.equal(s.differimento.importo, Math.round(giugno * 1.004 * 100) / 100);
});

test("rate fisse dell'anno dopo con i parametri nuovi", () => {
  const r = calcola(r25, { attivita: [{ ateco: "47.91", ricavi: 30000 }], gestione: "artigiani", riduzione: "forfettari" });
  const fissi = fissiAnnoDopo(r26, r, "forfettari");
  assert.equal(fissi, calcolaContributi(r26, 0, "artigiani", "forfettari").fissi);
  const s = calcolaScadenzario(r25, r, { fissiAnnoDopo: fissi });
  const af = s.voci.filter((v) => v.codice === "AF");
  assert.equal(af[0]?.importo, Math.round((r.contributi.fissi / 4) * 100) / 100); // 4a rata 2025
  assert.equal(af[1]?.importo, Math.round(((fissi ?? 0) / 4) * 100) / 100); // 1a rata 2026
  assert.equal(fissiAnnoDopo(undefined, r), undefined);
});

test("importi in formato italiano e inglese, aliquote", () => {
  assert.equal(parseImporto("40,000"), 40000);
  assert.equal(parseImporto("40,000.50"), 40000.5);
  assert.equal(parseImporto("1,5"), 1.5);
  assert.equal(parseImporto("€ 12.345,67"), 12345.67);
  assert.equal(parseAliquota("14"), 0.14);
  assert.equal(parseAliquota("14%"), 0.14);
  assert.equal(parseAliquota("0,14"), 0.14);
  assert.throws(() => parseAliquota("0"), /non valida/);
});
