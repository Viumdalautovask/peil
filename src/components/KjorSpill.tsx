"use client";

import { useEffect, useRef, useState } from "react";
import type { FagInfo, SpillSporsmal } from "@/lib/content";
import { useFremdrift } from "@/lib/fremdrift/store";

type Grad = {
  id: string;
  n: string;
  s: string;
  fart: number;
  tid: number;
  liv: number;
  tak: number;
  avstand: number;
  maksBlokk: number;
  minTid: number;
  trinn: number[];
};

const GRADER: Grad[] = [
  { id: "lett", n: "Lett", s: "rolig fart", fart: 2.4, tid: 24, liv: 5, tak: 1.6, avstand: 250, maksBlokk: 1, minTid: 14, trinn: [8] },
  { id: "mid", n: "Middels", s: "vanlig", fart: 3.2, tid: 18, liv: 4, tak: 2.2, avstand: 215, maksBlokk: 2, minTid: 11, trinn: [8, 9] },
  { id: "hard", n: "Tøff", s: "kvikk", fart: 4.2, tid: 14, liv: 3, tak: 2.8, avstand: 185, maksBlokk: 2, minTid: 9, trinn: [9, 10] },
  { id: "brutal", n: "Brutal", s: "to liv", fart: 5.2, tid: 11, liv: 2, tak: 3.4, avstand: 160, maksBlokk: 2, minTid: 7, trinn: [10] },
];
const BANER = 4;

type Blokk = { id: number; bane: number; y: number };
type Fase = "meny" | "kjorer" | "sporsmal" | "jakt" | "slutt-vanlig" | "slutt-arrestert";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}

// Denne og shuffle() over kaller Math.random() — definert utenfor
// komponenten (og bare kalt fra tikk()/svarSpill()/startJakt(), aldri
// fra selve rendringen) slik at de ikke bryter reglene for rene
// render-funksjoner.
function tilfeldigAntall(maks: number) {
  return 1 + Math.floor(Math.random() * maks);
}
function tilfeldigRetning() {
  return Math.random() < 0.5 ? -1 : 1;
}

export function KjorSpill({
  fagListe,
  poolPerFag,
}: {
  fagListe: FagInfo[];
  poolPerFag: Record<string, Record<number, SpillSporsmal[]>>;
}) {
  const { tilstand, settRekord } = useFremdrift();

  const [fase, setFase] = useState<Fase>("meny");
  const [sFag, setSFag] = useState<string | null>(null);
  const [sGrad, setSGrad] = useState<Grad>(GRADER[1]);

  const [liv, setLiv] = useState(0);
  const [poeng, setPoeng] = useState(0);
  const [dist, setDist] = useState(0);
  const [kmt, setKmt] = useState(0);
  const [bane, setBane] = useState(1);
  const [blokker, setBlokker] = useState<Blokk[]>([]);
  const [krasj, setKrasj] = useState(false);
  const [komboKey, setKomboKey] = useState(0);
  const [kombo, setKombo] = useState(0);
  const [gjeldendeSpm, setGjeldendeSpm] = useState<SpillSporsmal | null>(null);
  const [valgtSvar, setValgtSvar] = useState<number | null>(null);
  const [tidsfyllPct, setTidsfyllPct] = useState(100);
  const [tidsfyllTransition, setTidsfyllTransition] = useState("none");
  const [politiPa, setPolitiPa] = useState(false);
  const [politiBunn, setPolitiBunn] = useState(-110);
  const [sluttInfo, setSluttInfo] = useState<{ dist: number; poeng: number; kmt: number; nyRekord: boolean } | null>(
    null
  );

  const veiRef = useRef<HTMLDivElement>(null);
  const [veiBredde, setVeiBredde] = useState(300);
  const [fartVis, setFartVis] = useState(3.2);

  useEffect(() => {
    const el = veiRef.current;
    if (!el) return;
    setVeiBredde(el.clientWidth);
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setVeiBredde(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const st = useRef({
    fart: 3.2,
    grunnfart: 3.2,
    sidenSist: 0,
    pool: [] as SpillSporsmal[],
    jakt: false,
    kjorer: false,
    bilBunn: 130,
    loopId: 0 as ReturnType<typeof setInterval> | 0,
    tidId: 0 as ReturnType<typeof setTimeout> | 0,
    blokkTeller: 0,
    dist: 0,
    liv: 0,
    poeng: 0,
    bane: 1,
    sSpm: null as SpillSporsmal | null,
    blokker: [] as Blokk[],
  });

  useEffect(() => {
    // Vi vil bevisst lese st.current sine NYESTE timer-id-er ved
    // avmontering (ikke en fastfrosset kopi), så vi rydder riktig
    // uansett hvor i spillet brukeren forlater siden.
    return () => {
      if (st.current.loopId) clearInterval(st.current.loopId);
      if (st.current.tidId) clearTimeout(st.current.tidId);
    };
  }, []);

  function baneX(n: number, bredde: number = veiBredde) {
    return (bredde / BANER) * n + (bredde / BANER - 42) / 2;
  }

  function byggPool(fagId: string, grad: Grad): SpillSporsmal[] {
    const pooler = poolPerFag[fagId] ?? {};
    let alle = grad.trinn.flatMap((t) => pooler[t] ?? []);
    if (!alle.length) alle = [8, 9, 10].flatMap((t) => pooler[t] ?? []);
    return shuffle(alle);
  }

  function startSpill() {
    if (!sFag) return;
    const pool = byggPool(sFag, sGrad);
    if (!pool.length) {
      alert("Det er ingen ferdige emner i dette faget ennå.");
      return;
    }
    st.current.pool = pool;
    st.current.fart = sGrad.fart;
    st.current.grunnfart = sGrad.fart;
    st.current.sidenSist = 999;
    st.current.jakt = false;
    st.current.bilBunn = 130;
    st.current.dist = 0;
    st.current.liv = sGrad.liv;
    st.current.poeng = 0;
    st.current.bane = 1;
    setDist(0);
    setLiv(sGrad.liv);
    setPoeng(0);
    setBane(1);
    st.current.blokker = []; setBlokker([]);
    setKombo(0);
    setPolitiPa(false);
    setPolitiBunn(-110);
    setGjeldendeSpm(null);
    setFase("kjorer");
    st.current.kjorer = true;
    if (st.current.loopId) clearInterval(st.current.loopId);
    st.current.loopId = setInterval(tikk, 26);
  }

  function nyRad() {
    const antall = tilfeldigAntall(sGrad.maksBlokk);
    const ledige = shuffle([0, 1, 2, 3]).slice(0, Math.min(antall, BANER - 1));
    st.current.blokker = [
      ...st.current.blokker,
      ...ledige.map((bn) => ({ id: st.current.blokkTeller++, bane: bn, y: -50 })),
    ];
  }

  function tikk() {
    if (!st.current.kjorer) return;
    st.current.dist += st.current.fart * 0.42;
    st.current.fart = st.current.grunnfart + Math.min(sGrad.tak, st.current.dist / 2600);

    if (!st.current.jakt && st.current.dist >= 10000) {
      startJakt();
      return;
    }

    st.current.sidenSist += st.current.fart;
    if (st.current.sidenSist >= sGrad.avstand) {
      nyRad();
      st.current.sidenSist = 0;
    }

    const h = veiRef.current?.clientHeight ?? 400;
    const bilTopp = h - st.current.bilBunn - 70;
    const bilBunn = h - st.current.bilBunn;

    const nye: Blokk[] = [];
    let truffet = false;
    for (const b of st.current.blokker) {
      const ny = { ...b, y: b.y + st.current.fart };
      const nede = ny.y + 44;
      if (!truffet && nede >= bilTopp && ny.y <= bilBunn && ny.bane === st.current.bane) {
        truffet = true; // ikke behold denne blokken — utløser spørsmål under
      } else if (ny.y > h + 10) {
        setKombo((k) => k + 1);
        setKomboKey((k) => k + 1);
      } else {
        nye.push(ny);
      }
    }
    st.current.blokker = nye;
    setBlokker(nye);
    setDist(st.current.dist);
    setKmt(Math.round(st.current.fart * 17));
    setFartVis(st.current.fart);

    if (truffet) stillSporsmal();
  }

  function stillSporsmal() {
    st.current.kjorer = false;
    if (st.current.loopId) clearInterval(st.current.loopId);
    if (!st.current.pool.length) st.current.pool = byggPool(sFag!, sGrad);
    const spm = st.current.pool.pop() ?? null;
    st.current.sSpm = spm;
    setGjeldendeSpm(spm);
    setValgtSvar(null);
    setFase("sporsmal");

    const t = Math.max(sGrad.minTid, sGrad.tid - Math.floor(st.current.dist / 1400));
    setTidsfyllTransition("none");
    setTidsfyllPct(100);
    setTimeout(() => {
      setTidsfyllTransition(`width ${t}s linear`);
      setTidsfyllPct(0);
    }, 40);
    if (st.current.tidId) clearTimeout(st.current.tidId);
    st.current.tidId = setTimeout(() => svarSpill(-1), t * 1000);
  }

  function svarSpill(n: number) {
    if (st.current.tidId) clearTimeout(st.current.tidId);
    const spm = st.current.sSpm;
    if (!spm) return;
    setValgtSvar(n);
    const riktig = n === spm.spm.r;
    if (riktig) {
      st.current.poeng++;
      setPoeng(st.current.poeng);
      setKombo((k) => k + 1);
      setKomboKey((k) => k + 1);
      st.current.grunnfart += 0.07;
    } else {
      st.current.liv--;
      setLiv(st.current.liv);
      setKombo(0);
      st.current.grunnfart = Math.max(sGrad.fart, st.current.grunnfart - 0.25);
      setKrasj(true);
      setTimeout(() => setKrasj(false), 560);
    }

    setTimeout(
      () => {
        setGjeldendeSpm(null);
        if (st.current.liv <= 0) {
          spillSlutt();
          return;
        }
        if (st.current.dist >= 10000) {
          startJakt();
          return;
        }
        setFase("kjorer");
        st.current.kjorer = true;
        if (st.current.loopId) clearInterval(st.current.loopId);
        st.current.loopId = setInterval(tikk, 26);
      },
      riktig ? 700 : 1700
    );
  }

  function styr(d: number) {
    if (!st.current.kjorer) return;
    const ny = st.current.bane + d;
    if (ny < 0 || ny > BANER - 1) return;
    st.current.bane = ny;
    setBane(ny);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") styr(-1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") styr(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function lagreRekordHvisNy() {
    if (!sFag) return;
    const nokkel = `${sFag}-${sGrad.id}`;
    const gammel = tilstand.rekord[nokkel] ?? 0;
    const ny = Math.round(st.current.dist);
    const nyRekord = ny > gammel;
    if (nyRekord) settRekord(nokkel, ny);
    return { dist: ny, nyRekord, gammel };
  }

  function spillSlutt() {
    st.current.kjorer = false;
    if (st.current.loopId) clearInterval(st.current.loopId);
    st.current.blokker = []; setBlokker([]);
    setPolitiBunn(-110);
    const r = lagreRekordHvisNy();
    setSluttInfo({ dist: r?.dist ?? 0, poeng: st.current.poeng, kmt, nyRekord: !!r?.nyRekord });
    setFase("slutt-vanlig");
  }

  function startJakt() {
    st.current.jakt = true;
    st.current.kjorer = false;
    if (st.current.loopId) clearInterval(st.current.loopId);
    st.current.blokker = []; setBlokker([]);
    setFase("jakt");
    setPolitiPa(true);
    setPolitiBunn(90);

    let flykt = 0;
    const jag = setInterval(() => {
      flykt++;
      st.current.bane = (st.current.bane + tilfeldigRetning() + BANER) % BANER;
      setBane(st.current.bane);
      if (flykt >= 4) {
        clearInterval(jag);
        setTimeout(arrestert, 900);
      }
    }, 900);
  }

  function arrestert() {
    setKrasj(true);
    const r = lagreRekordHvisNy();
    setSluttInfo({ dist: r?.dist ?? 0, poeng: st.current.poeng, kmt, nyRekord: false });
    setFase("slutt-arrestert");
  }

  function nullstillSpill() {
    setPolitiPa(false);
    setPolitiBunn(-110);
    setKrasj(false);
    setFase("meny");
  }

  const fagNavn = fagListe.find((f) => f.id === sFag)?.navn ?? "faget";
  const rekordNokkel = sFag ? `${sFag}-${sGrad.id}` : "";
  const rekord = tilstand.rekord[rekordNokkel] ?? 0;

  if (fase === "meny") {
    return (
      <div>
        <h2 className="mt-6 mb-2.5 font-display text-[17px] font-semibold tracking-tight text-petrol-2">
          Fag
        </h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {fagListe.map((f) => (
            <button
              key={f.id}
              onClick={() => setSFag(f.id)}
              className={
                "rounded-[18px] border-[1.5px] bg-kort p-3.5 text-left " +
                (sFag === f.id ? "border-petrol bg-sand-2" : "border-linje")
              }
            >
              <span className="mb-2.5 block h-2 w-2 rounded-full" style={{ background: f.farge }} />
              <span className="block font-display text-[15.5px] font-semibold leading-tight text-petrol">
                {f.navn}
              </span>
              <span className="block text-xs text-petrol-3">{f.status}</span>
            </button>
          ))}
        </div>

        <h2 className="mt-6 mb-2.5 font-display text-[17px] font-semibold tracking-tight text-petrol-2">
          Vanskegrad
        </h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {GRADER.map((g) => (
            <button
              key={g.id}
              onClick={() => setSGrad(g)}
              className={
                "rounded-[18px] border-[1.5px] bg-kort p-3.5 text-center font-display text-base font-semibold " +
                (sGrad.id === g.id ? "border-petrol bg-petrol text-sand" : "border-linje text-petrol")
              }
            >
              {g.n}
              <small className={"block font-body text-[11.5px] font-normal " + (sGrad.id === g.id ? "text-petrol-3" : "text-petrol-3")}>
                {g.s}
              </small>
            </button>
          ))}
        </div>

        {sFag && rekord > 0 && (
          <p className="mt-3 text-[13.5px] text-petrol-2">Rekorden din: {rekord} m</p>
        )}

        <p className="mt-4 rounded-xl border-l-[3px] border-gull bg-gull-2 px-3.5 py-2.5 text-[13.5px] text-[#6E5116]">
          Kjøreturen påvirker ikke himmelen din. Stjerner får du bare ved å bestå en ordentlig test.
        </p>
        <button
          onClick={startSpill}
          className="mt-4 block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
        >
          Start kjøreturen
        </button>
      </div>
    );
  }

  if (fase === "slutt-vanlig" && sluttInfo) {
    return (
      <div className="rounded-[26px] border-[1.5px] border-linje bg-kort px-[22px] py-6 text-center">
        <p className="font-display text-[46px] font-bold leading-none tracking-tight text-gull">
          {sluttInfo.dist} m
        </p>
        <p className="my-1.5 text-[14.5px] text-petrol-2">
          {sluttInfo.poeng} riktige svar · {sGrad.n} ·{" "}
          {sluttInfo.nyRekord ? "Ny rekord!" : `Rekorden din er ${rekord} m`}
        </p>
        <button
          onClick={nullstillSpill}
          className="mt-3 block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
        >
          Kjør en gang til
        </button>
      </div>
    );
  }

  if (fase === "slutt-arrestert" && sluttInfo) {
    return (
      <div className="rounded-[26px] bg-[#22383F] px-6 py-[30px] text-center text-sand">
        <p className="mb-2 font-display text-[30px] font-extrabold leading-tight tracking-tight">
          Arrestert
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-[#B9C9CC]">
          Du passerte 10 000 meter uten å bomme nok. Politiet mistenker at du er for god i{" "}
          {fagNavn.toLowerCase()}.
        </p>
        <div className="mb-4.5 rounded-[18px] bg-white/[0.08] p-4 text-left">
          <div className="flex justify-between gap-3 py-1.5 text-sm text-[#B9C9CC]">
            <span>Siktelse</span>
            <b className="font-display font-semibold text-sand">Grov kompetanse i {fagNavn.toLowerCase()}</b>
          </div>
          <div className="flex justify-between gap-3 py-1.5 text-sm text-[#B9C9CC]">
            <span>Avstand</span>
            <b className="font-display font-semibold text-sand">{sluttInfo.dist} m</b>
          </div>
          <div className="flex justify-between gap-3 py-1.5 text-sm text-[#B9C9CC]">
            <span>Riktige svar</span>
            <b className="font-display font-semibold text-sand">{sluttInfo.poeng}</b>
          </div>
          <div className="flex justify-between gap-3 py-1.5 text-sm text-[#B9C9CC]">
            <span>Vanskegrad</span>
            <b className="font-display font-semibold text-sand">{sGrad.n}</b>
          </div>
        </div>
        <button
          onClick={nullstillSpill}
          className="block w-full rounded-[18px] bg-sand px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-petrol"
        >
          Rømme fra fengselet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2.5 flex justify-between gap-2 text-[13.5px] text-petrol-2">
        <span>
          ♦<span className="ml-1 font-display font-bold text-leire">{"♦".repeat(Math.max(0, liv))}</span>
        </span>
        <span>
          Avstand <b className="font-display text-petrol">{Math.round(dist)}</b> m
        </span>
        <span>
          Riktige <b className="font-display text-petrol">{poeng}</b>
        </span>
        <span>
          <b className="font-display text-petrol">{kmt}</b> km/t
        </span>
      </div>

      <div ref={veiRef} className={"vei-bane" + (fase !== "kjorer" ? " pause" : "")}>
        <div className="vei-kant" style={{ left: 0, animationDuration: `${Math.max(0.16, 0.9 / Math.max(0.6, fartVis))}s` }} />
        <div className="vei-stripe" style={{ left: `${(1 / BANER) * 100}%`, animationDuration: `${Math.max(0.16, 0.9 / Math.max(0.6, fartVis))}s` }} />
        <div className="vei-stripe" style={{ left: `${(2 / BANER) * 100}%`, animationDuration: `${Math.max(0.16, 0.9 / Math.max(0.6, fartVis))}s` }} />
        <div className="vei-stripe" style={{ left: `${(3 / BANER) * 100}%`, animationDuration: `${Math.max(0.16, 0.9 / Math.max(0.6, fartVis))}s` }} />
        <div className="vei-kant" style={{ right: 0, animationDuration: `${Math.max(0.16, 0.9 / Math.max(0.6, fartVis))}s` }} />

        {politiPa && (
          <>
            <div className="vei-sirene" />
            <div className="vei-politi" style={{ left: baneX(bane), bottom: politiBunn }}>
              <svg viewBox="0 0 60 100" aria-label="politibil">
                <rect x="9" y="16" width="42" height="72" rx="13" fill="#F2F2F0" />
                <rect x="9" y="40" width="42" height="20" fill="#2F4A52" />
                <rect x="14" y="24" width="32" height="18" rx="7" fill="#22383F" />
                <rect x="18" y="10" width="24" height="7" rx="3.5" className="vei-blaalys" fill="#3B7BE0" />
              </svg>
            </div>
          </>
        )}

        {blokker.map((b) => (
          <div key={b.id} className="vei-blokk" style={{ left: baneX(b.bane) - 5, top: b.y }}>
            ?
          </div>
        ))}

        {komboKey > 0 && kombo >= 3 && (
          <div key={komboKey} className="vei-kombo">
            × {kombo}
          </div>
        )}

        <div className={"vei-bil" + (krasj ? " krasj" : "")} style={{ left: baneX(bane) }}>
          <svg viewBox="0 0 60 100" aria-label="bil">
            <rect x="9" y="16" width="42" height="72" rx="13" fill="#C9963F" />
            <rect x="14" y="24" width="32" height="18" rx="7" fill="#22383F" />
            <rect x="14" y="60" width="32" height="15" rx="6" fill="#22383F" opacity=".7" />
            <circle cx="20" cy="21" r="3.2" fill="#FFF6E0" />
            <circle cx="40" cy="21" r="3.2" fill="#FFF6E0" />
          </svg>
        </div>
      </div>

      <p className="mt-2.5 text-center text-xs text-petrol-3">
        Piltaster eller A og D — eller trykk på venstre og høyre side av veien.
      </p>
      <div className="mt-1 flex gap-2.5">
        <button
          onClick={() => styr(-1)}
          className="flex-1 rounded-[18px] border-[1.5px] border-linje bg-kort py-2.5 font-display text-sm font-semibold text-petrol"
        >
          ← Venstre
        </button>
        <button
          onClick={() => styr(1)}
          className="flex-1 rounded-[18px] border-[1.5px] border-linje bg-kort py-2.5 font-display text-sm font-semibold text-petrol"
        >
          Høyre →
        </button>
      </div>

      {fase === "sporsmal" && gjeldendeSpm && (
        <div className="mt-3.5 rounded-[26px] border-[1.5px] border-linje bg-kort p-5">
          <p className="mb-1.5 text-[11.5px] uppercase tracking-wide text-petrol-3">
            {gjeldendeSpm.emneEtikett}
          </p>
          <p className="mb-3.5 font-display text-[18.5px] font-semibold leading-snug text-petrol">
            {gjeldendeSpm.spm.q}
          </p>
          <div>
            {gjeldendeSpm.spm.alt.map((a, n) => {
              const erValgt = valgtSvar === n;
              const erRiktig = n === gjeldendeSpm.spm.r;
              let stil = "border-linje bg-sand text-petrol";
              if (valgtSvar !== null && erRiktig) stil = "border-salvie bg-salvie-2 text-[#2E4A3C]";
              else if (valgtSvar !== null && erValgt) stil = "border-leire bg-leire-2 text-[#7A3F2C]";
              return (
                <button
                  key={n}
                  disabled={valgtSvar !== null}
                  onClick={() => svarSpill(n)}
                  className={"mb-2 block w-full rounded-[18px] border-[1.5px] px-4 py-3 text-left font-display text-[15.5px] font-medium disabled:cursor-default " + stil}
                >
                  {a}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-linje">
            <span
              className="block h-full bg-gull"
              style={{ width: `${tidsfyllPct}%`, transition: tidsfyllTransition }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
