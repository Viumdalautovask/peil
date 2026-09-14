// scripts/hent-udir.ts
// Kjøres nattlig via Vercel Cron. Henter gjeldende læreplaner fra
// Utdanningsdirektoratets åpne API og oppdaterer databasen.
//
// Prinsipp: NY LÆREPLAN SLÅS ALDRI PÅ AUTOMATISK.
// Skriptet henter og flagger. Et menneske godkjenner før elevene ser det.

import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FAG = [
  { fag: "matematikk", kode: "MAT01" },
  { fag: "naturfag",   kode: "NAT01" },
  { fag: "norsk",      kode: "NOR01" },
  { fag: "engelsk",    kode: "ENG01" },
];

const API = "https://data.udir.no/kl06/v201906/api/laereplaner-lk20";

type Maal = { udir_id: string; trinn: number; tekst: string; emneomrade: string | null };

async function hentGjeldende(grunnkode: string) {
  // Udir versjonerer med løpenummer: MAT01-05, MAT01-06 osv.
  // Vi spør etter gjeldende versjon for grunnkoden.
  const res = await fetch(`${API}/${grunnkode}?lang=nob`);
  if (!res.ok) throw new Error(`Udir svarte ${res.status} for ${grunnkode}`);
  return res.json();
}

function plukkUngdomstrinn(data: any): Maal[] {
  const ut: Maal[] = [];
  for (const sett of data.kompetansemaalsett ?? []) {
    const trinn = Number(String(sett.etterAarstrinn?.kode ?? "").replace(/\D/g, ""));
    if (![8, 9, 10].includes(trinn)) continue;
    for (const m of sett.kompetansemaal ?? []) {
      ut.push({
        udir_id: m.id,
        trinn,
        tekst: m.tittel?.tekst?.[0]?.verdi ?? "",
        emneomrade: m.tilhoerendeKjerneelementer?.[0]?.tittel?.tekst?.[0]?.verdi ?? null,
      });
    }
  }
  return ut;
}

async function synk(fag: string, grunnkode: string) {
  const data = await hentGjeldende(grunnkode);
  const kode: string = data.id;                    // f.eks. "MAT01-05"
  const til: string | null = data.gyldighetsperiode?.gyldigTil ?? null;
  const fra: string | null = data.gyldighetsperiode?.gyldigFom ?? null;

  const { data: fantes } = await db
    .from("laereplan").select("id, kode").eq("fag", fag).eq("aktiv", true).maybeSingle();

  // 1) Samme versjon: bare oppdater tidsstempel og avslutt.
  if (fantes?.kode === kode) {
    await db.from("laereplan").update({ sist_sjekket: new Date().toISOString() }).eq("id", fantes.id);
    console.log(`${fag}: uendret (${kode})`);
    return;
  }

  // 2) Ny versjon funnet. Lagres som INAKTIV, ved siden av den gamle.
  const { data: ny, error } = await db.from("laereplan").insert({
    kode, fag, gjelder_fra: fra, gjelder_til: til,
    aktiv: false, sist_sjekket: new Date().toISOString(),
  }).select().single();
  if (error) throw error;

  const maal = plukkUngdomstrinn(data);
  if (maal.length) {
    await db.from("kompetansemaal").insert(maal.map(m => ({ ...m, laereplan_id: ny.id })));
  }

  // 3) Sammenlign mot forrige versjon og flagg det som må gjennomgås.
  if (fantes) {
    const { data: gamle } = await db
      .from("kompetansemaal").select("udir_id, tekst").eq("laereplan_id", fantes.id);

    const før = new Map((gamle ?? []).map(g => [g.udir_id, g.tekst]));
    const endret = maal.filter(m => før.has(m.udir_id) && før.get(m.udir_id) !== m.tekst);
    const nye    = maal.filter(m => !før.has(m.udir_id));
    const borte  = [...før.keys()].filter(id => !maal.some(m => m.udir_id === id));

    await db.from("laereplan_varsel").insert({
      laereplan_id: ny.id,
      forrige_kode: fantes.kode,
      antall_endret: endret.length,
      antall_nye: nye.length,
      antall_fjernet: borte.length,
      detaljer: { endret, nye, borte },
      status: "venter_godkjenning",
    });

    // Deltemaer under endrede mål må gjennomgås før de brukes videre.
    if (endret.length) {
      await db.from("deltema")
        .update({ maa_gjennomgaas: true })
        .in("kompetansemaal_udir_id", endret.map(e => e.udir_id));
    }
  }

  console.log(`${fag}: NY VERSJON ${kode} lagret som inaktiv — venter godkjenning`);
}

export async function GET() {
  const logg: string[] = [];
  for (const f of FAG) {
    try { await synk(f.fag, f.kode); logg.push(`${f.fag}: ok`); }
    catch (e: any) { logg.push(`${f.fag}: FEIL — ${e.message}`); }
  }
  return Response.json({ kjørt: new Date().toISOString(), logg });
}
