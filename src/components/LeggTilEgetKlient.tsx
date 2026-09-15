"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFremdrift } from "@/lib/fremdrift/store";

export function LeggTilEgetKlient({ fagId, trinn }: { fagId: string; trinn: number }) {
  const { leggTilEget } = useFremdrift();
  const router = useRouter();
  const [navn, setNavn] = useState("");
  const [hva, setHva] = useState("");

  function lagre() {
    if (!navn.trim()) return;
    leggTilEget(`${fagId}-${trinn}`, { n: navn.trim(), hva: hva.trim() || "Lagt til av deg" });
    router.push(`/fag/${fagId}/${trinn}`);
  }

  return (
    <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-5 py-[22px]">
      <label className="mb-1.5 block text-xs text-petrol-3" htmlFor="egetNavn">
        Hva heter temaet?
      </label>
      <div className="mb-4">
        <input
          id="egetNavn"
          autoComplete="off"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          placeholder="For eksempel: Trigonometri"
          className="w-full rounded-[18px] border-[1.5px] border-linje bg-sand px-4 py-3 font-display text-lg font-medium text-petrol outline-none focus:border-petrol"
        />
      </div>
      <label className="mb-1.5 block text-xs text-petrol-3" htmlFor="egetHva">
        Hva er det du står fast på?
      </label>
      <div className="mb-4">
        <input
          id="egetHva"
          autoComplete="off"
          value={hva}
          onChange={(e) => setHva(e.target.value)}
          placeholder="Skriv med egne ord"
          className="w-full rounded-[18px] border-[1.5px] border-linje bg-sand px-4 py-3 font-display text-lg font-medium text-petrol outline-none focus:border-petrol"
        />
      </div>
      <button
        onClick={lagre}
        className="block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
      >
        Legg til i ruta mi
      </button>
    </div>
  );
}
