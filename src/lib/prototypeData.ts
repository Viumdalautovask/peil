// src/lib/prototypeData.ts
//
// Parser LAEREPLAN/FAG/EMNE/EMNER direkte ut av
// prototype/peil-laering.html, uten å skrive innholdet på nytt for
// hånd. Brukes av scripts/seed.ts (til databasen) og — inntil et
// Supabase-prosjekt er koblet til — av src/lib/content.ts (til
// appen selv), slik at appen kan vises fram uten et ferdig oppsatt
// prosjekt.

import fs from "node:fs";
import path from "node:path";

export type LaerKort = { h: string; p: string; eks?: string; adv?: string };
export type OvingSteg = {
  q: string;
  enkel?: string;
  kort: string;
  fasit: string[];
  hint?: string;
  om?: string;
  naer?: string;
  lign?: string;
  laerRef?: number;
  feilsvar?: Record<string, string>;
};
export type Oving = { t: string; niva?: string; steg: OvingSteg[] };
export type TestSporsmal = { q: string; alt: string[]; r: number; f: string };
export type Emne = {
  n: string;
  m: string;
  regel: string;
  laer: LaerKort[];
  ov: Oving[];
  test: TestSporsmal[];
};
export type LaereplanRad = {
  kode: string;
  navn: string;
  fra: string;
  fastsatt: string;
  struktur: string;
  maal: number | string;
  klar: boolean;
};
export type FagRad = { id: string; n: string; s: string; f: string; klar: boolean };
export type EmnerRad = { id: string | null; n?: string; m?: string };

export type PrototypeData = {
  LAEREPLAN: Record<string, LaereplanRad>;
  FAG: FagRad[];
  EMNE: Record<string, Emne>;
  EMNER: Record<string, EmnerRad[]>;
};

let cache: PrototypeData | null = null;

export function hentPrototypeData(): PrototypeData {
  if (cache) return cache;

  const htmlPath = path.join(process.cwd(), "prototype/peil-laering.html");
  const html = fs.readFileSync(htmlPath, "utf8");

  const start = html.indexOf("const LAEREPLAN=");
  const end = html.indexOf("const $=id=>document.getElementById");
  if (start === -1 || end === -1) {
    throw new Error("Fant ikke datablokken (LAEREPLAN..EMNER) i " + htmlPath);
  }
  const dataKode = html.slice(start, end);
  // Ren datadeklarasjon uten DOM-kall — trygt å evaluere isolert.
  const fn = new Function(`${dataKode}\nreturn { LAEREPLAN, FAG, EMNE, EMNER };`);
  cache = fn() as PrototypeData;
  return cache;
}
