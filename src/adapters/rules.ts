// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { FkError } from "../core/ateco.ts";
import type { YearRules } from "../core/types.ts";

/** data/years/ sia da src/adapters (sviluppo) sia da dist/adapters (pacchetto npm). */
const DATA_DIR = fileURLToPath(new URL("../../data/years/", import.meta.url));

export function anniDisponibili(dir = DATA_DIR): number[] {
  return readdirSync(dir)
    .map((f) => /^(\d{4})\.json$/.exec(f)?.[1])
    .filter((y): y is string => Boolean(y))
    .map(Number)
    .sort((a, b) => a - b);
}

export function caricaAnno(anno?: number, dir = DATA_DIR): YearRules {
  const anni = anniDisponibili(dir);
  const y = anno ?? anni[anni.length - 1];
  if (y === undefined || !anni.includes(y)) {
    throw new FkError("anno", `anno ${String(anno)} non disponibile (disponibili: ${anni.join(", ")})`, String(anno));
  }
  const rules = JSON.parse(readFileSync(`${dir}${y}.json`, "utf8")) as YearRules;
  if (rules.year !== y || !Array.isArray(rules.ateco?.groups)) {
    throw new FkError("dati", `data/years/${y}.json non è valido`, String(y));
  }
  return rules;
}
