// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

export { calcola, calcolaAcconti } from "./core/calc.ts";
export { calcolaContributi } from "./core/inps.ts";
export { FkError, gruppoPerId, normalizzaAteco, trovaGruppo } from "./core/ateco.ts";
export { anniDisponibili, caricaAnno } from "./adapters/rules.ts";
export type * from "./core/types.ts";
export { calcolaScadenzario, fissiAnnoDopo, giornoUtile, festivi } from "./core/scadenze.ts";
export { parseAliquota, parseImporto } from "./adapters/importi.ts";
export { scadenzarioIcs } from "./adapters/ics.ts";
