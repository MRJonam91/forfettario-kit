// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import type { Deadline, Fund } from "./model.ts";

export function deadlinesFor(all: Deadline[], fund: Fund): Deadline[] {
  return all.filter((d) => d.for.includes("all") || d.for.includes(fund));
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** All-day events with a reminder 3 days before. */
export function toIcs(deadlines: Deadline[], lang: "it" | "en", stamp = new Date()): string {
  const dt = stamp.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MRJonam91//forfettario-kit fk.t5//IT", "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${lang === "it" ? "Scadenze forfettario" : "Forfettario deadlines"}`];
  for (const d of deadlines) {
    const day = d.date.replace(/-/g, "");
    const next = new Date(`${d.date}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    out.push("BEGIN:VEVENT", `UID:${day}-${d.what_en.length}@forfettario-kit`, `DTSTAMP:${dt}`,
      `DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`,
      `SUMMARY:${esc(lang === "it" ? d.what_it : d.what_en)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P3D", `DESCRIPTION:${esc(d.what_it)}`, "END:VALARM", "END:VEVENT");
  }
  out.push("END:VCALENDAR");
  return out.join("\r\n") + "\r\n";
}
