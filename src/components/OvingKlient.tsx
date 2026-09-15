"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Maskot, type Bevegelse, type Uttrykk } from "./Maskot";
import type { LaerKort, OvingSteg } from "@/lib/prototypeData";
import { useFremdrift } from "@/lib/fremdrift/store";

type HjelpKort = { n: string; t?: string; eks?: string; dyp?: boolean };

function byggStige(steg: OvingSteg, laerKort: LaerKort[]): HjelpKort[] {
  const items: HjelpKort[] = [
    { n: "Et lite dytt", t: steg.naer },
    { n: "Konkret hint", t: steg.hint },
    { n: "En annen innfallsvinkel", t: steg.om },
    { n: "Prøv denne først", t: steg.lign },
  ].filter((x) => x.t);

  const refererte = steg.laerRef !== undefined ? [laerKort[steg.laerRef]] : laerKort.slice(0, 2);
  refererte.forEach((l) => {
    if (l) items.push({ n: "Fra Lær · " + l.h, t: l.p, eks: l.eks, dyp: true });
  });
  items.push({
    n: "Gå tilbake og les",
    t: "Nå har du fått all hjelpen jeg kan gi uten å røpe svaret. Gå tilbake til Lær-delen og les gjennom en gang til — så tar vi denne på nytt etterpå. Det er ikke juks, det er sånn man lærer.",
    dyp: true,
  });
  return items;
}

function EttSteg({
  steg,
  laerKort,
  trinnLavt,
  nrIRekka,
  antallSteg,
  onRiktig,
}: {
  steg: OvingSteg;
  laerKort: LaerKort[];
  trinnLavt: boolean;
  nrIRekka: number;
  antallSteg: number;
  onRiktig: (rentSteg: boolean, hjelpBruktHer: number) => void;
}) {
  const [svarVerdi, setSvarVerdi] = useState("");
  const [bom, setBom] = useState(0);
  const [stigeN, setStigeN] = useState(0);
  const [gitte, setGitte] = useState<HjelpKort[]>([]);
  const [melding, setMelding] = useState<string | null>(null);
  const [uttrykk, setUttrykk] = useState<Uttrykk>("vanlig");
  const [bevegelse, setBevegelse] = useState<Bevegelse>(null);
  const [glimtPa, setGlimtPa] = useState(false);
  const [laast, setLaast] = useState(false);

  const stige = useMemo(() => byggStige(steg, laerKort), [steg, laerKort]);

  function gi() {
    if (stigeN >= stige.length) return;
    const hint = stige[stigeN];
    setStigeN((n) => n + 1);
    setGitte((g) => [...g, hint]);
    setBevegelse("tenk");
    setTimeout(() => setBevegelse(null), 950);
  }

  function riktig() {
    setLaast(true);
    setUttrykk("glad");
    setBevegelse("jubel");
    setGlimtPa(true);
    setMelding(null);
    const rent = bom === 0 && stigeN === 0;
    setTimeout(() => setGlimtPa(false), 950);
    setTimeout(() => {
      setUttrykk("vanlig");
      setBevegelse(null);
      onRiktig(rent, stigeN);
    }, 1000);
  }

  function feil(vLower: string) {
    setBom((b) => b + 1);
    setUttrykk("bom");
    setBevegelse("sukk");
    let spesifikk: string | null = null;
    if (steg.feilsvar) {
      for (const [nokkel, forklaring] of Object.entries(steg.feilsvar)) {
        if (vLower.includes(nokkel)) {
          spesifikk = forklaring;
          break;
        }
      }
    }
    setMelding(
      spesifikk ??
        (bom === 0
          ? "Ikke helt. Se hintet under, så prøver vi igjen."
          : "Fortsatt ikke. Jeg gir deg litt mer.")
    );
    gi();
    setTimeout(() => {
      setUttrykk("vanlig");
      setBevegelse(null);
    }, 1500);
  }

  function svar() {
    if (laast) return;
    const v = svarVerdi.trim();
    if (!v) {
      setMelding("Skriv noe først, så ser vi på det sammen.");
      return;
    }
    const vLower = v.toLowerCase();
    if (steg.fasit.some((f) => vLower.includes(f))) riktig();
    else feil(vLower);
  }

  const sporsmalTekst = trinnLavt && steg.enkel ? steg.enkel : steg.q;

  return (
    <>
      <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-5 py-[22px]">
        <div className="flex items-start gap-4">
          <div className="h-[84px] w-[84px] shrink-0">
            <Maskot uttrykk={uttrykk} bevegelse={bevegelse} glimtPa={glimtPa} />
          </div>
          <div className="flex-1">
            <p className="text-[11.5px] uppercase tracking-wide text-petrol-3">Peil</p>
            <p
              className="min-h-[58px] font-display text-[19.5px] font-medium leading-snug tracking-tight text-petrol"
              dangerouslySetInnerHTML={{ __html: sporsmalTekst }}
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs text-petrol-3" htmlFor="svar">
            Ditt svar
          </label>
          <div className="flex gap-2.5">
            <input
              id="svar"
              autoComplete="off"
              disabled={laast}
              value={svarVerdi}
              onChange={(e) => setSvarVerdi(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") svar();
              }}
              className="min-w-0 flex-1 rounded-[18px] border-[1.5px] border-linje bg-sand px-4 py-3 font-display text-lg font-medium text-petrol outline-none focus:border-petrol disabled:opacity-60"
            />
            <button
              onClick={svar}
              disabled={laast}
              className="rounded-[18px] bg-petrol px-6 py-3 font-display text-[16.5px] font-semibold text-sand disabled:opacity-60"
            >
              Svar
            </button>
          </div>
          {melding && (
            <p className="mt-2.5 rounded-xl border-l-[3px] border-gull bg-gull-2 px-3.5 py-2.5 text-[14.5px] text-[#6E5116]">
              {melding}
            </p>
          )}

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <button
              onClick={gi}
              disabled={laast || stigeN >= stige.length}
              className="rounded-full border-[1.5px] border-linje bg-sand-2 px-[18px] py-2.5 font-display text-[14.5px] font-semibold text-petrol disabled:opacity-45"
            >
              {stigeN >= stige.length ? "Alt er gitt" : "Jeg står fast"}
            </button>
            <span className="text-xs text-petrol-3">
              {stigeN === 0
                ? ""
                : stige.length - stigeN > 0
                ? `${stige.length - stigeN} hjelp igjen på dette steget`
                : "Ingen flere hint her"}
            </span>
          </div>

          {gitte.length > 0 && (
            <div className="mt-3">
              {gitte.map((h, k) => (
                <div
                  key={k}
                  className={
                    "mb-2 rounded-xl border-l-[3px] px-3.5 py-3 " +
                    (h.dyp ? "border-gull bg-gull-2" : "border-salvie bg-sand")
                  }
                >
                  <p className="mb-0.5 text-[11.5px] uppercase tracking-wide text-petrol-3">
                    {h.n}
                  </p>
                  <p className={"text-[14.5px] leading-relaxed " + (h.dyp ? "text-[#6E5116]" : "text-petrol-2")}>
                    {h.t}
                  </p>
                  {h.eks && (
                    <div className="mt-2 rounded-lg bg-kort px-2.5 py-2 font-display text-[15px] font-medium text-petrol">
                      {h.eks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-3.5 space-y-3.5 rounded-[26px] border-[1.5px] border-linje bg-kort px-5 py-5 pl-8">
        <div className="absolute left-[26px] top-[26px] bottom-[26px] w-0.5 bg-linje" />
        {Array.from({ length: antallSteg }).map((_, k) => (
          <div key={k} className="relative">
            <span
              className={
                "absolute -left-8 top-px flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] font-display text-xs font-semibold " +
                (k < nrIRekka
                  ? "border-petrol bg-petrol text-sand"
                  : k === nrIRekka
                  ? "border-gull bg-gull-2 text-gull"
                  : "border-linje bg-sand text-petrol-3")
              }
            >
              {k + 1}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function OvingKlient({
  emneSlug,
  ovingIdx,
  tittel,
  steg,
  laerKort,
  trinnLavt,
  tilbakeHref,
  nesteHref,
  nesteEtikett,
}: {
  emneSlug: string;
  ovingIdx: number;
  tittel: string;
  steg: OvingSteg[];
  laerKort: LaerKort[];
  trinnLavt: boolean;
  tilbakeHref: string;
  nesteHref: string;
  nesteEtikett: string;
}) {
  const { fullforOving } = useFremdrift();
  const [i, setI] = useState(0);
  const [ferdig, setFerdig] = useState(false);
  const [rentSteg, setRentSteg] = useState(0);
  const [hjelpBrukt, setHjelpBrukt] = useState(0);

  if (ferdig) {
    return (
      <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
        <Link href={tilbakeHref} className="mb-3 block text-[13.5px] text-petrol-2">
          ← Tilbake til emnet
        </Link>
        <div className="rounded-[26px] bg-petrol px-[22px] py-6 text-sand">
          <p className="mb-1.5 font-display text-[22px] font-bold tracking-tight">
            Der satt den.
          </p>
          <p className="text-[14.5px] text-[#B9C9CC]">Du klarte hele resonnementet selv.</p>
          <Link
            href={nesteHref}
            className="mt-4 block w-full rounded-[18px] bg-sand px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-petrol"
          >
            {nesteEtikett}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <Link href={tilbakeHref} className="mb-3 block text-[13.5px] text-petrol-2">
        ← Tilbake til emnet
      </Link>
      <h1 className="mb-3.5 text-[21px] font-display font-semibold text-petrol">{tittel}</h1>

      <EttSteg
        key={i}
        steg={steg[i]}
        laerKort={laerKort}
        trinnLavt={trinnLavt}
        nrIRekka={i}
        antallSteg={steg.length}
        onRiktig={(rent, hjelpHer) => {
          const nyttRentSteg = rentSteg + (rent ? 1 : 0);
          const nyttHjelpBrukt = hjelpBrukt + hjelpHer;
          setRentSteg(nyttRentSteg);
          setHjelpBrukt(nyttHjelpBrukt);
          if (i + 1 < steg.length) {
            setI((n) => n + 1);
          } else {
            const andel = steg.length ? nyttRentSteg / steg.length : 0;
            const nivaa =
              andel >= 0.85 && nyttHjelpBrukt <= 1
                ? "hoy"
                : andel < 0.5 || nyttHjelpBrukt >= 4
                ? "lav"
                : "ok";
            fullforOving(emneSlug, ovingIdx, nivaa);
            setFerdig(true);
          }
        }}
      />
    </main>
  );
}
