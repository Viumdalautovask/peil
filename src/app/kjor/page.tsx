import { KjorSpill } from "@/components/KjorSpill";
import { hentFagListe, hentSpillPoolPerTrinn, type SpillSporsmal } from "@/lib/content";

export default function KjorSide() {
  const fagListe = hentFagListe().filter((f) => f.klar);
  const poolPerFag: Record<string, Record<number, SpillSporsmal[]>> = {};
  for (const fag of fagListe) poolPerFag[fag.id] = hentSpillPoolPerTrinn(fag.id);

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        Kjøreturen
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">
        Kjør så langt du klarer. Hver hindring er et spørsmål — svarer du riktig, kommer du forbi.
      </p>
      <KjorSpill fagListe={fagListe} poolPerFag={poolPerFag} />
    </main>
  );
}
