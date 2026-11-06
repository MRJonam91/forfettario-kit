// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)
// Conta le righe non vuote del core: deve restare sotto 1500.
import { readdirSync, readFileSync } from "node:fs";
const dir = new URL("../src/core/", import.meta.url);
const lines = readdirSync(dir)
  .filter((f) => f.endsWith(".ts"))
  .reduce((n, f) => n + readFileSync(new URL(f, dir), "utf8").split("\n").filter((l) => l.trim()).length, 0);
console.log(`core: ${lines} righe non vuote / non-empty lines (limite 1500)`);
if (lines > 1500) process.exit(1);
