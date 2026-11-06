#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { main } from "./cli.ts";
import { contaEsecuzione, sponsorFooter } from "./sponsor.ts";

const argv = process.argv.slice(2);
const code = main(argv);
if (code === 0 && !argv.includes("--json") && !argv.includes("-h") && !argv.includes("--help")) {
  sponsorFooter(contaEsecuzione());
}
process.exitCode = code;
