// src/lib/content.ts
//
// Innholdstilgang for appen (Server Components). Leser i dag direkte
// fra prototypen via prototypeData.ts. Når Supabase-prosjektet er
// koblet til, byttes implementasjonen her ut med spørringer mot
// laereplan/emne/laeredel/oving/ovingssteg/testsporsmal —
// funksjonssignaturene under er skrevet for å holde seg stabile over
// det byttet.

import "server-only";
import { hentPrototypeData, type Emne, type EmnerRad } from "./prototypeData";

export type FagInfo = { id: string; navn: string; status: string; farge: string; klar: boolean };
export type RutePunkt = {
  slug: string | null;
  navn: string;
  kompetansemaalTekst: string;
  harInnhold: boolean;
};

export const TRINN = [8, 9, 10] as const;

export function hentFagListe(): FagInfo[] {
  const { FAG } = hentPrototypeData();
  return FAG.map((f) => ({ id: f.id, navn: f.n, status: f.s, farge: f.f, klar: f.klar }));
}

export function hentFag(fagId: string): FagInfo | undefined {
  return hentFagListe().find((f) => f.id === fagId);
}

export function hentRute(fagId: string, trinn: number): RutePunkt[] {
  const { EMNE, EMNER } = hentPrototypeData();
  const rader: EmnerRad[] = EMNER[`${fagId}-${trinn}`] ?? [];
  return rader.map((rad) => {
    const kilde = rad.id ? EMNE[rad.id] : null;
    return {
      slug: rad.id,
      navn: kilde ? kilde.n : rad.n ?? "",
      kompetansemaalTekst: kilde ? kilde.m : rad.m ?? "",
      harInnhold: !!kilde,
    };
  });
}

export function hentEmne(slug: string): Emne | undefined {
  const { EMNE } = hentPrototypeData();
  return EMNE[slug];
}

export function hentLaereplan() {
  return hentPrototypeData().LAEREPLAN;
}
