// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

export type Fund = "gestioneSeparata" | "artigiani" | "commercianti";

export interface IncomeFund {
  minimale: number;
  fixed: number;
  rate: number;
  rateHigh: number;
  highFrom: number;
  cap: number;
}

export interface Deadline {
  date: string;
  what_it: string;
  what_en: string;
  for: ("all" | Fund)[];
}

export interface YearParams {
  schema: string;
  year: number;
  verified: boolean;
  sources: string[];
  tax: { standard: number; startup: number };
  thresholds: { stay: number; immediateExit: number };
  coefficients: Record<string, { label: string; value: number }>;
  gestioneSeparata: { rate: number; cap: number };
  artigiani: IncomeFund;
  commercianti: IncomeFund;
  reductionForfettari: number;
  advance: { firstShare: number; noAdvanceBelow: number; singlePaymentBelow: number };
  deadlines: Deadline[];
}

export interface Input {
  /** gross receipts of the year (cash basis) */
  revenue: number;
  /** key of `coefficients` */
  activity: string;
  fund: Fund;
  /** 5% rate for the first five years when requirements are met */
  startup?: boolean;
  /** 35% INPS reduction (craftsmen/traders only, on request) */
  reduction?: boolean;
  /** contributions actually paid in the year; default: estimate = this year's due contributions */
  contributionsPaid?: number;
}

export interface Result {
  grossIncome: number;
  contributions: number;
  taxableIncome: number;
  taxRate: number;
  tax: number;
  net: number;
  /** share of revenue kept */
  netShare: number;
  /** next-year advance with the historical method */
  advance: { total: number; june: number; november: number };
  warnings: string[];
}
