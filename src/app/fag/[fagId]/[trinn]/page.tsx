import Link from "next/link";
import { notFound } from "next/navigation";
import { LogoMerke } from "@/components/Logo";
import { RuteKlient } from "@/components/RuteKlient";
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

      <RuteKlient fagId={fagId} trinn={trinn} rute={rute} />
    </main>
  );
}
