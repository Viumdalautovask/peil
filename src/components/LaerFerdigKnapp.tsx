"use client";

import { useRouter } from "next/navigation";
import { useFremdrift } from "@/lib/fremdrift/store";

export function LaerFerdigKnapp({ slug, nesteHref }: { slug: string; nesteHref: string }) {
  const { merkLaerLest } = useFremdrift();
  const router = useRouter();

  return (
    <button
      onClick={() => {
        merkLaerLest(slug);
        router.push(nesteHref);
      }}
      className="mt-3 block w-full rounded-[18px] bg-petrol px-6 py-3.5 text-center font-display text-[16.5px] font-semibold text-sand"
    >
      Jeg har lest — gå til øving
    </button>
  );
}
