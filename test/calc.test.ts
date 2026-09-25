// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { test } from "node:test";
import assert from "node:assert/strict";
import { loadYear } from "../src/adapters/years.ts";
import { advanceFor, calculate, contributions, revenueForNet } from "../src/core/calc.ts";
import { deadlinesFor, toIcs } from "../src/core/ics.ts";

const p = loadYear(2026);

test("professional in gestione separata, 40k revenue, standard rate", () => {
  const r = calculate({ revenue: 40_000, activity: "professionisti", fund: "gestioneSeparata" }, p);
  assert.equal(r.grossIncome, 31_200);
  assert.equal(r.contributions, 8133.84); // 31,200 × 26.07%
  assert.equal(r.taxableIncome, 23_066.16);
  assert.equal(r.tax, 3459.92);
  assert.equal(r.net, 28_406.24);
});

test("startup rate 5%", () => {
  const r = calculate({ revenue: 40_000, activity: "professionisti", fund: "gestioneSeparata", startup: true }, p);
  assert.equal(r.tax, 1153.31);
});

test("craftsman: fixed minimum below the minimale, bracket above it, 35% reduction", () => {
  assert.equal(contributions(10_000, "artigiani", p), 4521.36);
  assert.equal(contributions(28_808, "artigiani", p), 4521.36 + 2400);
  assert.equal(contributions(10_000, "artigiani", p, true), 2938.88);
});

test("upper bracket and cap", () => {
  const atHigh = contributions(56_224, "commercianti", p);
  assert.equal(contributions(66_224, "commercianti", p), Math.round((atHigh + 10_000 * 0.2548) * 100) / 100);
  assert.equal(contributions(500_000, "gestioneSeparata", p), contributions(122_295, "gestioneSeparata", p));
});

test("advance rules: none, single payment, 40/60", () => {
  assert.deepEqual(advanceFor(40, p), { total: 0, june: 0, november: 0 });
  assert.deepEqual(advanceFor(200, p), { total: 200, june: 0, november: 200 });
  assert.deepEqual(advanceFor(1000, p), { total: 1000, june: 400, november: 600 });
});

test("thresholds produce warnings, unverified params always warn", () => {
  const r = calculate({ revenue: 90_000, activity: "altre", fund: "gestioneSeparata" }, p);
  assert.ok(r.warnings.some((w) => w.includes("dall'anno successivo")));
  assert.ok(r.warnings.some((w) => w.includes("da verificare")));
});

test("35% reduction is refused for gestione separata", () => {
  assert.throws(() => calculate({ revenue: 1, activity: "altre", fund: "gestioneSeparata", reduction: true }, p), /artigiani e commercianti/);
});

test("target net → revenue round-trips", () => {
  const base = { activity: "professionisti", fund: "gestioneSeparata" as const };
  const rev = revenueForNet(30_000, base, p);
  const net = calculate({ ...base, revenue: rev }, p).net;
  assert.ok(net >= 30_000 && net < 30_002, String(net));
});

test("deadlines per fund and ics with reminders", () => {
  assert.equal(deadlinesFor(p.deadlines, "gestioneSeparata").length, 4);
  assert.equal(deadlinesFor(p.deadlines, "artigiani").length, 8);
  const ics = toIcs(deadlinesFor(p.deadlines, "artigiani"), "it", new Date("2026-09-26T00:00:00Z"));
  assert.equal(ics.match(/BEGIN:VEVENT/g)?.length, 8);
  assert.match(ics, /TRIGGER:-P3D/);
});
