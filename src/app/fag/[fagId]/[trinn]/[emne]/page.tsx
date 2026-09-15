import { notFound } from "next/navigation";
import { EmneKlient } from "@/components/EmneKlient";
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
      <EmneKlient fagId={fagId} trinn={Number(trinn)} slug={slug} emne={emne} />
    </main>
  );
}
