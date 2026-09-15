"use client";

import Link from "next/link";
import { erMestret, useFremdrift } from "@/lib/fremdrift/store";
import type { RutePunkt } from "@/lib/content";

export function RuteKlient({
  fagId,
  trinn,
  rute,
}: {
  fagId: string;
  trinn: number;
  rute: RutePunkt[];
}) {
  const { tilstand } = useFremdrift();
  const egne = tilstand.egne[`${fagId}-${trinn}`] ?? [];

  const ferdig = rute.filter((p) => p.slug && erMestret(tilstand.fremdrift[p.slug])).length;
  const prosent = rute.length ? Math.round((ferdig / rute.length) * 100) : 0;

  return (
    <>
      <p className="mb-5 text-[14.5px] text-petrol-2">
        {ferdig} av {rute.length} emner mestret
        {rute.some((r) => !r.harInnhold) ? ` · ${rute.filter((r) => r.harInnhold).length} har øving klar nå` : ""}
        .
      </p>

      <div className="relative space-y-2.5 pl-11">
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-linje" />
        <div
          className="absolute left-[15px] top-4 w-0.5 bg-petrol transition-[height]"
          style={{ height: `${prosent}%` }}
        />
        {rute.map((punkt, i) => {
          const mestret = punkt.slug ? erMestret(tilstand.fremdrift[punkt.slug]) : false;
          const paagaende =
            punkt.slug && tilstand.fremdrift[punkt.slug] && !mestret ? true : false;
          const flagg = mestret ? "✓" : i + 1;
          const inner = (
            <>
              <span
                className={
                  "absolute -left-11 top-4 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] font-display text-[13px] font-semibold " +
                  (mestret
                    ? "border-petrol bg-petrol text-sand"
                    : paagaende
                    ? "border-gull bg-gull-2 text-gull"
                    : "border-linje bg-sand text-petrol-3")
                }
              >
                {flagg}
              </span>
              <span className="block font-display text-[16.5px] font-semibold leading-tight tracking-tight text-petrol">
                {punkt.navn}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-petrol-3">
                {punkt.kompetansemaalTekst}
              </span>
              {!punkt.harInnhold && (
                <span className="mt-1 block text-xs text-leire">Ikke klart ennå</span>
              )}
            </>
          );
          return punkt.harInnhold ? (
            <Link
              key={i}
              href={`/fag/${fagId}/${trinn}/${punkt.slug}`}
              className="relative mb-2.5 block rounded-[18px] border-[1.5px] border-linje bg-kort px-4 py-3.5 text-left"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={i}
              className="relative mb-2.5 block rounded-[18px] border-[1.5px] border-linje bg-kort px-4 py-3.5 text-left opacity-60"
            >
              {inner}
            </div>
          );
        })}

        {egne.map((e, n) => (
          <Link
            key={"eget-" + n}
            href={`/fag/${fagId}/${trinn}/eget/${n}`}
            className="relative mb-2.5 block rounded-[18px] border-[1.5px] border-dashed border-linje bg-kort px-4 py-3.5 text-left"
          >
            <span className="absolute -left-11 top-4 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-linje bg-sand font-display text-[13px] font-semibold text-petrol-3">
              +
            </span>
            <span className="block font-display text-[16.5px] font-semibold leading-tight tracking-tight text-petrol">
              {e.n}
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-petrol-3">{e.hva}</span>
            <span className="mt-1 block text-xs text-petrol-3">
              Ditt eget tema · Peil veileder fritt
            </span>
          </Link>
        ))}
      </div>

      <Link
        href={`/fag/${fagId}/${trinn}/eget`}
        className="mt-3.5 block w-full rounded-[18px] bg-sand-2 px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-petrol"
      >
        + Legg til eget tema
      </Link>
    </>
  );
}
