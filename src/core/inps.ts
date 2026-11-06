// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { FkError } from "./ateco.ts";
import type { Contributi, Gestione, Riduzione, YearRules } from "./types.ts";

export const r2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Contributi previdenziali dell'anno sul reddito forfettario lordo
 * (ricavi x coefficiente, rigo LM34): è la base sia per la Gestione separata
 * sia per artigiani e commercianti.
 */
export function calcolaContributi(
  rules: YearRules,
  redditoLordo: number,
  gestione: Gestione,
  riduzione: Riduzione = "nessuna",
  cassa?: { aliquota: number; minimo?: number },
  ante1996 = false,
): Contributi {
  const reddito = Math.max(0, redditoLordo);

  switch (gestione) {
    case "separata": {
      const g = rules.inps.separata;
      const totale = r2(Math.min(reddito, g.massimale) * g.aliquota);
      return { gestione, fissi: 0, eccedenza: totale, totale };
    }
    case "artigiani":
    case "commercianti": {
      const g = rules.inps[gestione];
      const massimale = ante1996 && g.massimaleAnte1996 ? g.massimaleAnte1996 : g.massimale;
      const base = Math.min(Math.max(reddito, g.minimale), massimale);
      const fattore = riduzione === "nessuna" ? 1 : 1 - rules.inps.riduzioni[riduzione];
      const fissiIvs = g.minimale * g.aliquota;
      const primaFascia = Math.max(0, Math.min(base, g.scaglione) - g.minimale) * g.aliquota;
      const oltre = Math.max(0, base - g.scaglione) * g.aliquotaOltre;
      const fissi = r2(fissiIvs * fattore + g.maternita);
      const eccedenza = r2((primaFascia + oltre) * fattore);
      return { gestione, fissi, eccedenza, totale: r2(fissi + eccedenza) };
    }
    case "cassa": {
      if (!cassa || !(cassa.aliquota > 0 && cassa.aliquota < 1)) {
        throw new FkError("cassa-aliquota", "per la gestione 'cassa' serve un'aliquota tra 0 e 1 (es. 0.14)");
      }
      const minimo = cassa.minimo ?? 0;
      const totale = r2(Math.max(minimo, reddito * cassa.aliquota));
      return { gestione, fissi: r2(minimo), eccedenza: r2(totale - minimo), totale };
    }
    case "nessuna":
      return { gestione, fissi: 0, eccedenza: 0, totale: 0 };
    default:
      throw new FkError("gestione", `gestione previdenziale sconosciuta: ${String(gestione)}`);
  }
}
