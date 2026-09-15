import { notFound } from "next/navigation";
import { TestKlient } from "@/components/TestKlient";
import { hentEmne } from "@/lib/content";

export default async function TestSide({
  params,
}: {
  params: Promise<{ fagId: string; trinn: string; emne: string }>;
}) {
  const { fagId, trinn, emne: slug } = await params;
  const emne = hentEmne(slug);
  if (!emne) notFound();

  const basis = `/fag/${fagId}/${trinn}/${slug}`;

  return (
    <TestKlient
      emneSlug={slug}
      emneNavn={emne.n}
      fagId={fagId}
      regel={emne.regel}
      tittel={`Test · ${emne.n}`}
      sporsmal={emne.test}
      tilbakeHref={basis}
      ferdigHref={basis}
    />
  );
}
