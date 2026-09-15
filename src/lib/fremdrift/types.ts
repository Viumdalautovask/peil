// Klienttilstand for fremdrift. Speiler prototypens `S`-objekt
// (localStorage). Dette er en midlertidig lagringsløsning inntil
// Supabase Auth + fremdrift-tabellen er koblet til (STEG 5) — samme
// datamodell, bare lagret i nettleseren i stedet for databasen, slik
// at appen er brukbar og testbar før kontoen finnes.

export type FremdriftEmne = {
  laer: boolean;
  ov: boolean[];
  test: number | null;
  nivaa?: "lav" | "ok" | "hoy";
};

export type EgetTema = { n: string; hva: string };

export type BokOppforing = { t: string; e: string; f: string; d: string };

export type Konto = {
  navn: string;
  epost: string;
  elev: string;
  trinn: number;
  sprak: string;
  plan: string;
  bet: string;
  status: "prove" | "aktiv" | "sagtopp";
  trekk: string;
  opprettet: string;
};

export type StjerneFro = {
  vri: number;
  spenn: number;
  uro: number;
  bred: number;
  hoy: number;
};

export type Tilstand = {
  trinn: number | null;
  fag: string | null;
  fremdrift: Record<string, FremdriftEmne>;
  bok: BokOppforing[];
  lost: number;
  egne: Record<string, EgetTema[]>;
  rekord: Record<string, number>;
  konto: Konto | null;
  fro: StjerneFro | null;
};

export const TOM_TILSTAND: Tilstand = {
  trinn: null,
  fag: null,
  fremdrift: {},
  bok: [],
  lost: 0,
  egne: {},
  rekord: {},
  konto: null,
  fro: null,
};

export function tilfeldigFro(): StjerneFro {
  return {
    vri: Math.random() * 360,
    spenn: Math.random() * 14,
    uro: 0.7 + Math.random() * 2.4,
    bred: 1.3 + Math.random() * 0.5,
    hoy: 0.78 + Math.random() * 0.3,
  };
}

export const LAGRINGSNOKKEL = "peil:tilstand:v1";

export function tomFremdrift(): FremdriftEmne {
  return { laer: false, ov: [], test: null };
}

export function erMestret(f: FremdriftEmne | undefined): boolean {
  return !!f && f.test !== null && f.test >= 4;
}
