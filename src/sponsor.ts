// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** One discreet line after useful output, 1 run in 10, never in CI/pipes. NO_SPONSOR=1 hides it. */
export function sponsorFooter(app: string, lang: "it" | "en" = "it"): void {
  if (process.env.NO_SPONSOR === "1" || process.env.CI || !process.stdout.isTTY) return;
  const dir = join(homedir(), ".config", app);
  const file = join(dir, "runs");
  let runs = 0;
  try {
    runs = Number.parseInt(readFileSync(file, "utf8"), 10) || 0;
  } catch {
    /* first run */
  }
  runs += 1;
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, String(runs));
  } catch {
    /* read-only home: ignore */
  }
  if (runs % 10 !== 0) return;
  const msg =
    lang === "it"
      ? "♥ ti è utile? github.com/sponsors/MRJonam91 · ko-fi.com/mrjonam  (NO_SPONSOR=1 per nascondere)"
      : "♥ useful? github.com/sponsors/MRJonam91 · ko-fi.com/mrjonam  (NO_SPONSOR=1 to hide)";
  console.log(`\n  ${msg}`);
}

export const SPONSOR_HELP_LINE =
  "♥ Sostieni / Support: github.com/sponsors/MRJonam91 · ko-fi.com/mrjonam · buymeacoffee.com/mrjonam · paypal.me/manorollo";
