"use client";

export type Uttrykk = "vanlig" | "glad" | "bom";
export type Bevegelse = null | "jubel" | "tenk" | "sukk";

const MUNN: Record<Uttrykk, string> = {
  glad: "M45.2 55.8 Q50 61.6 54.8 55.8",
  bom: "M46.4 59.6 Q50 56.8 53.6 59.6",
  vanlig: "M46.4 57 Q50 60.4 53.6 57",
};
const OYE_R: Record<Uttrykk, number> = { glad: 3.8, bom: 2.7, vanlig: 3.4 };
const KINN_OP: Record<Uttrykk, number> = { glad: 0.75, bom: 0.35, vanlig: 0.5 };

export function Maskot({
  uttrykk = "vanlig",
  bevegelse = null,
  glimtPa = false,
}: {
  uttrykk?: Uttrykk;
  bevegelse?: Bevegelse;
  glimtPa?: boolean;
}) {
  return (
    <svg
      className={"mask" + (bevegelse ? " " + bevegelse : "")}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Peil"
    >
      <g className="mini">
        <path
          d="M50 11 C51.6 18.6 53.4 20.4 61 22 C53.4 23.6 51.6 25.4 50 33 C48.4 25.4 46.6 23.6 39 22 C46.6 20.4 48.4 18.6 50 11 Z"
          fill="#C9963F"
          opacity=".8"
        />
      </g>
      <path
        d="M50 20 C57 41 66 48 87 52 C66 56 57 63 50 84 C43 63 34 56 13 52 C34 48 43 41 50 20 Z"
        fill="#EDBE64"
      />
      <path
        d="M50 30 C54.6 44.6 60 48.8 74.6 52 C60 55.2 54.6 59.4 50 74 C45.4 59.4 40 55.2 25.4 52 C40 48.8 45.4 44.6 50 30 Z"
        fill="#F4D28C"
      />
      <circle cx="39.5" cy="52" r="3.2" fill="#E39272" opacity={KINN_OP[uttrykk]} />
      <circle cx="60.5" cy="52" r="3.2" fill="#E39272" opacity={KINN_OP[uttrykk]} />
      <circle cx="44.8" cy="49" r={OYE_R[uttrykk]} fill="#2F4A52" />
      <circle cx="55.2" cy="49" r={OYE_R[uttrykk]} fill="#2F4A52" />
      <circle cx="46" cy="47.9" r="1.15" fill="#FFFFFF" />
      <circle cx="56.4" cy="47.9" r="1.15" fill="#FFFFFF" />
      <path d={MUNN[uttrykk]} stroke="#2F4A52" strokeWidth="1.9" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="24" r="2.4" fill="#C9963F" className={"glimt" + (glimtPa ? " on" : "")} />
      <circle cx="84" cy="20" r="2.8" fill="#7E8E80" className={"glimt" + (glimtPa ? " on" : "")} />
      <circle cx="87" cy="72" r="2.2" fill="#C9963F" className={"glimt" + (glimtPa ? " on" : "")} />
      <circle cx="13" cy="70" r="2" fill="#7E8E80" className={"glimt" + (glimtPa ? " on" : "")} />
    </svg>
  );
}
