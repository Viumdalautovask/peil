"use client";

import Link from "next/link";
import { use } from "react";
import { EgetOvingKlient } from "@/components/EgetOvingKlient";
import { useFremdrift } from "@/lib/fremdrift/store";

export default function EgetOvingSide({
  params,
}: {
  params: Promise<{ fagId: string; trinn: string; idx: string }>;
}) {
  const { fagId, trinn, idx } = use(params);
  const { tilstand } = useFremdrift();
  const tema = tilstand.egne[`${fagId}-${trinn}`]?.[Number(idx)];

  const basis = `/fag/${fagId}/${trinn}`;
  if (!tema) {
    // Kan skje rett etter innlasting før lokal lagring er lest inn.
    return (
      <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
        <Link href={basis} className="mb-3 block text-[13.5px] text-petrol-2">
          ← Tilbake til ruta
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <Link href={basis} className="mb-3 block text-[13.5px] text-petrol-2">
        ← Tilbake til ruta
      </Link>
      <h1 className="mb-3.5 text-[21px] font-display font-semibold text-petrol">{tema.n}</h1>
      <EgetOvingKlient navn={tema.n} tilbakeHref={basis} />
    </main>
  );
}
