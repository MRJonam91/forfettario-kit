// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { FkError } from "../core/ateco.ts";

/** "40k", "40.000", "40000,50", "40_000" -> numero */
export function parseImporto(raw: string): number {
  let s = raw.trim().toLowerCase().replace(/[_\s€]/g, "");
  let mult = 1;
  if (s.endsWith("k")) {
    mult = 1000;
    s = s.slice(0, -1);
  }
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, "").replace(",", "."); // 40.000,50
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, ""); // 40,000.50
  else s = s.replace(",", ".");
  const n = Number(s) * mult;
  if (!/^\d+(\.\d+)?$/.test(s) || !Number.isFinite(n)) throw new FkError("importo", `importo non valido: "${raw}"`, raw);
  return n;
}

/** Aliquota come frazione: "14", "14%", "0,14" e "0.14" diventano 0.14. */
export function parseAliquota(raw: string): number {
  const n = parseImporto(raw.replace("%", ""));
  const v = n >= 1 ? n / 100 : n;
  if (!(v > 0 && v < 1)) throw new FkError("aliquota", `aliquota non valida: "${raw}"`, raw);
  return v;
}
