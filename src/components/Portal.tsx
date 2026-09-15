"use client";

import { useState } from "react";
import { LogoMerke } from "./Logo";
import { useFremdrift } from "@/lib/fremdrift/store";

const PROVEDAGER = 14;
const SPRAK: Record<string, string> = {
  spansk: "spansk",
  tysk: "tysk",
  fransk: "fransk",
  annet: "et annet språk",
  fordypning: "språklig fordypning",
};

function nesteTrekk() {
  const d = new Date();
  d.setDate(d.getDate() + PROVEDAGER);
  return d;
}
function datoTxt(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}
function gyldigEpost(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

type Steg = "start" | "reg" | "plan" | "bet" | "sender" | "ferdig" | "logg" | "sjekk";

export function Portal({ onFerdig }: { onFerdig: () => void }) {
  const { settKonto } = useFremdrift();
  const [steg, setSteg] = useState<Steg>("start");

  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [elev, setElev] = useState("");
  const [trinn, setTrinn] = useState(8);
  const [sprak, setSprak] = useState("");
  const [samtykke, setSamtykke] = useState(false);
  const [feil, setFeil] = useState<Record<string, boolean>>({});

  const [loggEpost, setLoggEpost] = useState("");
  const [loggFeil, setLoggFeil] = useState(false);

  const [trekkDato, setTrekkDato] = useState(nesteTrekk());
  const [ferdigInfo, setFerdigInfo] = useState<{ navn: string; epost: string; elev: string; trinn: number } | null>(
    null
  );

  function regNeste() {
    const f = {
      navn: !navn.trim(),
      epost: !gyldigEpost(epost),
      elev: !elev.trim(),
    };
    setFeil(f);
    if (!samtykke) {
      alert("Du må samtykke for å opprette konto.");
      return;
    }
    if (f.navn || f.epost || f.elev) return;
    setTrekkDato(nesteTrekk());
    setSteg("plan");
  }

  function betGodkjenn() {
    setSteg("sender");
    setTimeout(() => {
      const d = nesteTrekk();
      settKonto({
        navn: navn.trim(),
        epost: epost.trim(),
        elev: elev.trim(),
        trinn,
        sprak,
        plan: "en",
        bet: "vipps",
        status: "prove",
        trekk: d.toISOString(),
        opprettet: new Date().toISOString(),
      });
      setFerdigInfo({ navn: navn.trim(), epost: epost.trim(), elev: elev.trim(), trinn });
      setTrekkDato(d);
      setSteg("ferdig");
    }, 1700);
  }

  function sendLenke() {
    if (!gyldigEpost(loggEpost)) {
      setLoggFeil(true);
      return;
    }
    setLoggFeil(false);
    setSteg("sjekk");
  }

  function aapneLenke() {
    settKonto({
      navn: "",
      epost: loggEpost.trim(),
      elev: "Eleven",
      trinn: 8,
      sprak: "",
      plan: "en",
      bet: "vipps",
      status: "prove",
      trekk: nesteTrekk().toISOString(),
      opprettet: new Date().toISOString(),
    });
    onFerdig();
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-sand">
      <div className="mx-auto min-h-full max-w-[440px] px-5 pb-16 pt-7">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <LogoMerke className="h-[30px] w-[30px]" />
          <span className="font-display text-[26px] font-bold tracking-tight text-petrol">Peil</span>
        </div>

        {steg === "start" && (
          <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-6">
            <h2 className="mb-1.5 font-display text-2xl font-bold tracking-tight text-petrol">
              Leksehjelp som ikke gir deg svaret
            </h2>
            <p className="mb-5 text-[14.5px] leading-relaxed text-petrol-2">
              Alle teorifagene på ungdomstrinnet, forankret i kompetansemålene fra
              Utdanningsdirektoratet. 199 kr i måneden, ingen bindingstid.
            </p>
            <button
              onClick={() => setSteg("reg")}
              className="block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
            >
              Kom i gang — 14 dager gratis
            </button>
            <button
              onClick={() => setSteg("logg")}
              className="mt-2.5 block w-full rounded-[18px] border-[1.5px] border-linje bg-transparent px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-petrol"
            >
              Jeg har konto
            </button>
            <p className="mt-4 flex gap-2 text-[12.5px] leading-relaxed text-petrol-3">
              Betaling med Vipps. Ingen bindingstid — si opp når som helst.
            </p>
          </div>
        )}

        {steg === "reg" && (
          <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-6">
            <Steg3 aktiv={0} />
            <h2 className="mb-1.5 font-display text-2xl font-bold tracking-tight text-petrol">Opprett konto</h2>
            <p className="mb-5 text-[14.5px] text-petrol-2">
              Kontoen tilhører foresatt. Eleven logger inn på samme konto.
            </p>

            <Felt label="Navnet ditt" feil={feil.navn} feilmelding="Skriv inn navnet ditt.">
              <input
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                placeholder="Fornavn og etternavn"
                className="w-full rounded-[18px] border-[1.5px] border-linje bg-sand px-3.5 py-3 text-base text-petrol outline-none focus:border-petrol"
              />
            </Felt>
            <Felt label="E-post" feil={feil.epost} feilmelding="Skriv inn en gyldig e-postadresse." hjelp="Her får du innloggingslenke og kvittering.">
              <input
                type="email"
                value={epost}
                onChange={(e) => setEpost(e.target.value)}
                placeholder="deg@example.no"
                className="w-full rounded-[18px] border-[1.5px] border-linje bg-sand px-3.5 py-3 text-base text-petrol outline-none focus:border-petrol"
              />
            </Felt>
            <Felt label="Elevens fornavn" feil={feil.elev} feilmelding="Skriv inn elevens fornavn." hjelp="Vi lagrer bare fornavn.">
              <input
                value={elev}
                onChange={(e) => setElev(e.target.value)}
                placeholder="Fornavn"
                className="w-full rounded-[18px] border-[1.5px] border-linje bg-sand px-3.5 py-3 text-base text-petrol outline-none focus:border-petrol"
              />
            </Felt>
            <Felt label="Trinn">
              <select
                value={trinn}
                onChange={(e) => setTrinn(Number(e.target.value))}
                className="w-full rounded-[18px] border-[1.5px] border-linje bg-sand px-3.5 py-3 text-base text-petrol outline-none focus:border-petrol"
              >
                <option value={8}>8. trinn</option>
                <option value={9}>9. trinn</option>
                <option value={10}>10. trinn</option>
              </select>
            </Felt>
            <Felt label="Fremmedspråk på skolen" hjelp="Bestemmer hvilket språk øvingene i fremmedspråk bruker.">
              <select
                value={sprak}
                onChange={(e) => setSprak(e.target.value)}
                className="w-full rounded-[18px] border-[1.5px] border-linje bg-sand px-3.5 py-3 text-base text-petrol outline-none focus:border-petrol"
              >
                <option value="">Velg språk</option>
                <option value="spansk">Spansk</option>
                <option value="tysk">Tysk</option>
                <option value="fransk">Fransk</option>
                <option value="annet">Et annet fremmedspråk</option>
                <option value="fordypning">Språklig fordypning (ikke fremmedspråk)</option>
              </select>
            </Felt>

            <label className="mb-4 flex items-start gap-2.5 rounded-[18px] bg-sand p-3.5 text-[13.5px] leading-relaxed text-petrol-2">
              <input
                type="checkbox"
                checked={samtykke}
                onChange={(e) => setSamtykke(e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-petrol"
              />
              Jeg er foresatt og samtykker til at Peil behandler elevens fornavn, trinn og
              besvarelser. Data lagres i EU og kan slettes når som helst.
            </label>

            <button
              onClick={regNeste}
              className="block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
            >
              Fortsett
            </button>
            <button onClick={() => setSteg("start")} className="mt-4 block w-full text-center text-sm text-petrol-2 underline">
              Tilbake
            </button>
          </div>
        )}

        {steg === "plan" && (
          <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-6">
            <Steg3 aktiv={1} />
            <h2 className="mb-1.5 font-display text-2xl font-bold tracking-tight text-petrol">Abonnement</h2>
            <p className="mb-5 text-[14.5px] text-petrol-2">Ett abonnement, alle teorifag. Ingen bindingstid.</p>

            <div className="mb-2.5 block w-full rounded-[18px] border-2 border-petrol bg-sand p-4 text-left">
              <div className="flex items-baseline justify-between gap-2.5 font-display text-[17px] font-bold text-petrol">
                Peil<span className="text-[19px]">199 kr</span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-petrol-2">
                Per måned. Alle teorifagene på ungdomstrinnet, 8.–10. trinn. Oversikt for
                foresatte og egen stjernehimmel.
              </p>
            </div>

            <div className="my-3.5 rounded-xl border-l-[3px] border-salvie bg-salvie-2 px-3.5 py-3 text-[13.5px] text-[#3B5A4A]">
              De første <b>14 dagene er gratis</b>. Du betaler ingenting i dag. Første trekk skjer{" "}
              <b>{datoTxt(trekkDato)}</b>, og vi varsler deg tre dager før.
            </div>

            <button
              onClick={() => setSteg("bet")}
              className="block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
            >
              Fortsett til betaling
            </button>
            <button onClick={() => setSteg("reg")} className="mt-4 block w-full text-center text-sm text-petrol-2 underline">
              Tilbake
            </button>
          </div>
        )}

        {steg === "bet" && (
          <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-6">
            <Steg3 aktiv={2} />
            <h2 className="mb-1.5 font-display text-2xl font-bold tracking-tight text-petrol">Betaling med Vipps</h2>
            <p className="mb-5 text-[14.5px] text-petrol-2">
              Du godkjenner en fast månedlig avtale i Vipps. Første trekk kommer først når
              gratisperioden er over.
            </p>

            <div className="mb-2.5 flex items-center gap-3.5 rounded-[18px] border-2 border-petrol bg-kort p-4">
              <span className="flex h-[30px] w-11 shrink-0 items-center justify-center rounded-md bg-[#FF5B24] font-display text-xs font-bold text-white">
                Vipps
              </span>
              <span>
                <span className="block font-display text-[15.5px] font-semibold text-petrol">Vipps</span>
                <span className="block text-xs text-petrol-3">Du bekrefter avtalen i Vipps-appen</span>
              </span>
            </div>

            <div className="my-4 rounded-[18px] bg-petrol px-5 py-4.5 text-sand">
              <p className="text-xs uppercase tracking-wide text-[#9DB6BB]">Etter 14 gratisdager</p>
              <p className="my-0.5 font-display text-[42px] font-extrabold leading-tight tracking-tight">
                199 kr<span className="text-lg font-semibold">/mnd</span>
              </p>
              <p className="text-[13px] leading-relaxed text-[#BFD0D3]">
                Trekkes automatisk i Vipps den <b className="text-sand">{datoTxt(trekkDato)}</b>, og
                deretter samme dato hver måned. Ingen bindingstid — stopp når du vil.
              </p>
            </div>

            <div className="mb-4 rounded-[18px] bg-sand p-4">
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-petrol-2">I dag</span>
                <span className="font-display font-semibold">0 kr</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-petrol-2">Fra {datoTxt(trekkDato)}</span>
                <span className="font-display font-semibold">199 kr/mnd</span>
              </div>
              <div className="flex justify-between border-t border-linje pt-2.5 text-base">
                <span className="text-petrol-2">Å betale nå</span>
                <span className="font-display font-semibold">0 kr</span>
              </div>
            </div>

            <button
              onClick={betGodkjenn}
              className="block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
            >
              Godkjenn 199 kr/mnd i Vipps
            </button>
            <p className="mt-4 text-[12.5px] leading-relaxed text-petrol-3">
              Peil ser aldri kortnummeret eller kontoen din. Hele betalingen håndteres av
              Vipps, og du kan når som helst stoppe avtalen der.
            </p>
            <button onClick={() => setSteg("plan")} className="mt-4 block w-full text-center text-sm text-petrol-2 underline">
              Tilbake
            </button>
          </div>
        )}

        {steg === "sender" && (
          <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-9 text-center">
            <div className="mx-auto mb-4 h-[38px] w-[38px] animate-spin rounded-full border-[3px] border-linje border-t-petrol" />
            <p className="text-[15px] text-petrol-2">Sender deg til Vipps …</p>
          </div>
        )}

        {steg === "ferdig" && ferdigInfo && (
          <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-6">
            <h2 className="mb-1.5 font-display text-2xl font-bold tracking-tight text-petrol">Alt klart</h2>
            <p className="mb-5 text-[14.5px] text-petrol-2">
              Hei {ferdigInfo.navn.split(" ")[0] || "der"}. De 14 gratisdagene er i gang, og{" "}
              {ferdigInfo.elev} kan sette i gang med en gang.
            </p>
            <div className="mb-4 rounded-[18px] bg-sand p-4">
              <Kvr k="Konto" v={ferdigInfo.epost} />
              <Kvr k="Elev" v={`${ferdigInfo.elev} · ${ferdigInfo.trinn}. trinn`} />
              <Kvr k="Abonnement" v="Peil · 199 kr/mnd" />
              <Kvr k="Betalingsmåte" v="Vipps" />
              <Kvr k="Første trekk" v={datoTxt(trekkDato)} sum />
            </div>
            <button
              onClick={onFerdig}
              className="block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
            >
              Start med Peil
            </button>
          </div>
        )}

        {steg === "logg" && (
          <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-6">
            <h2 className="mb-1.5 font-display text-2xl font-bold tracking-tight text-petrol">Logg inn</h2>
            <p className="mb-5 text-[14.5px] text-petrol-2">
              Skriv e-posten din, så sender vi deg en innloggingslenke. Ingen passord å huske.
            </p>
            <Felt label="E-post" feil={loggFeil} feilmelding="Skriv inn en gyldig e-postadresse.">
              <input
                type="email"
                value={loggEpost}
                onChange={(e) => setLoggEpost(e.target.value)}
                placeholder="deg@example.no"
                className="w-full rounded-[18px] border-[1.5px] border-linje bg-sand px-3.5 py-3 text-base text-petrol outline-none focus:border-petrol"
              />
            </Felt>
            <button
              onClick={sendLenke}
              className="block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
            >
              Send innloggingslenke
            </button>
            <button onClick={() => setSteg("start")} className="mt-4 block w-full text-center text-sm text-petrol-2 underline">
              Tilbake
            </button>
          </div>
        )}

        {steg === "sjekk" && (
          <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-6">
            <h2 className="mb-1.5 font-display text-2xl font-bold tracking-tight text-petrol">
              Sjekk e-posten din
            </h2>
            <p className="mb-5 text-[14.5px] text-petrol-2">
              Vi har sendt en innloggingslenke til <b>{loggEpost}</b>. Lenken er gyldig i 15
              minutter.
            </p>
            <button
              onClick={aapneLenke}
              className="block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
            >
              Åpne lenken
            </button>
            <p className="mt-4 rounded-xl border-l-[3px] border-gull bg-gull-2 px-3.5 py-2.5 text-[13px] text-[#6E5116]">
              I denne demoversjonen sendes ingen e-post. Knappen over gjør det
              innloggingslenken ville gjort.
            </p>
            <button onClick={() => setSteg("logg")} className="mt-4 block w-full text-center text-sm text-petrol-2 underline">
              Bruk en annen e-post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Steg3({ aktiv }: { aktiv: number }) {
  return (
    <div className="mb-5 flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className={"h-1 flex-1 rounded-full " + (i <= aktiv ? "bg-petrol" : "bg-linje")} />
      ))}
    </div>
  );
}

function Felt({
  label,
  hjelp,
  feil,
  feilmelding,
  children,
}: {
  label: string;
  hjelp?: string;
  feil?: boolean;
  feilmelding?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-[12.5px] font-medium text-petrol-2">{label}</label>
      {children}
      {hjelp && <p className="mt-1 text-xs text-petrol-3">{hjelp}</p>}
      {feil && feilmelding && <p className="mt-1 text-xs text-leire">{feilmelding}</p>}
    </div>
  );
}

function Kvr({ k, v, sum }: { k: string; v: string; sum?: boolean }) {
  return (
    <div className={"flex justify-between gap-3 py-1.5 text-sm " + (sum ? "mt-1.5 border-t border-linje pt-2.5 text-base" : "")}>
      <span className="text-petrol-2">{k}</span>
      <span className="text-right font-display font-semibold">{v}</span>
    </div>
  );
}

export { SPRAK };
