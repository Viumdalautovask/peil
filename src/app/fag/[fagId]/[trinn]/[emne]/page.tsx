import Link from "next/link";
import { notFound } from "next/navigation";
import { hentEmne } from "@/lib/content";

export default async function Emneside({
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
        href={`/fag/${fagId}/${trinn}`}
        className="mb-3 block text-[13.5px] text-petrol-2"
      >
        ← Tilbake til ruta
      </Link>

      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        {emne.n}
      </h1>

      <div className="mb-5 mt-5 rounded-[18px] border-[1.5px] border-linje bg-kort px-[18px] py-4">
        <p className="text-[11.5px] uppercase tracking-wide text-petrol-3">Kompetansemål</p>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-petrol-2">{emne.m}</p>
      </div>

      <div className="space-y-2.5">
        <Link
          href={`/fag/${fagId}/${trinn}/${slug}/laer`}
          className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-4 py-3.5"
        >
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-linje font-display text-[13px] font-semibold text-petrol-3">
            L
          </span>
          <span className="flex flex-col">
            <span className="font-display text-base font-semibold leading-tight text-petrol">
              Lær
            </span>
            <span className="text-xs text-petrol-3">Les gjennom begrepene du trenger</span>
          </span>
        </Link>

        {emne.ov.map((o, i) => (
          <Link
            key={i}
            href={`/fag/${fagId}/${trinn}/${slug}/oving/${i}`}
            className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-linje bg-kort px-4 py-3.5"
          >
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-linje font-display text-[13px] font-semibold text-petrol-3">
              {i + 1}
            </span>
            <span className="flex flex-col">
              <span className="font-display text-base font-semibold leading-tight text-petrol">
                {o.t}
              </span>
              {o.niva && <span className="text-xs text-petrol-3">{o.niva}</span>}
            </span>
          </Link>
        ))}

        <Link
          href={`/fag/${fagId}/${trinn}/${slug}/test`}
          className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-gull bg-gull-2 px-4 py-3.5"
        >
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-gull font-display text-[13px] font-semibold text-gull">
            T
          </span>
          <span className="flex flex-col">
            <span className="font-display text-base font-semibold leading-tight text-petrol">
              Test
            </span>
            <span className="text-xs text-petrol-3">Ingen hint her — vis hva du kan</span>
          </span>
        </Link>
      </div>
    </main>
  );
}
