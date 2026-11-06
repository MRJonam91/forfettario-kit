// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildInput, parseImporto } from "../src/adapters/cli.ts";

const BIN = fileURLToPath(new URL("../src/adapters/bin.ts", import.meta.url));
const run = (...args: string[]) => spawnSync(process.execPath, [BIN, ...args], { encoding: "utf8", env: { ...process.env, NO_SPONSOR: "1", NO_COLOR: "1" } });

test("parseImporto accetta formati italiani", () => {
  assert.equal(parseImporto("40k"), 40000);
  assert.equal(parseImporto("40.000"), 40000);
  assert.equal(parseImporto("40000,50"), 40000.5);
  assert.equal(parseImporto("1.250.000"), 1250000);
  assert.throws(() => parseImporto("quaranta"), /non valido/);
});

test("buildInput: più attività e opzioni", () => {
  const { input } = buildInput(["--ateco", "62.01:30000", "-a", "47.91:10k", "-g", "commercianti", "--riduzione", "35", "--startup"]);
  assert.deepEqual(input?.attivita, [
    { ateco: "62.01", ricavi: 30000 },
    { ateco: "47.91", ricavi: 10000 },
  ]);
  assert.equal(input?.riduzione, "forfettari");
  assert.equal(input?.startup, true);
});

test("CLI: output testuale e JSON", () => {
  const txt = run("40000", "--ateco", "62.01");
  assert.equal(txt.status, 0, txt.stderr);
  assert.match(txt.stdout, /Netto annuo/);
  const json = run("40000", "--ateco", "62.01", "--json");
  assert.equal(JSON.parse(json.stdout).netto, 30041.25);
  const en = run("40000", "--ateco", "62.01", "--lang", "en");
  assert.match(en.stdout, /Net per year/);
});

test("CLI: errori con exit code 1", () => {
  const r = run("40000");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--ateco/);
  assert.equal(run("40000", "--ateco", "62.01", "--anno", "1999").status, 1);
});

test("CLI: lookup di un codice", () => {
  const r = run("ateco", "69.20.11");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /78/);
});

test("CLI: scadenzario e file .ics", async () => {
  const { mkdtempSync, readFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const file = join(mkdtempSync(join(tmpdir(), "fk-")), "f24.ics");
  const r = run("40000", "--ateco", "62.01", "--scadenze", "--ics", file);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Scadenze F24 2027/);
  assert.match(r.stdout, /PXX/);
  assert.match(readFileSync(file, "utf8"), /BEGIN:VEVENT/);
  const j = JSON.parse(run("40000", "--ateco", "62.01", "--scadenze", "--primo-anno", "--json").stdout);
  assert.equal(j.scadenzario.anno, 2027);
  assert.ok(j.scadenzario.voci.some((v: { codice: string }) => v.codice === "1792"));
});

test("CLI: settori, --settore, --ante-1996, cassa in percentuale, inglese", () => {
  const settori = run("settori");
  assert.equal(settori.status, 0);
  assert.match(settori.stdout, /professioni\s+78%/);
  const j = JSON.parse(run("60000", "--settore", "professioni", "-g", "artigiani", "--ante-1996", "--json").stdout);
  assert.equal(j.righe[0].gruppo, "professioni");
  const cassa = JSON.parse(run("40000", "-a", "69.20", "-g", "cassa", "--cassa-aliquota", "14%", "--json").stdout);
  assert.equal(cassa.contributi.totale, 4368); // 31.200 x 14%
  const en = run("40,000", "-a", "62.01", "--scadenze", "--lang", "en");
  assert.match(en.stdout, /F24 payments 2027/);
  assert.match(en.stdout, /By 30 Jul 2027/);
  const bad = run("40000", "--settore", "boh");
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /settore sconosciuto/);
  assert.equal(run("40000", "-a", "62.01", "--anno", "abc").status, 1);
});
