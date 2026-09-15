"use client";

import Link from "next/link";
import { useState } from "react";
import { Maskot } from "./Maskot";

export function EgetOvingKlient({
  navn,
  tilbakeHref,
}: {
  navn: string;
  tilbakeHref: string;
}) {
  const [svarVerdi, setSvarVerdi] = useState("");
  const [ferdig, setFerdig] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);

  function svar() {
    const v = svarVerdi.trim();
    if (v.length < 4) {
      setMelding("Skriv litt mer, så har jeg noe å jobbe med.");
      return;
    }
    setFerdig(true);
  }

  if (ferdig) {
    return (
      <div className="rounded-[26px] bg-petrol px-[22px] py-6 text-sand">
        <p className="mb-1.5 font-display text-[22px] font-bold tracking-tight">
          Du kom fram til det selv
        </p>
        <p className="text-[14.5px] text-[#B9C9CC]">Peil ga deg aldri svaret.</p>
        <Link
          href={tilbakeHref}
          className="mt-4 block w-full rounded-[18px] bg-sand px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-petrol"
        >
          Tilbake til ruta
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-5 py-[22px]">
      <div className="flex items-start gap-4">
        <div className="h-[84px] w-[84px] shrink-0">
          <Maskot />
        </div>
        <div className="flex-1">
          <p className="text-[11.5px] uppercase tracking-wide text-petrol-3">Peil</p>
          <p className="min-h-[58px] font-display text-[19.5px] font-medium leading-snug tracking-tight text-petrol">
            Du har lagt inn <b className="font-bold text-gull">{navn}</b>. Fortell meg hva du har
            prøvd så langt, så finner vi ut hvor det stopper.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs text-petrol-3" htmlFor="egetSvar">
          Ditt svar
        </label>
        <div className="flex gap-2.5">
          <input
            id="egetSvar"
            autoComplete="off"
            value={svarVerdi}
            onChange={(e) => setSvarVerdi(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") svar();
            }}
            className="min-w-0 flex-1 rounded-[18px] border-[1.5px] border-linje bg-sand px-4 py-3 font-display text-lg font-medium text-petrol outline-none focus:border-petrol"
          />
          <button
            onClick={svar}
            className="rounded-[18px] bg-petrol px-6 py-3 font-display text-[16.5px] font-semibold text-sand"
          >
            Svar
          </button>
        </div>
        {melding && (
          <p className="mt-2.5 rounded-xl border-l-[3px] border-gull bg-gull-2 px-3.5 py-2.5 text-[14.5px] text-[#6E5116]">
            {melding}
          </p>
        )}
        <p className="mt-3.5 text-xs text-petrol-3">
          Egne tema er en tidlig utgave — full sokratisk veiledning på fritt tema kommer med
          AI-koblingen (steg 4 i utviklingsplanen).
        </p>
      </div>
    </div>
  );
}
