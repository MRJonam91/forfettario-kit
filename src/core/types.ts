// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

/** Regole di un anno fiscale, lette da data/years/<anno>.json. */
export interface YearRules {
  schema: string;
  year: number;
  sources: string[];
  soglie: { ricavi: number; ricaviUscitaImmediata: number; redditoDipendente: number };
  imposta: { ordinaria: number; startup: number; startupAnni: number };
  acconti: { minimo: number; unicaRata: number; primaRata: number; scadenzaPrima: string; scadenzaSeconda: string };
  ateco: { version: string; note?: string; groups: AtecoGroup[] };
  calendario: Calendario;
  inps: {
    separata: { aliquota: number; massimale: number };
    artigiani: InpsIvs;
    commercianti: InpsIvs;
    riduzioni: { forfettari: number; nuoviIscritti: number };
  };
}

/** Date "MM-GG" dei versamenti F24 e codici tributo/causali. */
export interface Calendario {
  saldoPrimoAcconto: string;
  secondoAcconto: string;
  fissi: [string, string, string, string];
  accontoSeparata: number;
  accontoIvs: number;
  /** Pagamento differito di 30 giorni con maggiorazione (es. 30/07 + 0,40%). */
  differimento: { data: string; maggiorazione: number };
  codici: Record<
    | "impostaPrimoAcconto" | "impostaSecondoAcconto" | "impostaSaldo" | "separata"
    | "artigianiFissi" | "artigianiEccedenza" | "commerciantiFissi" | "commerciantiEccedenza",
    string
  >;
}

export interface AtecoGroup {
  id: string;
  label: string;
  coefficiente: number;
  prefixes: string[];
}

export interface InpsIvs {
  minimale: number;
  scaglione: number;
  massimale: number;
  aliquota: number;
  aliquotaOltre: number;
  maternita: number;
  /** Massimale per chi ha anzianità contributiva al 31/12/1995. */
  massimaleAnte1996?: number;
}

export type Gestione = "separata" | "artigiani" | "commercianti" | "cassa" | "nessuna";
export type Riduzione = "nessuna" | "forfettari" | "nuoviIscritti";

/** Una attività: codice ATECO (oppure, in alternativa, l'id del settore) + ricavi incassati nell'anno. */
export interface Attivita {
  ateco?: string;
  /** Id del gruppo dell'Allegato 4 (es. "professioni"), se non si conosce il codice ATECO. */
  gruppo?: string;
  ricavi: number;
}

export interface Input {
  attivita: Attivita[];
  gestione: Gestione;
  /** Aliquota 5% dei primi 5 anni (se i requisiti sono rispettati). */
  startup?: boolean;
  riduzione?: Riduzione;
  /** Solo per gestione "cassa": aliquota soggettiva e contributo minimo. */
  cassa?: { aliquota: number; minimo?: number };
  /**
   * Contributi effettivamente versati nell'anno (deducibili per cassa).
   * Se assente si assume un anno "a regime": dedotti = contributi calcolati.
   */
  contributiDedotti?: number;
  /** Spese reali (non deducibili nel forfettario): servono solo per il netto in tasca. */
  spese?: number;
  /** Redditi da lavoro dipendente o pensione dell'anno precedente. */
  redditoDipendente?: number;
  /** Anzianità contributiva al 31/12/1995: si applica il massimale ridotto IVS. */
  ante1996?: boolean;
}

export interface Contributi {
  gestione: Gestione;
  fissi: number;
  eccedenza: number;
  totale: number;
}

export interface Acconti {
  dovuti: boolean;
  prima: number;
  seconda: number;
}

export type AvvisoCodice =
  | "soglia-85k"
  | "uscita-immediata"
  | "dipendente-oltre-limite"
  | "startup-requisiti"
  | "contributi-a-regime"
  | "minimale-ivs"
  | "margine-soglia";

export interface Avviso {
  codice: AvvisoCodice;
  valore?: number;
}

export interface RigaAttivita {
  ateco: string;
  ricavi: number;
  gruppo: string;
  coefficiente: number;
  redditoLordo: number;
}

export interface Risultato {
  anno: number;
  ricavi: number;
  righe: RigaAttivita[];
  redditoLordo: number;
  contributi: Contributi;
  contributiDedotti: number;
  imponibile: number;
  aliquota: number;
  imposta: number;
  acconti: Acconti;
  costoTotale: number;
  netto: number;
  nettoMensile: number;
  accantonamentoMensile: number;
  pressione: number;
  avvisi: Avviso[];
  engine: string;
}

export type VoceScadenza =
  | "imposta-saldo"
  | "imposta-acconto-1"
  | "imposta-acconto-2"
  | "inps-saldo"
  | "inps-acconto-1"
  | "inps-acconto-2"
  | "inps-fissi";

export interface Scadenza {
  /** Data effettiva di pagamento (ISO, già spostata al primo giorno lavorativo). */
  data: string;
  voce: VoceScadenza;
  /** Codice tributo o causale contributo da usare nell'F24. */
  codice: string;
  /** Anno di competenza da indicare nell'F24. */
  riferimento: number;
  importo: number;
  /** Per le rate fisse: numero della rata (1-4). */
  rata?: number;
}

export interface OpzioniScadenzario {
  /** Primo anno di attività: nessun acconto versato l'anno prima. */
  primoAnno?: boolean;
  /** Acconti d'imposta già versati per l'anno di calcolo (sovrascrive la stima). */
  accontiImpostaVersati?: number;
  /** Acconti contributivi già versati per l'anno di calcolo (sovrascrive la stima). */
  accontiContributiVersati?: number;
  /** Contributi fissi annui dell'anno di pagamento, se i parametri sono già noti (rate 1-3). */
  fissiAnnoDopo?: number;
}

export interface Scadenzario {
  /** Anno in cui si paga (anno di calcolo + 1). */
  anno: number;
  voci: Scadenza[];
  totale: number;
  /** Uscite per mese di calendario (1-12) del solo anno di pagamento. */
  perMese: number[];
  /** Acconti versati in eccesso: crediti da compensare nell'F24. */
  crediti: { imposta: number; contributi: number };
  /** Alternativa al 30/06: stessa somma entro questa data con la maggiorazione. */
  differimento: { data: string; maggiorazione: number; importo: number };
}
