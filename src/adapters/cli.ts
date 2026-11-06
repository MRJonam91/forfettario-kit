// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { calcola } from "../core/calc.ts";
import { calcolaScadenzario, fissiAnnoDopo } from "../core/scadenze.ts";
import { FkError, trovaGruppo } from "../core/ateco.ts";
import type { Attivita, Gestione, Input, OpzioniScadenzario, Riduzione, Risultato, Scadenzario } from "../core/types.ts";
import { avviso, data, fmt, settore, T, voce, type Lang } from "./i18n.ts";
import { scadenzarioIcs } from "./ics.ts";
import { parseAliquota, parseImporto } from "./importi.ts";

export { parseImporto };
import { anniDisponibili, caricaAnno } from "./rules.ts";
import { SPONSOR_LINE } from "./sponsor.ts";

export const VERSION = "0.2.0-beta.1";
const LABEL_WIDTH = 29;

const HELP = `forfettario-kit ${VERSION} — calcolatore regime forfettario / Italian flat-rate tax calculator

Uso / Usage:
  forfettario-kit <ricavi> --ateco <codice> [opzioni]
  forfettario-kit --ateco 62.01:30000 --ateco 47.91:12000      più attività / several activities
  forfettario-kit ateco <codice>                               coefficiente di un codice / code lookup
  forfettario-kit settori                                      settori e coefficienti / sectors and coefficients
  forfettario-kit 40000 -a 62.01 --scadenze --ics f24.ics      scadenzario F24 + calendario

Opzioni / Options:
  -a, --ateco <codice[:ricavi]>   codice ATECO (ripetibile)
      --settore <id[:ricavi]>     settore al posto del codice, es. professioni (ripetibile)
  -g, --gestione <tipo>           separata | artigiani | commercianti | cassa | nessuna  (default: separata)
      --riduzione <35|50>         riduzione INPS artigiani/commercianti (35% forfettari, 50% nuovi iscritti)
      --cassa-aliquota <n>        aliquota cassa professionale, es. 14 oppure 0.14
      --cassa-minimo <euro>       contributo minimo della cassa
      --startup                   aliquota 5% (primi 5 anni, con requisiti)
      --dedotti <euro>            contributi realmente versati nell'anno
      --spese <euro>              spese reali (solo per il netto in tasca)
      --dipendente <euro>         redditi da lavoro dipendente/pensione dell'anno prima
      --ante-1996                 anzianità contributiva al 31/12/1995 (massimale IVS ridotto)
      --anno <aaaa>               anno fiscale (default: il più recente)
  -s, --scadenze                  versamenti F24 dell'anno dopo (date, codici, importi)
      --ics <file.ics>            salva le scadenze nel calendario (Google, Apple, Outlook)
      --primo-anno                primo anno di attività: nessun acconto versato prima
      --json                      output JSON
      --lang <it|en>              lingua / language (default: it)
  -h, --help    -v, --version

Stima indicativa, non è consulenza fiscale. / Estimate only, not tax advice.
${SPONSOR_LINE}`;


const RIDUZIONI: Record<string, Riduzione> = { "35": "forfettari", "50": "nuoviIscritti", "0": "nessuna" };
const GESTIONI = ["separata", "artigiani", "commercianti", "cassa", "nessuna"];

export interface CliOpts {
  input?: Input;
  anno?: number;
  json: boolean;
  lang: Lang;
  info?: string;
  settori?: boolean;
  help?: boolean;
  version?: boolean;
  scadenze: boolean;
  ics?: string;
  opzScadenzario: OpzioniScadenzario;
}

export function buildInput(argv: string[]): CliOpts {
  const { values: v, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      ateco: { type: "string", short: "a", multiple: true },
      settore: { type: "string", multiple: true },
      "ante-1996": { type: "boolean", default: false },
      gestione: { type: "string", short: "g", default: "separata" },
      riduzione: { type: "string" },
      "cassa-aliquota": { type: "string" },
      "cassa-minimo": { type: "string" },
      startup: { type: "boolean", default: false },
      dedotti: { type: "string" },
      spese: { type: "string" },
      dipendente: { type: "string" },
      anno: { type: "string" },
      json: { type: "boolean", default: false },
      lang: { type: "string", default: "it" },
      scadenze: { type: "boolean", short: "s", default: false },
      ics: { type: "string" },
      "primo-anno": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
  });
  const lang: Lang = v.lang === "en" ? "en" : "it";
  const anno = v.anno ? Number(v.anno) : undefined;
  if (anno !== undefined && !Number.isInteger(anno)) throw new FkError("anno", `anno non valido: ${v.anno}`);
  const base = {
    anno,
    json: Boolean(v.json),
    lang,
    scadenze: Boolean(v.scadenze) || v.ics !== undefined,
    ...(v.ics !== undefined ? { ics: v.ics } : {}),
    opzScadenzario: { primoAnno: Boolean(v["primo-anno"]) },
  };
  if (v.help) return { ...base, help: true };
  if (v.version) return { ...base, version: true };
  if (positionals[0] === "ateco") return { ...base, info: positionals[1] ?? "" };
  if (positionals[0] === "settori") return { ...base, settori: true };

  const codici = v.ateco ?? [];
  const settori = v.settore ?? [];
  if (codici.length + settori.length === 0) {
    throw new FkError("uso", "manca --ateco <codice> (oppure --settore <id>). Esempio: forfettario-kit 40000 --ateco 62.01");
  }
  const ricaviPos = positionals[0] !== undefined ? parseImporto(positionals[0]) : undefined;
  const leggi = (c: string, flag: string): [string, number] => {
    const [id, importo] = c.split(":");
    const ricavi = importo !== undefined ? parseImporto(importo) : ricaviPos;
    if (ricavi === undefined) throw new FkError("uso", `mancano i ricavi per ${c} (usa <ricavi> oppure ${flag} ${c}:<ricavi>)`);
    return [id ?? "", ricavi];
  };
  const attivita: Attivita[] = [
    ...codici.map((c) => { const [ateco, ricavi] = leggi(c, "--ateco"); return { ateco, ricavi }; }),
    ...settori.map((c) => { const [gruppo, ricavi] = leggi(c, "--settore"); return { gruppo, ricavi }; }),
  ];

  const gestione = String(v.gestione);
  if (!GESTIONI.includes(gestione)) throw new FkError("gestione", `gestione non valida: ${gestione} (${GESTIONI.join(" | ")})`);
  const riduzione = v.riduzione === undefined ? "nessuna" : RIDUZIONI[v.riduzione];
  if (!riduzione) throw new FkError("riduzione", "riduzione valida: 35 oppure 50");

  const input: Input = { attivita, gestione: gestione as Gestione, riduzione, startup: Boolean(v.startup) };
  if (v["cassa-aliquota"]) {
    input.cassa = { aliquota: parseAliquota(v["cassa-aliquota"]) };
    if (v["cassa-minimo"]) input.cassa.minimo = parseImporto(v["cassa-minimo"]);
  }
  if (v.dedotti !== undefined) input.contributiDedotti = parseImporto(v.dedotti);
  if (v.spese !== undefined) input.spese = parseImporto(v.spese);
  if (v.dipendente !== undefined) input.redditoDipendente = parseImporto(v.dipendente);
  if (v["ante-1996"]) input.ante1996 = true;
  return { ...base, input };
}

const color = (code: string) => (s: string) =>
  process.stdout.isTTY && !process.env.NO_COLOR ? `\x1b[${code}m${s}\x1b[0m` : s;
const bold = color("1");
const dim = color("2");
const yellow = color("33");
const green = color("32");

export function formatta(r: Risultato, lang: Lang): string {
  const t = T[lang];
  const e = (n: number) => fmt.eur(lang, n).padStart(14);
  const row = (label: string, value: string, note = "", style = (x: string) => x) =>
    `  ${style(label.padEnd(LABEL_WIDTH))}${value}${note ? "   " + dim(note) : ""}`;
  const coeffs = r.righe.map((x) => `${x.ateco} → ${fmt.pct(lang, x.coefficiente)}`).join(", ");
  const out = [
    "",
    `  ${bold("forfettario-kit")} ${dim(`· ${t.anno} ${r.anno} · ${t.gestione[r.contributi.gestione]}`)}`,
    "",
    row(t.ricavi, e(r.ricavi)),
    row(t.redditoLordo, e(r.redditoLordo), `${t.coeff} ${coeffs}`),
    row(t.contributi, e(r.contributi.totale)),
  ];
  if (r.contributiDedotti !== r.contributi.totale) out.push(row(t.dedotti, e(r.contributiDedotti)));
  out.push(
    row(t.imponibile, e(r.imponibile)),
    row(`${t.imposta} ${fmt.pct(lang, r.aliquota)}`, e(r.imposta)),
    "  " + dim("─".repeat(LABEL_WIDTH + 14)),
    row(t.netto, bold(green(e(r.netto))), "", bold),
    row(t.nettoMese, e(r.nettoMensile)),
    row(t.accantona, e(r.accantonamentoMensile), t.accantonaNota),
    row(t.pressione, fmt.pct(lang, r.pressione, 1).padStart(14)),
    "",
  );
  const a = r.acconti;
  const accontiTxt = !a.dovuti
    ? t.nessunAcconto
    : a.prima > 0
      ? `${fmt.eur(lang, a.prima)} ${t.entro} 30/06 · ${fmt.eur(lang, a.seconda)} ${t.entro} 30/11`
      : `${fmt.eur(lang, a.seconda)} ${t.entro} 30/11`;
  out.push(`  ${t.acconti} ${r.anno + 1}: ${accontiTxt}`);
  for (const w of r.avvisi) out.push(`  ${yellow("⚠")} ${avviso(lang, w)}`);
  out.push("", `  ${dim(t.stima)}`);
  return out.join("\n");
}

export function formattaScadenze(s: Scadenzario, r: Risultato, lang: Lang): string {
  const it = lang === "it";
  const out = ["", `  ${bold(it ? `Scadenze F24 ${s.anno}` : `F24 payments ${s.anno}`)} ${dim(it ? "(stima)" : "(estimate)")}`, ""];
  for (const v of s.voci) {
    out.push(`  ${data(lang, v.data).padEnd(12)} ${v.codice.padEnd(5)} ${voce(lang, v, r.contributi.gestione).padEnd(46)}${fmt.eur(lang, v.importo).padStart(13)}`);
  }
  if (s.voci.length === 0) out.push(`  ${dim(it ? "nessun versamento" : "no payments")}`);
  out.push("  " + dim("─".repeat(78)), `  ${(it ? "Totale" : "Total").padEnd(65)}${bold(fmt.eur(lang, s.totale).padStart(13))}`);
  const d = s.differimento;
  if (d.importo > 0) {
    out.push(`  ${dim(it
      ? `Al ${data(lang, d.data)} con +${fmt.pct(lang, d.maggiorazione, 2)}: ${fmt.eur(lang, d.importo)} al posto dei versamenti di giugno.`
      : `By ${data(lang, d.data)} with +${fmt.pct(lang, d.maggiorazione, 2)}: ${fmt.eur(lang, d.importo)} instead of the June payments.`)}`);
  }
  if (s.crediti.imposta > 0 || s.crediti.contributi > 0) {
    const c = [s.crediti.imposta > 0 ? `${it ? "imposta" : "tax"} ${fmt.eur(lang, s.crediti.imposta)}` : "", s.crediti.contributi > 0 ? `INPS ${fmt.eur(lang, s.crediti.contributi)}` : ""].filter(Boolean).join(" · ");
    out.push(`  ${green(it ? `Credito da compensare nell'F24: ${c}` : `Credit to offset in the F24: ${c}`)}`);
  }
  if (r.contributi.gestione === "cassa") out.push(`  ${dim(it ? "Contributi della cassa professionale: segui il calendario della tua cassa." : "Professional fund contributions follow your fund's own calendar.")}`);
  return out.join("\n");
}

/** Ritorna l'exit code; scrive su stdout/stderr. */
export function main(argv: string[]): number {
  let lang: Lang = "it";
  try {
    const opts = buildInput(argv);
    lang = opts.lang;
    if (opts.help) return console.log(HELP), 0;
    if (opts.version) return console.log(VERSION), 0;
    const rules = caricaAnno(opts.anno);
    if (opts.info !== undefined) {
      const g = trovaGruppo(rules, opts.info);
      if (opts.json) console.log(JSON.stringify({ ateco: opts.info, ...g, anno: rules.year }, null, 2));
      else console.log(`\n  ${opts.info} → ${bold(fmt.pct(lang, g.coefficiente))}  ${dim(settore(lang, g))}  (${rules.year}, ATECO ${rules.ateco.version})\n`);
      return 0;
    }
    if (opts.settori) {
      if (opts.json) console.log(JSON.stringify(rules.ateco.groups.map(({ prefixes: _p, ...g }) => g), null, 2));
      else {
        console.log("");
        for (const g of rules.ateco.groups) console.log(`  ${g.id.padEnd(22)}${bold(fmt.pct(lang, g.coefficiente).padStart(5))}  ${dim(settore(lang, g))}`);
        console.log(`\n  ${dim(lang === "it" ? "uso: forfettario-kit 40000 --settore professioni" : "usage: forfettario-kit 40000 --settore professioni")}\n`);
      }
      return 0;
    }
    const r = calcola(rules, opts.input as Input);
    const next = anniDisponibili().includes(rules.year + 1) ? caricaAnno(rules.year + 1) : undefined;
    const fissi = fissiAnnoDopo(next, r, opts.input?.riduzione);
    const s = opts.scadenze
      ? calcolaScadenzario(rules, r, { ...opts.opzScadenzario, ...(fissi !== undefined ? { fissiAnnoDopo: fissi } : {}) })
      : undefined;
    if (opts.json) console.log(JSON.stringify(s ? { ...r, scadenzario: s } : r, null, 2));
    else console.log(formatta(r, lang) + (s ? "\n" + formattaScadenze(s, r, lang) : ""));
    if (s && opts.ics) {
      writeFileSync(opts.ics, scadenzarioIcs(s, r.contributi.gestione, lang));
      if (!opts.json) console.log(`\n  ${green("✓")} ${opts.ics} — ${lang === "it" ? "importa il file nel tuo calendario" : "import it into your calendar"}`);
    }
    return 0;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`forfettario-kit: ${T[lang].errore}: ${msg}`);
    if (err instanceof FkError && err.code === "anno") console.error(`  anni: ${anniDisponibili().join(", ")}`);
    if (!(err instanceof FkError) || err.code === "uso") console.error("  (forfettario-kit --help)");
    return 1;
  }
}
