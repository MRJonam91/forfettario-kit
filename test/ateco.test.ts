// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizzaAteco, trovaGruppo } from "../src/core/ateco.ts";
import { anniDisponibili, caricaAnno } from "../src/adapters/rules.ts";

const rules = caricaAnno(2026);
const coeff = (c: string) => trovaGruppo(rules, c).coefficiente;

test("normalizzazione dei codici", () => {
  assert.equal(normalizzaAteco("6201"), "62.01");
  assert.equal(normalizzaAteco("620100"), "62.01.00");
  assert.equal(normalizzaAteco(" 47,81 "), "47.81");
  assert.throws(() => normalizzaAteco("abc"), /non valido/);
});

test("coefficienti Allegato 4 L. 190/2014", () => {
  assert.equal(coeff("10.71.10"), 0.4);
  assert.equal(coeff("46.11.00"), 0.62);
  assert.equal(coeff("46.21"), 0.4);
  assert.equal(coeff("47.81.01"), 0.4);
  assert.equal(coeff("47.89"), 0.54);
  assert.equal(coeff("41.20.00"), 0.86);
  assert.equal(coeff("68.20"), 0.86);
  assert.equal(coeff("56.10.11"), 0.4);
  assert.equal(coeff("69.20.11"), 0.78);
  assert.equal(coeff("86.90.29"), 0.78);
  assert.equal(coeff("62.01.00"), 0.67);
  assert.equal(coeff("74.10.21"), 0.78);
  assert.equal(coeff("96.02.02"), 0.67);
});

test("codice inesistente: errore leggibile", () => {
  assert.throws(() => trovaGruppo(rules, "00.00"), /controlla le prime cifre/);
});

test("ogni divisione ATECO 2007 è coperta in ogni anno", () => {
  const divisioni = [
    1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
    35, 36, 37, 38, 39, 41, 42, 43, 45, 49, 50, 51, 52, 53, 55, 56, 58, 59, 60, 61, 62, 63, 64, 65, 66, 68, 69, 70, 71, 72,
    73, 74, 75, 77, 78, 79, 80, 81, 82, 84, 85, 86, 87, 88, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  ].map((d) => String(d).padStart(2, "0"));
  for (const anno of anniDisponibili()) {
    const r = caricaAnno(anno);
    for (const d of divisioni) assert.doesNotThrow(() => trovaGruppo(r, `${d}.00`), `anno ${anno}, divisione ${d}`);
    for (const g of ["46.1", "46.5", "47.1", "47.7", "47.9", "47.81", "47.82", "47.89"]) {
      assert.doesNotThrow(() => trovaGruppo(r, `${g}1`.slice(0, 5)), `anno ${anno}, gruppo ${g}`);
    }
  }
});
