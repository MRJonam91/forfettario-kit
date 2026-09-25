// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { readFileSync } from "node:fs";
import type { YearParams } from "../core/model.ts";

/** Yearly parameters live in data/years/<year>.json: a new year = a new file + a test, via Pull Request. */
export function loadYear(year: number): YearParams {
  try {
    return JSON.parse(readFileSync(new URL(`../../data/years/${year}.json`, import.meta.url), "utf8")) as YearParams;
  } catch {
    throw new Error(`parametri per l'anno ${year} non disponibili (data/years/${year}.json)`);
  }
}
