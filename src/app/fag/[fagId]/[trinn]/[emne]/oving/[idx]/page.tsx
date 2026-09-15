import { notFound } from "next/navigation";
import { OvingKlient } from "@/components/OvingKlient";
import { hentEmne } from "@/lib/content";

export default async function OvingSide({
  params,
}: {
  params: Promise<{ fagId: string; trinn: string; emne: string; idx: string }>;
}) {
  const { fagId, trinn, emne: slug, idx: idxStr } = await params;
  const emne = hentEmne(slug);
  const idx = Number(idxStr);
  const oving = emne?.ov[idx];
  if (!emne || !oving) notFound();

  const basis = `/fag/${fagId}/${trinn}/${slug}`;
  const nesteFinnes = idx + 1 < emne.ov.length;
  const nesteHref = nesteFinnes ? `${basis}/oving/${idx + 1}` : `${basis}/test`;
  const nesteEtikett = nesteFinnes
    ? "Fortsett til " + emne.ov[idx + 1].t.split("·")[0].trim().toLowerCase()
    : "Ta testen";

  return (
    <OvingKlient
      tittel={oving.t}
      steg={oving.steg}
      laerKort={emne.laer}
      trinnLavt={Number(trinn) <= 8}
      tilbakeHref={basis}
      nesteHref={nesteHref}
      nesteEtikett={nesteEtikett}
    />
  );
}
