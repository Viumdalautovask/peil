// scripts/seed.ts
//
// Flytter innholdet i prototypens LAEREPLAN/EMNE/EMNER-objekter inn i
// databasen. Innholdet skrives ALDRI på nytt for hånd — dette
// scriptet parser og evaluerer datablokken direkte ut av
// prototype/peil-laering.html, slik at all tekst blir identisk med
// det som allerede er skrevet, korrekturlest og testet i prototypen.
//
// Kjøres mot en tom/utviklings-database: sletter og bygger
// innholdstabellene på nytt (elevdata i `elev`/`fremdrift`/`bok`/
// `kvote` røres aldri).
//
// Bruk: npm run seed

import { createClient } from "@supabase/supabase-js";
import { hentPrototypeData } from "../src/lib/prototypeData";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Mangler NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY i miljøet.");
  }
  const db = createClient(url, key);
  const { LAEREPLAN, EMNE, EMNER } = hentPrototypeData();

  console.log("Tømmer innholdstabeller …");
  // Cascade fjerner kompetansemaal / laeredel / oving / ovingssteg /
  // feilsvar / testsporsmal automatisk. Elevdata er ikke koblet med
  // ON DELETE CASCADE herfra og påvirkes ikke.
  await db.from("laereplan").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("emne").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("Setter inn læreplaner …");
  for (const [fag, lp] of Object.entries(LAEREPLAN)) {
    const { error } = await db.from("laereplan").insert({
      fag,
      kode: lp.kode,
      navn: lp.navn,
      struktur: lp.struktur,
      gjelder_fra: lp.fra !== "—" ? lp.fra : null,
      aktiv: !!lp.klar,
    });
    if (error) throw new Error(`laereplan(${fag}): ${error.message}`);
  }

  console.log("Setter inn emner, lær, øving og test …");
  for (const [fagTrinn, rader] of Object.entries(EMNER)) {
    const [fag, trinnStr] = fagTrinn.split("-");
    const trinn = Number(trinnStr);

    for (let i = 0; i < rader.length; i++) {
      const rad = rader[i];
      const harInnhold = rad.id !== null && rad.id in EMNE;
      const kilde = harInnhold ? EMNE[rad.id as string] : null;

      const { data: emneRad, error: emneErr } = await db.from("emne").insert({
        slug: rad.id,
        fag,
        trinn,
        navn: kilde ? kilde.n : rad.n,
        kompetansemaal_tekst: kilde ? kilde.m : rad.m,
        regel: kilde ? kilde.regel : null,
        rekkefolge: i,
        har_innhold: harInnhold,
      }).select("id").single();
      if (emneErr) throw new Error(`emne(${fagTrinn}#${i}): ${emneErr.message}`);
      const emneId = emneRad.id as string;

      if (!kilde) continue;

      const laerIdVedIndex: string[] = [];
      for (let li = 0; li < kilde.laer.length; li++) {
        const l = kilde.laer[li];
        const { data: laerRad, error: laerErr } = await db.from("laeredel").insert({
          emne_id: emneId, rekkefolge: li, tittel: l.h, tekst: l.p,
          eksempel: l.eks ?? null, advarsel: l.adv ?? null,
        }).select("id").single();
        if (laerErr) throw new Error(`laeredel(${rad.id}#${li}): ${laerErr.message}`);
        laerIdVedIndex.push(laerRad.id as string);
      }

      for (let oi = 0; oi < kilde.ov.length; oi++) {
        const o = kilde.ov[oi];
        const { data: ovingRad, error: ovingErr } = await db.from("oving").insert({
          emne_id: emneId, rekkefolge: oi, tittel: o.t, niva: o.niva ?? null,
        }).select("id").single();
        if (ovingErr) throw new Error(`oving(${rad.id}#${oi}): ${ovingErr.message}`);
        const ovingId = ovingRad.id as string;

        for (let si = 0; si < o.steg.length; si++) {
          const s = o.steg[si];
          const { data: stegRad, error: stegErr } = await db.from("ovingssteg").insert({
            oving_id: ovingId, rekkefolge: si,
            sporsmal: s.q, sporsmal_enkel: s.enkel ?? null, kort_navn: s.kort,
            fasit: s.fasit,
            hint_naer: s.naer ?? null, hint_konkret: s.hint ?? null,
            hint_vinkel: s.om ?? null, hint_lignende: s.lign ?? null,
            laer_ref_id: s.laerRef !== undefined ? laerIdVedIndex[s.laerRef] ?? null : null,
          }).select("id").single();
          if (stegErr) throw new Error(`ovingssteg(${rad.id}/${oi}#${si}): ${stegErr.message}`);

          if (s.feilsvar) {
            const rows = Object.entries(s.feilsvar).map(([nokkelord, forklaring]) => ({
              ovingssteg_id: stegRad.id, nokkelord, forklaring,
            }));
            const { error: feilErr } = await db.from("feilsvar").insert(rows);
            if (feilErr) throw new Error(`feilsvar(${rad.id}/${oi}#${si}): ${feilErr.message}`);
          }
        }
      }

      const testRader = kilde.test.map((t, ti) => ({
        emne_id: emneId, rekkefolge: ti, sporsmal: t.q,
        alternativer: t.alt, riktig_indeks: t.r, forklaring: t.f,
      }));
      const { error: testErr } = await db.from("testsporsmal").insert(testRader);
      if (testErr) throw new Error(`testsporsmal(${rad.id}): ${testErr.message}`);
    }
  }

  console.log("Ferdig.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
