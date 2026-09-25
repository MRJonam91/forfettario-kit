#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { parseArgs } from "node:util";
import { loadYear } from "./adapters/years.ts";
import { calculate, revenueForNet } from "./core/calc.ts";
import { deadlinesFor, toIcs } from "./core/ics.ts";
import type { Fund } from "./core/model.ts";
import { SPONSOR_HELP_LINE, sponsorFooter } from "./sponsor.ts";

const HELP = `forfettario — tasse, contributi, netto e scadenze per il regime forfettario

Uso / Usage:
  forfettario calcola --ricavi 40000 --attivita professionisti [--cassa gestioneSeparata|artigiani|commercianti]
                      [--startup] [--riduzione] [--anno 2026] [--json]
  forfettario obiettivo --netto 30000 --attivita professionisti      # quanto devo fatturare?
  forfettario scadenze --cassa artigiani [--ics] [--lingua it|en]
  forfettario attivita                                              # elenco coefficienti

Non sostituisce il commercialista. / Not a substitute for an accountant.

${SPONSOR_HELP_LINE}`;

const eur = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", useGrouping: "always" } as Intl.NumberFormatOptions);

async function main(): Promise<void> {
  const { values: v, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      ricavi: { type: "string" }, netto: { type: "string" }, attivita: { type: "string", default: "professionisti" },
      cassa: { type: "string", default: "gestioneSeparata" }, startup: { type: "boolean" }, riduzione: { type: "boolean" },
      anno: { type: "string", default: "2026" }, ics: { type: "boolean" }, lingua: { type: "string", default: "it" },
      json: { type: "boolean" }, help: { type: "boolean", short: "h" },
    },
  });
  const cmd = positionals[0];
  if (v.help || !cmd) return void console.log(HELP);
  const p = loadYear(Number(v.anno));
  const fund = v.cassa as Fund;
  const base = { activity: v.attivita!, fund, startup: v.startup, reduction: v.riduzione };

  if (cmd === "attivita") {
    for (const [k, c] of Object.entries(p.coefficients)) console.log(`${k.padEnd(24)} ${Math.round(c.value * 100)}%  ${c.label}`);
    return;
  }
  if (cmd === "scadenze") {
    const list = deadlinesFor(p.deadlines, fund);
    if (v.ics) return void process.stdout.write(toIcs(list, v.lingua === "en" ? "en" : "it"));
    for (const d of list) console.log(`📅 ${d.date}  ${v.lingua === "en" ? d.what_en : d.what_it}`);
    return;
  }
  if (cmd === "obiettivo") {
    const target = Number(v.netto);
    const revenue = revenueForNet(target, base, p);
    console.log(`🎯 Per incassare netti ${eur(target)} devi fatturare circa ${eur(revenue)} (${p.year}, ${v.attivita}, ${fund})`);
    sponsorFooter("forfettario-kit");
    return;
  }
  const r = calculate({ ...base, revenue: Number(v.ricavi) }, p);
  if (v.json) return void console.log(JSON.stringify(r, null, 2));
  console.log(`💼 Ricavi ${eur(Number(v.ricavi))} · coefficiente ${Math.round((p.coefficients[v.attivita!]?.value ?? 0) * 100)}% · ${fund}\n`);
  console.log(`   Reddito lordo           ${eur(r.grossIncome)}`);
  console.log(`   Contributi INPS         ${eur(r.contributions)}`);
  console.log(`   Imponibile              ${eur(r.taxableIncome)}`);
  console.log(`   Imposta sostitutiva ${String(Math.round(r.taxRate * 100)).padStart(2)}% ${eur(r.tax)}`);
  console.log(`   ✅ Netto                ${eur(r.net)}  (${Math.round(r.netShare * 100)}% dei ricavi)`);
  console.log(`\n   Acconti anno prossimo: giugno ${eur(r.advance.june)} · novembre ${eur(r.advance.november)}`);
  for (const w of r.warnings) console.log(`   ⚠️  ${w}`);
  sponsorFooter("forfettario-kit");
}

main().catch((err: unknown) => {
  console.error(`errore: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
