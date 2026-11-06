// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import type { Gestione, Scadenza, Scadenzario } from "../core/types.ts";
import { fmt, voce, type Lang } from "./i18n.ts";

const enc = new TextEncoder();

const esc = (s: string): string => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** Righe oltre 75 ottetti spezzate come da RFC 5545 §3.1. */
function fold(line: string): string {
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    const limit = out.length === 0 ? 75 : 74;
    if (enc.encode(cur + ch).length > limit) {
      out.push(cur);
      cur = "";
    }
    cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

const ymd = (iso: string): string => iso.replace(/-/g, "");
function giornoDopo(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Calendario .ics: un evento per giorno di pagamento con le righe F24 del giorno
 * e un promemoria 3 giorni prima. Nessun dato lascia il dispositivo.
 */
export function scadenzarioIcs(s: Scadenzario, gestione: Gestione, lang: Lang = "it", now: Date = new Date()): string {
  const perGiorno = new Map<string, Scadenza[]>();
  for (const v of s.voci) perGiorno.set(v.data, [...(perGiorno.get(v.data) ?? []), v]);
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const it = lang === "it";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MRJonam91//forfettario-kit fk.y3.b41e9c//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(it ? `Scadenze forfettario ${s.anno}` : `Flat-rate tax deadlines ${s.anno}`)}`,
  ];
  for (const [giorno, righe] of perGiorno) {
    const totale = righe.reduce((t, v) => t + v.importo, 0);
    const titolo = `F24 · ${fmt.eur(lang, totale)}`;
    const dettaglio = righe.map((v) => `${v.codice} · ${voce(lang, v, gestione)} · ${fmt.eur(lang, v.importo)}`).join("\n");
    const nota = it ? "Stima calcolata con forfettario-kit: verifica gli importi prima di pagare." : "Estimate from forfettario-kit: check amounts before paying.";
    lines.push(
      "BEGIN:VEVENT",
      `UID:${giorno}-${righe.map((v) => v.codice).join("")}@forfettario-kit`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(giorno)}`,
      `DTEND;VALUE=DATE:${ymd(giornoDopo(giorno))}`,
      `SUMMARY:${esc(titolo)}`,
      `DESCRIPTION:${esc(`${dettaglio}\n\n${nota}`)}`,
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(titolo)}`,
      "TRIGGER:-P3D",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
