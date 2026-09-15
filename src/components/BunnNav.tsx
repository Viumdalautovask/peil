"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFremdrift } from "@/lib/fremdrift/store";

const IKON = {
  velg: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  rute: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 20v-5M6 9V4M18 20v-9M18 6V4" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="8.5" r="2.5" />
    </svg>
  ),
  himmel: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 C12.9 8.4 13.6 9.1 19 10 C13.6 10.9 12.9 11.6 12 17 C11.1 11.6 10.4 10.9 5 10 C10.4 9.1 11.1 8.4 12 3 Z" />
      <path d="M17.5 16 C17.9 18.2 18.1 18.4 20.3 18.8 C18.1 19.2 17.9 19.4 17.5 21.6 C17.1 19.4 16.9 19.2 14.7 18.8 C16.9 18.4 17.1 18.2 17.5 16 Z" />
    </svg>
  ),
  kjor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M5 16v-4l2-5h10l2 5v4" />
      <path d="M5 16h14v3h-3v-3M5 16v3h3v-3" />
      <path d="M8 12h8" />
    </svg>
  ),
  laereplan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  ),
};

export function BunnNav() {
  const pathname = usePathname();
  const { tilstand } = useFremdrift();

  const ruteHref =
    tilstand.fag && tilstand.trinn ? `/fag/${tilstand.fag}/${tilstand.trinn}` : "/";

  const faner: { href: string; label: string; ikon: keyof typeof IKON; aktiv: (p: string) => boolean }[] = [
    { href: "/", label: "Velg", ikon: "velg", aktiv: (p) => p === "/" },
    { href: ruteHref, label: "Ruta", ikon: "rute", aktiv: (p) => p.startsWith("/fag/") },
    { href: "/himmelen", label: "Himmelen", ikon: "himmel", aktiv: (p) => p === "/himmelen" },
    { href: "/kjor", label: "Kjør", ikon: "kjor", aktiv: (p) => p === "/kjor" },
    { href: "/laereplan", label: "Læreplan", ikon: "laereplan", aktiv: (p) => p === "/laereplan" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center gap-0.5 border-t border-linje bg-sand/94 px-2.5 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      {faner.map((f) => {
        const aktiv = f.aktiv(pathname ?? "");
        return (
          <Link
            key={f.label}
            href={f.href}
            className={
              "max-w-[140px] flex-1 rounded-xl px-1 py-1.5 text-center text-[11.5px] " +
              (aktiv ? "bg-sand-2 text-petrol" : "text-petrol-3")
            }
          >
            <span className="mx-auto mb-0.5 block h-[19px] w-[19px]">{IKON[f.ikon]}</span>
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}
