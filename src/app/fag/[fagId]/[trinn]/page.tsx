import Link from "next/link";
import { notFound } from "next/navigation";
import { LogoMerke } from "@/components/Logo";
import { hentFag, hentRute } from "@/lib/content";

export default async function Ruteside({
  params,
}: {
  params: Promise<{ fagId: string; trinn: string }>;
}) {
  const { fagId, trinn: trinnStr } = await params;
  const trinn = Number(trinnStr);
  const fag = hentFag(fagId);
  if (!fag || !fag.klar || ![8, 9, 10].includes(trinn)) notFound();

  const rute = hentRute(fagId, trinn);

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <div className="mb-5 flex items-center justify-between gap-2.5">
        <Link href="/" className="flex items-center gap-2">
          <LogoMerke />
          <span className="font-display text-[23px] font-bold tracking-tight text-petrol">
            Peil
          </span>
        </Link>
        <div className="flex gap-1.5">
          <span className="rounded-full bg-sand-2 px-3 py-1.5 text-xs font-medium text-petrol-2">
            {trinn}. trinn
          </span>
          <span className="rounded-full bg-sand-2 px-3 py-1.5 text-xs font-medium text-petrol-2">
            {fag.navn}
          </span>
        </div>
      </div>

      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        Ruta di
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">
        {rute.filter((r) => r.harInnhold).length} av {rute.length} punkter har øving klar nå.
      </p>

      <div className="relative space-y-2.5 pl-11 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-linje">
        {rute.map((punkt, i) => {
          const inner = (
            <>
              <span className="absolute -left-11 top-4 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-linje bg-sand font-display text-[13px] font-semibold text-petrol-3">
                {i + 1}
              </span>
              <span className="block font-display text-[16.5px] font-semibold leading-tight tracking-tight text-petrol">
                {punkt.navn}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-petrol-3">
                {punkt.kompetansemaalTekst}
              </span>
              {!punkt.harInnhold && (
                <span className="mt-1 block text-xs text-leire">Kommer snart</span>
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
      </div>
    </main>
  );
}
