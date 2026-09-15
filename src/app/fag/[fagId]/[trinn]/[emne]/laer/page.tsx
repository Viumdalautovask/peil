import Link from "next/link";
import { notFound } from "next/navigation";
import { hentEmne } from "@/lib/content";

export default async function Laerside({
  params,
}: {
  params: Promise<{ fagId: string; trinn: string; emne: string }>;
}) {
  const { fagId, trinn, emne: slug } = await params;
  const emne = hentEmne(slug);
  if (!emne) notFound();

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <Link
        href={`/fag/${fagId}/${trinn}/${slug}`}
        className="mb-3 block text-[13.5px] text-petrol-2"
      >
        ← Tilbake til emnet
      </Link>

      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        Lær
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">
        Les gjennom før du øver. Dette er begrepene du trenger.
      </p>

      <div className="space-y-3">
        {emne.laer.map((kort, i) => (
          <div key={i} className="rounded-[26px] border-[1.5px] border-linje bg-kort px-5 py-[22px]">
            <h3 className="mb-1.5 font-display text-lg font-semibold tracking-tight text-petrol">
              {kort.h}
            </h3>
            <p className="mb-4 text-[15.5px] leading-relaxed text-petrol-2">{kort.p}</p>
            {kort.eks && (
              <div className="mb-4 rounded-xl bg-sand px-3.5 py-3 font-display text-[16.5px] font-medium text-petrol">
                {kort.eks}
              </div>
            )}
            {kort.adv && (
              <div className="rounded-xl border-l-[3px] border-leire bg-leire-2 px-3.5 py-2.5 text-[14.5px] text-[#7A3F2C]">
                {kort.adv}
              </div>
            )}
          </div>
        ))}
      </div>

      <Link
        href={emne.ov.length ? `/fag/${fagId}/${trinn}/${slug}/oving/0` : `/fag/${fagId}/${trinn}/${slug}`}
        className="mt-3 block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
      >
        Jeg har lest — gå til øving
      </Link>
    </main>
  );
}
