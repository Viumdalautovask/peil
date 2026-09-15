"use client";

import { useState } from "react";
import { useFremdrift } from "@/lib/fremdrift/store";
import type { StjerneFro } from "@/lib/fremdrift/types";

function stjernePos(n: number, fro: StjerneFro) {
  const a = ((n * 137.508 + fro.vri) * Math.PI) / 180;
  const r = 24 + Math.sqrt(n + 0.6) * (26 + fro.spenn);
  const st = Math.sin((n + 1) * fro.uro) * 0.5 + Math.sin((n + 1) * fro.uro * 2.7) * 0.3;
  return { x: 160 + Math.cos(a) * r * fro.bred + st * 14, y: 105 + Math.sin(a) * r * fro.hoy + st * 9 };
}

function stjernePath(x: number, y: number) {
  return (
    `M${x} ${y - 11} C${x + 1.6} ${y - 3.4} ${x + 3.4} ${y - 1.6} ${x + 11} ${y} ` +
    `C${x + 3.4} ${y + 1.6} ${x + 1.6} ${y + 3.4} ${x} ${y + 11} ` +
    `C${x - 1.6} ${y + 3.4} ${x - 3.4} ${y + 1.6} ${x - 11} ${y} ` +
    `C${x - 3.4} ${y - 1.6} ${x - 1.6} ${y - 3.4} ${x} ${y - 11} Z`
  );
}

export default function HimmelSide() {
  const { tilstand } = useFremdrift();
  const [valgtIdx, setValgtIdx] = useState<number | null>(null);

  const fro = tilstand.fro ?? { vri: 0, spenn: 0, uro: 1, bred: 1, hoy: 1 };
  const bok = tilstand.bok;
  const posisjoner = bok.map((b, n) => ({ ...stjernePos(n, fro), b, n }));

  const stoev = Array.from({ length: 40 }, (_, k) => ({
    x: (k * 97) % 320,
    y: (k * 61) % 210,
    r: 0.5 + (k % 3) * 0.3,
    o: 0.25 + (k % 4) * 0.1,
  }));

  const linjer: { x1: number; y1: number; x2: number; y2: number }[] = [];
  posisjoner.forEach((p, n) => {
    const treff = posisjoner.find((q, k) => k > n && q.b.f === p.b.f);
    if (treff) linjer.push({ x1: p.x, y1: p.y, x2: treff.x, y2: treff.y });
  });

  const valgt = valgtIdx !== null ? bok[valgtIdx] : null;

  return (
    <main className="mx-auto max-w-[660px] px-4 pb-24 pt-3.5">
      <h1 className="mb-1 font-display text-[26px] font-bold leading-tight tracking-tight text-petrol">
        Himmelen din
      </h1>
      <p className="mb-5 text-[14.5px] text-petrol-2">
        Hver regel du finner ut selv blir en stjerne. Trykk på en for å lese den igjen.
      </p>

      <div className="mb-3.5 overflow-hidden rounded-[26px] bg-[#22383F] p-1">
        {bok.length === 0 ? (
          <div className="px-6 py-11 text-center">
            <p className="text-[14.5px] leading-relaxed text-[#8FA3A7]">
              Himmelen din er tom ennå.
              <br />
              Bestå en test, så tenner du din første stjerne.
            </p>
          </div>
        ) : (
          <svg viewBox="0 0 320 210" role="img" aria-label={`Stjernehimmelen din med ${bok.length} stjerner`} className="block w-full rounded-[22px]">
            {stoev.map((s, k) => (
              <circle key={k} cx={s.x} cy={s.y} r={s.r} fill="#4E6B72" opacity={s.o} />
            ))}
            {linjer.map((l, k) => (
              <line key={k} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#C9963F" strokeWidth="1" opacity=".3" />
            ))}
            {posisjoner.map((p) => (
              <g key={p.n} role="button" tabIndex={0} className="cursor-pointer" onClick={() => setValgtIdx(p.n)}>
                <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                <path
                  d={stjernePath(p.x, p.y)}
                  fill="#F4D28C"
                  style={{ animation: `blink 4s ease-in-out infinite`, animationDelay: `${p.n * 0.4}s` }}
                />
              </g>
            ))}
          </svg>
        )}
      </div>

      {valgt && (
        <div className="mb-3.5 rounded-[18px] border-[1.5px] border-linje border-l-[3px] border-l-gull bg-kort px-[18px] py-4">
          <p className="font-display text-[17px] font-medium leading-snug text-petrol">{valgt.t}</p>
          <p className="mt-1.5 text-xs text-petrol-3">
            {valgt.e} · {valgt.d}
          </p>
        </div>
      )}

      <div className="mb-3.5 flex gap-2.5">
        <div className="flex-1 rounded-[18px] border-[1.5px] border-linje bg-kort p-3.5 text-center">
          <p className="font-display text-[30px] font-bold leading-none tracking-tight text-petrol">
            {bok.length}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-petrol-2">stjerner</p>
        </div>
        <div className="flex-1 rounded-[18px] border-[1.5px] border-linje bg-kort p-3.5 text-center">
          <p className="font-display text-[30px] font-bold leading-none tracking-tight text-petrol">
            {tilstand.lost}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-petrol-2">oppgaver løst selv</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {bok.map((b, k) => (
          <div
            key={k}
            className="rounded-[18px] border-[1.5px] border-linje border-l-[3px] border-l-gull bg-kort px-[18px] py-4"
          >
            <p className="font-display text-[16.5px] font-medium leading-snug text-petrol">{b.t}</p>
            <p className="mt-1 text-xs text-petrol-3">
              {b.e} · {b.d}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
