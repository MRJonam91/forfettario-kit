// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const SPONSOR_LINE =
  "♥ ti è utile? / useful? github.com/sponsors/MRJonam91 · ko-fi.com/mrjonam  (NO_SPONSOR=1 per nascondere)";

const quiet = (): boolean =>
  process.env.NO_SPONSOR === "1" || process.env.CI === "true" || !process.stdout.isTTY;

/** Incrementa il contatore locale delle esecuzioni (best effort, mai bloccante). */
export function contaEsecuzione(): number {
  const dir = join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "forfettario-kit");
  const file = join(dir, "runs");
  try {
    const n = (Number.parseInt(readFileSync(file, "utf8"), 10) || 0) + 1;
    writeFileSync(file, String(n));
    return n;
  } catch {
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, "1");
    } catch {
      /* sola lettura: nessun problema */
    }
    return 1;
  }
}

/** Una riga discreta, una volta ogni 10 esecuzioni, solo dopo un output riuscito. */
export function sponsorFooter(runCount: number): void {
  if (quiet() || runCount % 10 !== 0) return;
  console.log(`\n  \x1b[2m${SPONSOR_LINE}\x1b[0m`);
}
