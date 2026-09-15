import Link from "next/link";
import { LeggTilEgetKlient } from "@/components/LeggTilEgetKlient";

export default async function LeggTilEgetSide({
  params,
}: {
  params: Promise<{ fagId: string; trinn: string }>;
}) {
  const { fagId, trinn } = await params;

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <Link href={`/fag/${fagId}/${trinn}`} className="mb-3 block text-[13.5px] text-petrol-2">
        ← Tilbake til ruta
      </Link>
      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        Legg til eget tema
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">
        Står du fast på noe som ikke ligger i ruta? Skriv det inn, så tar Peil det med deg.
      </p>
      <LeggTilEgetKlient fagId={fagId} trinn={Number(trinn)} />
    </main>
  );
}
