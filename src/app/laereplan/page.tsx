import { hentLaereplan } from "@/lib/content";

function datoTxt(d: string) {
  const t = new Date(d);
  if (isNaN(t.getTime())) return d;
  return t.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export default function LaereplanSide() {
  const laereplan = hentLaereplan();

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        Læreplan
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">
        Kompetansemålene hentes fra Utdanningsdirektoratets åpne API.
      </p>

      <div className="space-y-3">
        {Object.values(laereplan).map((p) => (
          <div key={p.kode} className="rounded-[26px] border-[1.5px] border-linje bg-kort p-5">
            <p className="font-display text-[22px] font-bold tracking-tight text-petrol">{p.kode}</p>
            <p className="mb-3 text-[13.5px] text-petrol-2">{p.navn}</p>
            <div className="flex justify-between gap-3 border-t border-linje py-2 text-sm">
              <span className="text-petrol-2">Fastsatt</span>
              <span className="text-right font-display font-semibold text-petrol">{p.fastsatt}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-linje py-2 text-sm">
              <span className="text-petrol-2">Gjelder fra</span>
              <span className="text-right font-display font-semibold text-petrol">
                {p.fra !== "—" ? datoTxt(p.fra) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3 border-t border-linje py-2 text-sm">
              <span className="text-petrol-2">Struktur</span>
              <span className="text-right font-display font-semibold text-petrol">{p.struktur}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-linje py-2 text-sm">
              <span className="text-petrol-2">Kompetansemål 8.–10.</span>
              <span className="text-right font-display font-semibold text-petrol">{p.maal}</span>
            </div>
            <p
              className={
                "mt-3 rounded-xl px-3.5 py-2.5 text-[13.5px] " +
                (p.klar ? "bg-salvie-2 text-[#40584A]" : "bg-sand-2 text-petrol-2")
              }
            >
              {p.klar
                ? "Gjeldende versjon. Sist sjekket mot Udir i natt."
                : "Læreplanen er hentet. Innholdet skrives nå mot kompetansemålene."}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3.5 rounded-[26px] border-[1.5px] border-linje bg-kort p-5">
        <h3 className="mb-2.5 font-display text-[16.5px] font-semibold text-petrol">
          Slik holdes innholdet oppdatert
        </h3>
        <ol className="ml-[18px] list-decimal space-y-1.5 text-[14.5px] text-petrol-2">
          <li>
            Hver natt spør Peil{" "}
            <code className="rounded bg-sand-2 px-1.5 py-0.5 font-mono text-[13px]">data.udir.no</code>{" "}
            om gjeldende læreplan per fag.
          </li>
          <li>Ny versjon lagres ved siden av den gamle, aldri oppå.</li>
          <li>Endrede mål flagges, så innholdet under dem kan gjennomgås.</li>
          <li>Ny læreplan slås på 1. august. Aldri midt i et skoleår.</li>
        </ol>
      </div>
    </main>
  );
}
