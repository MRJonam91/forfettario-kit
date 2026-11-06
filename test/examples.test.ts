// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("l'esempio di estensione resta verde", () => {
  const file = fileURLToPath(new URL("../examples/confronto-gestioni.ts", import.meta.url));
  const r = spawnSync(process.execPath, [file, "50000", "62.01"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /commercianti/);
});
