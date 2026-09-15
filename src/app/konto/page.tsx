"use client";

import Link from "next/link";
import { useFremdrift } from "@/lib/fremdrift/store";
import { SPRAK } from "@/components/Portal";

function datoTxt(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export default function KontoSide() {
  const { tilstand, settKonto, slettAlt } = useFremdrift();
  const k = tilstand.konto;

  if (!k) {
    return (
      <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
        <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
          Konto
        </h1>
        <p className="text-petrol-3">Ingen konto.</p>
      </main>
    );
  }

  function siOpp() {
    if (confirm("Si opp abonnementet? Du beholder tilgangen ut perioden.")) {
      settKonto({ ...k!, status: "sagtopp" });
    }
  }
  function gjenoppta() {
    settKonto({ ...k!, status: "prove" });
  }
  function slettAltHandler() {
    if (confirm("Slette all data? Stjerner, fremdrift og konto blir borte. Dette kan ikke angres.")) {
      slettAlt();
      window.location.href = "/";
    }
  }
  function loggUt() {
    window.location.reload();
  }

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        Konto
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">Abonnement, betaling og data.</p>

      <div className="mb-2.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-[18px] py-4">
        <p className="text-xs uppercase tracking-wide text-petrol-3">Foresatt</p>
        <p className="mt-0.5 font-display text-[16.5px] font-semibold text-petrol">{k.navn || "—"}</p>
        <p className="mt-0.5 text-[13px] text-petrol-2">{k.epost}</p>
      </div>

      <div className="mb-2.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-[18px] py-4">
        <p className="text-xs uppercase tracking-wide text-petrol-3">Elev</p>
        <p className="mt-0.5 font-display text-[16.5px] font-semibold text-petrol">{k.elev}</p>
        <p className="mt-0.5 text-[13px] text-petrol-2">
          {k.trinn}. trinn{k.sprak ? ` · fremmedspråk: ${SPRAK[k.sprak]}` : ""}
        </p>
      </div>

      <div className="mb-2.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-[18px] py-4">
        <p className="text-xs uppercase tracking-wide text-petrol-3">Abonnement</p>
        <p className="mt-0.5 font-display text-[16.5px] font-semibold text-petrol">
          199 kr/mnd · ingen bindingstid
        </p>
        <p className="mt-0.5 text-[13px] text-petrol-2">
          {k.status === "prove"
            ? `14 dager gratis. Første trekk ${datoTxt(k.trekk)}.`
            : k.status === "sagtopp"
            ? `Sagt opp. Tilgang ut perioden, til ${datoTxt(k.trekk)}.`
            : `Fornyes ${datoTxt(k.trekk)}.`}
        </p>
      </div>

      <div className="mb-2.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-[18px] py-4">
        <p className="text-xs uppercase tracking-wide text-petrol-3">Betaling</p>
        <p className="mt-0.5 font-display text-[16.5px] font-semibold text-petrol">Vipps</p>
        <p className="mt-0.5 text-[13px] text-petrol-2">
          Peil ser aldri kortnummeret ditt. Avtalen kan også stoppes direkte i Vipps-appen.
        </p>
      </div>

      {k.status === "sagtopp" ? (
        <button
          onClick={gjenoppta}
          className="mt-2.5 block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
        >
          Gjenoppta abonnementet
        </button>
      ) : (
        <button onClick={siOpp} className="mx-auto mt-3.5 block text-sm text-leire underline">
          Si opp abonnementet
        </button>
      )}
      <button onClick={slettAltHandler} className="mx-auto mt-1 block text-sm text-leire underline">
        Slett all data
      </button>
      <button onClick={loggUt} className="mx-auto mt-1 block text-sm text-petrol-2 underline">
        Logg ut
      </button>

      <Link href="/" className="mt-6 block text-center text-[13.5px] text-petrol-2">
        ← Tilbake
      </Link>
    </main>
  );
}
