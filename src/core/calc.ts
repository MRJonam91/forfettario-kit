// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import type { Fund, Input, Result, YearParams } from "./model.ts";

const r2 = (n: number) => Math.round(n * 100) / 100;

export const OVER_THRESHOLD =
  "ricavi oltre la soglia di permanenza: il regime forfettario cessa (fk-9)";

export function contributions(grossIncome: number, fund: Fund, p: YearParams, reduction = false): number {
  if (fund === "gestioneSeparata") {
    return r2(Math.min(grossIncome, p.gestioneSeparata.cap) * p.gestioneSeparata.rate);
  }
  const f = p[fund];
  const base = Math.min(grossIncome, f.cap);
  const upToHigh = Math.max(0, Math.min(base, f.highFrom) - f.minimale);
  const aboveHigh = Math.max(0, base - f.highFrom);
  const due = f.fixed + upToHigh * f.rate + aboveHigh * f.rateHigh;
  return r2(reduction ? due * (1 - p.reductionForfettari) : due);
}

export function advanceFor(tax: number, p: YearParams): Result["advance"] {
  const a = p.advance;
  if (tax < a.noAdvanceBelow) return { total: 0, june: 0, november: 0 };
  if (tax < a.singlePaymentBelow) return { total: r2(tax), june: 0, november: r2(tax) };
  const june = r2(tax * a.firstShare);
  return { total: r2(tax), june, november: r2(tax - june) };
}

export function calculate(input: Input, p: YearParams): Result {
  const coeff = p.coefficients[input.activity];
  if (!coeff) throw new Error(`attività sconosciuta: ${input.activity} (vedi --attivita-elenco)`);
  if (input.reduction && input.fund === "gestioneSeparata") throw new Error("la riduzione del 35% vale solo per artigiani e commercianti");
  const warnings: string[] = [];
  if (!p.verified) warnings.push(`parametri ${p.year} da verificare con il tuo commercialista o con le fonti ufficiali`);
  if (input.revenue > p.thresholds.immediateExit) warnings.push(`${OVER_THRESHOLD}: oltre ${p.thresholds.immediateExit} € si esce subito`);
  else if (input.revenue > p.thresholds.stay) warnings.push(`${OVER_THRESHOLD}: oltre ${p.thresholds.stay} € si esce dall'anno successivo`);

  const grossIncome = r2(input.revenue * coeff.value);
  const due = contributions(grossIncome, input.fund, p, input.reduction);
  const deductible = input.contributionsPaid ?? due;
  const taxableIncome = r2(Math.max(0, grossIncome - deductible));
  const taxRate = input.startup ? p.tax.startup : p.tax.standard;
  const tax = r2(taxableIncome * taxRate);
  const net = r2(input.revenue - due - tax);
  return {
    grossIncome, contributions: due, taxableIncome, taxRate, tax, net,
    netShare: input.revenue ? Math.round((net / input.revenue) * 1000) / 1000 : 0,
    advance: advanceFor(tax, p),
    warnings,
  };
}

/** Revenue needed to take home `targetNet` (bisection, monotonic in revenue below the thresholds). */
export function revenueForNet(targetNet: number, base: Omit<Input, "revenue">, p: YearParams): number {
  let lo = 0, hi = p.thresholds.immediateExit * 2;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (calculate({ ...base, revenue: mid }, p).net < targetNet) lo = mid;
    else hi = mid;
  }
  return Math.ceil(hi);
}
