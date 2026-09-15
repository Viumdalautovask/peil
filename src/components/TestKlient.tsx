"use client";

import Link from "next/link";
import { useState } from "react";
import type { TestSporsmal } from "@/lib/prototypeData";

export function TestKlient({
  tittel,
  sporsmal,
  tilbakeHref,
  ferdigHref,
}: {
  tittel: string;
  sporsmal: TestSporsmal[];
  tilbakeHref: string;
  ferdigHref: string;
}) {
  const [i, setI] = useState(0);
  const [riktigeSvart, setRiktigeSvart] = useState(0);
  const [valgt, setValgt] = useState<number | null>(null);
  const [ferdig, setFerdig] = useState(false);

  const q = sporsmal[i];

  function velg(n: number) {
    if (valgt !== null) return;
    setValgt(n);
    if (n === q.r) setRiktigeSvart((r) => r + 1);
  }

  function neste() {
    if (i + 1 < sporsmal.length) {
      setI((n) => n + 1);
      setValgt(null);
    } else {
      setFerdig(true);
    }
  }

  if (ferdig) {
    const bestatt = riktigeSvart >= 4;
    return (
      <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
        <div
          className={
            "rounded-[26px] border-[1.5px] px-[22px] py-6 text-center " +
            (bestatt ? "border-salvie bg-salvie-2" : "border-leire bg-leire-2")
          }
        >
          <p
            className={
              "font-display text-[52px] font-bold leading-none tracking-tight " +
              (bestatt ? "text-salvie" : "text-leire")
            }
          >
            {riktigeSvart}/{sporsmal.length}
          </p>
          <p className="my-1.5 text-[15px] text-petrol-2">
            {bestatt ? "Bestått. Du har mestret dette." : "Ikke helt ennå — prøv øvingene en gang til."}
          </p>
          <Link
            href={ferdigHref}
            className="mt-3 block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
          >
            Tilbake til emnet
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <Link href={tilbakeHref} className="mb-3 block text-[13.5px] text-petrol-2">
        ← Avbryt testen
      </Link>
      <h1 className="text-[21px] font-display font-semibold text-petrol">{tittel}</h1>
      <p className="mb-[18px] mt-1 text-[14.5px] text-petrol-2">
        Ingen hint her. Nå er det du som viser hva du kan.
      </p>

      <div className="mb-[18px] flex gap-1.5">
        {sporsmal.map((_, k) => (
          <span
            key={k}
            className={"h-1.5 flex-1 rounded-full " + (k <= i ? "bg-petrol" : "bg-linje")}
          />
        ))}
      </div>

      <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-5 py-[22px]">
        <p className="mb-[18px] font-display text-xl font-semibold leading-snug tracking-tight text-petrol">
          {q.q}
        </p>
        <div>
          {q.alt.map((alt, n) => {
            const erValgt = valgt === n;
            const erRiktig = n === q.r;
            let stil = "border-linje bg-sand text-petrol";
            if (valgt !== null && erRiktig) stil = "border-salvie bg-salvie-2 text-[#2E4A3C]";
            else if (valgt !== null && erValgt) stil = "border-leire bg-leire-2 text-[#7A3F2C]";
            return (
              <button
                key={n}
                disabled={valgt !== null}
                onClick={() => velg(n)}
                className={
                  "mb-2.5 block w-full rounded-[18px] border-[1.5px] px-4 py-3.5 text-left font-display text-[16.5px] font-medium disabled:cursor-default " +
                  stil
                }
              >
                {alt}
              </button>
            );
          })}
        </div>

        {valgt !== null && (
          <>
            <div className="mt-3.5 rounded-xl bg-sand-2 px-4 py-3.5 text-[14.5px] leading-relaxed text-petrol-2">
              {q.f}
            </div>
            <button
              onClick={neste}
              className="mt-3.5 block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
            >
              Neste
            </button>
          </>
        )}
      </div>
    </main>
  );
}
