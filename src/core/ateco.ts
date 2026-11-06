// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import type { AtecoGroup, YearRules } from "./types.ts";

export class FkError extends Error {
  readonly code: string;
  readonly detail: string;
  constructor(code: string, message: string, detail = "") {
    super(message);
    this.name = "FkError";
    this.code = code;
    this.detail = detail;
  }
}

/** "62.01.00" -> "62.01.00", "6201" -> "62.01", " 47,81 " -> "47.81" */
export function normalizzaAteco(raw: string): string {
  const s = String(raw).trim().replace(/,/g, ".").replace(/\s+/g, "");
  if (/^\d{2}(\.\d{1,2}){0,2}$/.test(s)) return s;
  if (/^\d{2,6}$/.test(s)) {
    const parts = [s.slice(0, 2), s.slice(2, 4), s.slice(4, 6)].filter(Boolean);
    return parts.join(".");
  }
  throw new FkError("ateco-formato", `codice ATECO non valido: "${raw}"`, String(raw));
}

/** "46.1" copre il gruppo 46.1x, "47.81" la classe 47.81.xx, "62" la divisione 62.xx. */
function matches(code: string, prefix: string): boolean {
  if (!code.startsWith(prefix)) return false;
  const rest = code.slice(prefix.length);
  if (rest === "" || rest[0] === ".") return true;
  const decimals = prefix.split(".")[1] ?? "";
  return decimals.length === 1 && /^\d/.test(rest);
}

/** Gruppo dell'Allegato 4 per id ("professioni", "commercio", ...). */
export function gruppoPerId(rules: YearRules, id: string): AtecoGroup {
  const g = rules.ateco.groups.find((x) => x.id === id);
  if (!g) throw new FkError("gruppo", `settore sconosciuto: ${id} (${rules.ateco.groups.map((x) => x.id).join(", ")})`, id);
  return g;
}

/** Gruppo dell'Allegato 4 con il prefisso più lungo che combacia con il codice. */
export function trovaGruppo(rules: YearRules, raw: string): AtecoGroup {
  const code = normalizzaAteco(raw);
  let best: AtecoGroup | undefined;
  let bestLen = -1;
  for (const g of rules.ateco.groups) {
    for (const p of g.prefixes) {
      if (p.length > bestLen && matches(code, p)) {
        best = g;
        bestLen = p.length;
      }
    }
  }
  if (!best) {
    throw new FkError(
      "ateco-non-mappato",
      `codice ATECO ${code} non mappato nella tabella dell'anno: controlla le prime cifre (rif. fk-2d)`,
      code,
    );
  }
  return best;
}
