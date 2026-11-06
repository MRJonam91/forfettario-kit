// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)
//
// Esempio di estensione: usa la libreria per confrontare le gestioni INPS
// sullo stesso fatturato. Avvio: node examples/confronto-gestioni.ts 50000 62.01

import { calcola, caricaAnno, type Gestione } from "../src/index.ts";

const ricavi = Number(process.argv[2] ?? 50000);
const ateco = process.argv[3] ?? "62.01";
const rules = caricaAnno();

const gestioni: Gestione[] = ["separata", "artigiani", "commercianti"];
const righe = gestioni.map((gestione) => {
  const r = calcola(rules, { attivita: [{ ateco, ricavi }], gestione, riduzione: gestione === "separata" ? "nessuna" : "forfettari" });
  return { gestione, contributi: r.contributi.totale, imposta: r.imposta, netto: r.netto };
});

console.table(righe);
