// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)
// Rigenera docs/assets/demo.svg dall'output reale della CLI (da lanciare a ogni release).
// Regenerates docs/assets/demo.svg from the real CLI output (run on every release).
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const ARGS = ["40000", "--ateco", "62.01"];
const out = execFileSync(process.execPath, ["src/adapters/bin.ts", ...ARGS], {
  encoding: "utf8",
  env: { ...process.env, NO_COLOR: "1", NO_SPONSOR: "1" },
});
const lines = out.replace(/\n+$/, "").split("\n").slice(1);
const cmd = `$ npx forfettario-kit ${ARGS.join(" ")}`;

const W = 760, LH = 21, TOP = 64, PAD = 22;
const H = TOP + (lines.length + 1) * LH + 22;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cls = (l) =>
  /forfettario-kit ·/.test(l) ? "b" : /^\s+Netto annuo/.test(l) ? "g" : /⚠/.test(l) ? "y" : /─|Stima/.test(l) ? "d" : "";

// timeline (s): 0-1.1 typing, 1.3-3.4 lines, hold, loop at 6.5
const LOOP = 6.5;
const pct = (t) => ((t / LOOP) * 100).toFixed(2);
let css = "";
const rows = lines.map((l, i) => {
  const t = 1.3 + (i * 2.1) / lines.length;
  css += `@keyframes l${i}{0%,${pct(t)}%{opacity:0}${pct(t + 0.08)}%,96%{opacity:1}100%{opacity:0}}.l${i}{animation:l${i} ${LOOP}s infinite}\n`;
  const note = l.match(/^(.*?€)(\s{3}.+)$/);
  const body = note ? `${esc(note[1])}<tspan class="d">${esc(note[2])}</tspan>` : esc(l);
  return `<text x="${PAD}" y="${TOP + (i + 1) * LH + 8}" class="t ${cls(l)} l${i}">${body}</text>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title desc">
<title id="title">forfettario-kit demo</title>
<desc id="desc">${esc(cmd)} — tasse, contributi INPS, netto mensile e acconti del regime forfettario in un comando.</desc>
<metadata><rdf:RDF><rdf:Description dc:creator="Manoj Rollo (MRJonam91)" dc:identifier="fk.y3.b41e9c" dc:rights="AGPL-3.0-only" dc:title="forfettario-kit demo"/></rdf:RDF></metadata>
<style>
.t{font:14px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;fill:#e6edf3;white-space:pre}
.b{font-weight:700}.g{fill:#3fb950;font-weight:700}.y{fill:#d29922}.d{fill:#8b949e}.p{fill:#7ee787}
${css}@keyframes type{0%{width:0}${pct(1.1)}%,96%{width:${W}px}100%{width:0}}
#tc{animation:type ${LOOP}s steps(${cmd.length}) infinite}
@media (prefers-reduced-motion:reduce){[class*=" l"],#tc{animation:none!important;opacity:1}#tc{width:${W}px}}
</style>
<rect width="${W}" height="${H}" rx="10" fill="#0d1117"/>
<rect x="0" y="0" width="1" height="1" fill="#2b0f38"/>
<circle cx="22" cy="20" r="6" fill="#ff5f57"/><circle cx="42" cy="20" r="6" fill="#febc2e"/><circle cx="62" cy="20" r="6" fill="#28c840"/>
<clipPath id="c"><rect id="tc" x="0" y="${TOP - 18}" height="26" width="${W}"/></clipPath>
<text x="${PAD}" y="${TOP}" class="t p" clip-path="url(#c)" xml:space="preserve">${esc(cmd)}</text>
<g xml:space="preserve">
${rows.join("\n")}
</g>
</svg>
`;
writeFileSync("docs/assets/demo.svg", svg);
console.log(`docs/assets/demo.svg: ${lines.length} righe, ${svg.length} byte`);
