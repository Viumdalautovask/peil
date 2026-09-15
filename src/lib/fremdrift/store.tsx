"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LAGRINGSNOKKEL,
  TOM_TILSTAND,
  tomFremdrift,
  tilfeldigFro,
  erMestret,
  type BokOppforing,
  type EgetTema,
  type FremdriftEmne,
  type Konto,
  type Tilstand,
} from "./types";

type Ctx = {
  tilstand: Tilstand;
  lastet: boolean;
  settTrinnFag: (trinn: number | null, fag: string | null) => void;
  fremdriftFor: (slug: string) => FremdriftEmne;
  merkLaerLest: (slug: string) => void;
  fullforOving: (slug: string, idx: number, nivaa: FremdriftEmne["nivaa"]) => void;
  registrerTest: (slug: string, riktige: number, regel: string, emneNavn: string, fag: string) => void;
  leggTilEget: (fagTrinn: string, tema: EgetTema) => void;
  settRekord: (nokkel: string, distanse: number) => void;
  settKonto: (konto: Konto | null) => void;
  slettAlt: () => void;
};

const FremdriftContext = createContext<Ctx | null>(null);

export function FremdriftProvider({ children }: { children: React.ReactNode }) {
  const [tilstand, setTilstand] = useState<Tilstand>(TOM_TILSTAND);
  const [lastet, setLastet] = useState(false);

  // Leser lagret tilstand fra localStorage ved oppstart. Kjøres bevisst
  // i en effekt (ikke en lazy useState-initializer) slik at
  // server-rendret og første klient-render er identiske — deretter
  // synkroniseres den lagrede tilstanden inn. Dette er den anbefalte
  // måten å hente inn data fra en ekstern kilde (nettleserlagring) på,
  // derav eslint-unntakene under.
  useEffect(() => {
    try {
      const r = localStorage.getItem(LAGRINGSNOKKEL);
      if (r) {
        const lagret = JSON.parse(r);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTilstand((s) => ({ ...s, ...lagret, fro: lagret.fro ?? tilfeldigFro() }));
      } else {
        setTilstand((s) => ({ ...s, fro: tilfeldigFro() }));
      }
    } catch {
      // localStorage utilgjengelig — appen funker likevel, bare uten lagring.
      setTilstand((s) => ({ ...s, fro: tilfeldigFro() }));
    }
    setLastet(true);
  }, []);

  useEffect(() => {
    if (!lastet) return;
    try {
      localStorage.setItem(LAGRINGSNOKKEL, JSON.stringify(tilstand));
    } catch {
      // ignorer — kvote/privat nettlesing kan blokkere lagring.
    }
  }, [tilstand, lastet]);

  const settTrinnFag = useCallback((trinn: number | null, fag: string | null) => {
    setTilstand((s) => ({ ...s, trinn, fag }));
  }, []);

  const fremdriftFor = useCallback(
    (slug: string): FremdriftEmne => tilstand.fremdrift[slug] ?? tomFremdrift(),
    [tilstand.fremdrift]
  );

  const merkLaerLest = useCallback((slug: string) => {
    setTilstand((s) => ({
      ...s,
      fremdrift: {
        ...s.fremdrift,
        [slug]: { ...(s.fremdrift[slug] ?? tomFremdrift()), laer: true },
      },
    }));
  }, []);

  const fullforOving = useCallback(
    (slug: string, idx: number, nivaa: FremdriftEmne["nivaa"]) => {
      setTilstand((s) => {
        const eksisterende = s.fremdrift[slug] ?? tomFremdrift();
        const ov = [...eksisterende.ov];
        ov[idx] = true;
        return {
          ...s,
          lost: s.lost + 1,
          fremdrift: { ...s.fremdrift, [slug]: { ...eksisterende, ov, nivaa } },
        };
      });
    },
    []
  );

  const registrerTest = useCallback(
    (slug: string, riktige: number, regel: string, emneNavn: string, fag: string) => {
      setTilstand((s) => {
        const eksisterende = s.fremdrift[slug] ?? tomFremdrift();
        const oppdatert = { ...eksisterende, test: riktige };
        const bestatt = riktige >= 4;
        const boken: BokOppforing[] =
          bestatt && !s.bok.some((b) => b.t === regel)
            ? [
                {
                  t: regel,
                  e: emneNavn,
                  f: fag,
                  d: new Date().toLocaleDateString("nb-NO", { day: "numeric", month: "long" }),
                },
                ...s.bok,
              ]
            : s.bok;
        return {
          ...s,
          fremdrift: { ...s.fremdrift, [slug]: oppdatert },
          bok: boken,
        };
      });
    },
    []
  );

  const leggTilEget = useCallback((fagTrinn: string, tema: EgetTema) => {
    setTilstand((s) => ({
      ...s,
      egne: { ...s.egne, [fagTrinn]: [...(s.egne[fagTrinn] ?? []), tema] },
    }));
  }, []);

  const settRekord = useCallback((nokkel: string, distanse: number) => {
    setTilstand((s) =>
      distanse > (s.rekord[nokkel] ?? 0)
        ? { ...s, rekord: { ...s.rekord, [nokkel]: distanse } }
        : s
    );
  }, []);

  const settKonto = useCallback((konto: Konto | null) => {
    setTilstand((s) => ({ ...s, konto, trinn: konto ? konto.trinn : s.trinn }));
  }, []);

  const slettAlt = useCallback(() => {
    try {
      localStorage.removeItem(LAGRINGSNOKKEL);
    } catch {
      // ignorer
    }
    setTilstand(TOM_TILSTAND);
  }, []);

  const verdi = useMemo<Ctx>(
    () => ({
      tilstand,
      lastet,
      settTrinnFag,
      fremdriftFor,
      merkLaerLest,
      fullforOving,
      registrerTest,
      leggTilEget,
      settRekord,
      settKonto,
      slettAlt,
    }),
    [
      tilstand,
      lastet,
      settTrinnFag,
      fremdriftFor,
      merkLaerLest,
      fullforOving,
      registrerTest,
      leggTilEget,
      settRekord,
      settKonto,
      slettAlt,
    ]
  );

  return <FremdriftContext.Provider value={verdi}>{children}</FremdriftContext.Provider>;
}

export function useFremdrift() {
  const ctx = useContext(FremdriftContext);
  if (!ctx) throw new Error("useFremdrift må brukes inni <FremdriftProvider>");
  return ctx;
}

export { erMestret };
