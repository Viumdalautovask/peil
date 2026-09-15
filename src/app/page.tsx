import Link from "next/link";
import { LogoMerke } from "@/components/Logo";
import { TrinnFagVelger } from "@/components/TrinnFagVelger";
import { hentFagListe } from "@/lib/content";

export default function Hjem() {
  const fagListe = hentFagListe();

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <div className="mb-5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <LogoMerke />
          <span className="font-display text-[23px] font-bold tracking-tight text-petrol">
            Peil
          </span>
        </div>
        <Link
          href="/konto"
          aria-label="Konto"
          title="Konto"
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-sand-2 text-petrol"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]">
            <circle cx="12" cy="8.5" r="3.6" />
            <path d="M4.5 20c.9-4 3.9-6 7.5-6s6.6 2 7.5 6" />
          </svg>
        </Link>
      </div>

      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        Hva skal du jobbe med?
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">Velg trinn først, så fag.</p>

      <TrinnFagVelger fagListe={fagListe} />
    </main>
  );
}
