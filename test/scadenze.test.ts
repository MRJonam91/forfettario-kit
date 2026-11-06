// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { test } from "node:test";
import assert from "node:assert/strict";
import { calcola } from "../src/core/calc.ts";
import { calcolaScadenzario, festivi, giornoUtile } from "../src/core/scadenze.ts";
import { scadenzarioIcs } from "../src/adapters/ics.ts";
import { caricaAnno } from "../src/adapters/rules.ts";

const rules = caricaAnno(2026);

test("giorni utili: weekend e festivi slittano", () => {
  assert.equal(giornoUtile(2026, "05-16"), "2026-05-18"); // sabato -> lunedì
  assert.equal(giornoUtile(2027, "05-16"), "2027-05-17"); // domenica -> lunedì
  assert.equal(giornoUtile(2027, "06-30"), "2027-06-30"); // mercoledì
  assert.equal(giornoUtile(2026, "08-15"), "2026-08-17"); // Ferragosto di sabato
  assert.ok(festivi(2027).has("2027-03-29")); // Lunedì dell'Angelo 2027
  assert.ok(festivi(2026).has("2026-04-06")); // Lunedì dell'Angelo 2026
});

test("Gestione separata a regime: saldo 20% + acconti 40% + 40%", () => {
  const r = calcola(rules, { attivita: [{ ateco: "62.01", ricavi: 40000 }], gestione: "separata" });
  const s = calcolaScadenzario(rules, r);
  assert.equal(s.anno, 2027);
  const pxx = s.voci.filter((v) => v.codice === "PXX").map((v) => v.importo);
  assert.deepEqual(pxx, [1397.35, 2794.7, 2794.7]);
  assert.ok(!s.voci.some((v) => v.codice === "1792"), "a regime il saldo imposta è zero");
  assert.equal(s.totale, r.costoTotale - 0.01); // arrotondamento sulle rate
});

test("primo anno: saldo pieno e nessun acconto già versato", () => {
  const r = calcola(rules, { attivita: [{ ateco: "62.01", ricavi: 40000 }], gestione: "separata" });
  const s = calcolaScadenzario(rules, r, { primoAnno: true });
  const giugno = s.voci.filter((v) => v.data === "2027-06-30");
  assert.deepEqual(
    giugno.map((v) => [v.codice, v.importo]),
    [["1792", 2971.99], ["1790", 1188.8], ["PXX", 6986.76], ["PXX", 2794.7]],
  );
  assert.equal(s.perMese[5], 13942.25);
});

test("commercianti: quattro rate fisse con causale CF ed eccedenza CP al 50%", () => {
  const r = calcola(rules, { attivita: [{ ateco: "47.91", ricavi: 80000 }], gestione: "commercianti", riduzione: "forfettari" });
  const s = calcolaScadenzario(rules, r);
  const cf = s.voci.filter((v) => v.codice === "CF");
  assert.deepEqual(cf.map((v) => v.data), ["2027-02-16", "2027-05-17", "2027-08-20", "2027-11-16"]);
  assert.deepEqual(cf.map((v) => v.rata), [4, 1, 2, 3]);
  const cp = s.voci.filter((v) => v.codice === "CP" && v.voce !== "inps-saldo");
  assert.equal(cp.length, 2);
  assert.equal(cp[0]?.importo, cp[1]?.importo);
  assert.ok(Math.abs((cp[0]?.importo ?? 0) * 2 - r.contributi.eccedenza) < 0.02);
});

test("acconti versati espliciti", () => {
  const r = calcola(rules, { attivita: [{ ateco: "62.01", ricavi: 40000 }], gestione: "nessuna" });
  const s = calcolaScadenzario(rules, r, { accontiImpostaVersati: 1000 });
  assert.equal(s.voci.find((v) => v.codice === "1792")?.importo, r.imposta - 1000);
});

test("calendario .ics valido: un evento per giorno, promemoria, righe piegate", () => {
  const r = calcola(rules, { attivita: [{ ateco: "47.91", ricavi: 60000 }], gestione: "artigiani" });
  const s = calcolaScadenzario(rules, r);
  const ics = scadenzarioIcs(s, r.contributi.gestione, "it", new Date("2026-10-10T12:00:00Z"));
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  const giorni = new Set(s.voci.map((v) => v.data)).size;
  assert.equal(ics.match(/BEGIN:VEVENT/g)?.length, giorni);
  assert.equal(ics.match(/TRIGGER:-P3D/g)?.length, giorni);
  for (const line of ics.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75, line);
  assert.match(ics, /DTSTAMP:20261010T120000Z/);
});
