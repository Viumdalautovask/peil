"use client";

import Link from "next/link";
import { erMestret, useFremdrift } from "@/lib/fremdrift/store";
import type { Emne } from "@/lib/prototypeData";

export function EmneKlient({
  fagId,
  trinn,
  slug,
  emne,
}: {
  fagId: string;
  trinn: number;
  slug: string;
  emne: Emne;
}) {
  const { fremdriftFor } = useFremdrift();
  const f = fremdriftFor(slug);
  const mestret = erMestret(f);
  const ruteHref = `/fag/${fagId}/${trinn}`;
  const basis = `${ruteHref}/${slug}`;

  const status = mestret
    ? "Emnet er mestret. Du kan gjerne ta testen på nytt."
    : f.nivaa === "lav"
    ? "Les først, øv deretter. Det er lagt inn en ekstra rolig runde på dette emnet."
    : f.nivaa === "hoy"
    ? "Dette sitter godt. Det er låst opp en vanskeligere øving til deg."
    : "Les først, øv deretter, og ta testen til slutt.";

  const niv = f.nivaa ?? "ok";
  const synligeOvinger = emne.ov
    .map((o, n) => ({ o, n }))
    .filter(({ o, n }) => {
      if (o.niva === "ekstra" && niv !== "lav" && !f.ov[n]) return false;
      if (o.niva === "utfordring" && niv !== "hoy" && !f.ov[n]) return false;
      return true;
    });

  const alleObligatoriskeOvingerGjort = emne.ov.every(
    (o, n) => o.niva === "ekstra" || o.niva === "utfordring" || f.ov[n]
  );

  return (
    <>
      <Link href={ruteHref} className="mb-3 block text-[13.5px] text-petrol-2">
        ← Tilbake til ruta
      </Link>

      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        {emne.n}
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">{status}</p>

      <div className="mb-5 rounded-[18px] border-[1.5px] border-linje bg-kort px-[18px] py-4">
        <p className="text-[11.5px] uppercase tracking-wide text-petrol-3">Kompetansemål</p>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-petrol-2">{emne.m}</p>
      </div>

      <div className="space-y-2.5">
        <Link
          href={`${basis}/laer`}
          className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-4 py-3.5"
        >
          <span
            className={
              "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] font-display text-[13px] font-semibold " +
              (f.laer ? "border-salvie bg-salvie text-white" : "border-linje text-petrol-3")
            }
          >
            {f.laer ? "✓" : "1"}
          </span>
          <span className="flex flex-col">
            <span className="font-display text-base font-semibold leading-tight text-petrol">
              Lær
            </span>
            <span className="text-xs text-petrol-3">
              Begreper og eksempler · {emne.laer.length} deler
            </span>
          </span>
        </Link>

        {synligeOvinger.map(({ o, n }, visIdx) => {
          const ferdig = !!f.ov[n];
          const laast = !f.laer;
          const undertekst =
            o.niva === "ekstra"
              ? "Ekstra runde fordi dette satt litt tungt"
              : o.niva === "utfordring"
              ? "Vanskeligere — du er klar for dette"
              : o.niva === "start"
              ? `Rolig start · ${o.steg.length} steg`
              : `${o.steg.length} steg med veiledning`;
          const inner = (
            <>
              <span
                className={
                  "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] font-display text-[13px] font-semibold " +
                  (ferdig ? "border-salvie bg-salvie text-white" : "border-linje text-petrol-3")
                }
              >
                {ferdig ? "✓" : visIdx + 2}
              </span>
              <span className="flex flex-col">
                <span className="font-display text-base font-semibold leading-tight text-petrol">
                  {o.t}
                </span>
                <span className="text-xs text-petrol-3">{undertekst}</span>
              </span>
            </>
          );
          return laast ? (
            <div
              key={n}
              className="flex cursor-not-allowed items-center gap-3.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-4 py-3.5 opacity-50"
            >
              {inner}
            </div>
          ) : (
            <Link
              key={n}
              href={`${basis}/oving/${n}`}
              className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-4 py-3.5"
            >
              {inner}
            </Link>
          );
        })}

        {(() => {
          const testTekst = f.test === null ? "5 spørsmål uten hint" : `Du fikk ${f.test} av 5`;
          const inner = (
            <>
              <span
                className={
                  "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] font-display text-[13px] font-semibold " +
                  (mestret ? "border-salvie bg-salvie text-white" : "border-gull text-gull")
                }
              >
                ✓
              </span>
              <span className="flex flex-col">
                <span className="font-display text-base font-semibold leading-tight text-petrol">
                  Test
                </span>
                <span className="text-xs text-petrol-3">{testTekst}</span>
              </span>
            </>
          );
          return alleObligatoriskeOvingerGjort ? (
            <Link
              href={`${basis}/test`}
              className={
                "flex items-center gap-3.5 rounded-[18px] border-[1.5px] px-4 py-3.5 " +
                (mestret ? "border-salvie bg-salvie-2" : "border-gull bg-gull-2")
              }
            >
              {inner}
            </Link>
          ) : (
            <div className="flex cursor-not-allowed items-center gap-3.5 rounded-[18px] border-[1.5px] border-gull bg-gull-2 px-4 py-3.5 opacity-50">
              {inner}
            </div>
          );
        })()}
      </div>
    </>
  );
}
