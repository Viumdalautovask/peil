"use client";

import Link from "next/link";
import { useState } from "react";
import type { FagInfo } from "@/lib/content";

const TRINN = [8, 9, 10] as const;

export function TrinnFagVelger({ fagListe }: { fagListe: FagInfo[] }) {
  const [trinn, setTrinn] = useState<number>(8);

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        {TRINN.map((t) => (
          <button
            key={t}
            onClick={() => setTrinn(t)}
            className={
              "rounded-[18px] border-[1.5px] px-2 py-4 text-center font-display text-xl font-semibold " +
              (t === trinn
                ? "border-petrol bg-petrol text-sand"
                : "border-linje bg-kort text-petrol")
            }
          >
            {t}. trinn
          </button>
        ))}
      </div>

      <h2 className="mt-6 mb-2.5 font-display text-[17px] font-semibold tracking-tight text-petrol-2">
        Fag
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {fagListe.map((fag) => (
          <Link
            key={fag.id}
            href={fag.klar ? `/fag/${fag.id}/${trinn}` : "#"}
            aria-disabled={!fag.klar}
            className={
              "block rounded-[18px] border-[1.5px] border-linje bg-kort p-3.5 text-left" +
              (fag.klar ? "" : " pointer-events-none opacity-55")
            }
          >
            <span
              className="mb-2.5 block h-2 w-2 rounded-full"
              style={{ background: fag.farge }}
            />
            <span className="block font-display text-[15.5px] font-semibold leading-tight text-petrol">
              {fag.navn}
            </span>
            <span className={"block text-xs " + (fag.klar ? "text-petrol-3" : "text-leire")}>
              {fag.status}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
