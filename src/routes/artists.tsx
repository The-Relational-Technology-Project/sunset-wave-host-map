import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { SimplePage } from "@/components/wave/SimplePage";
import { ArtistForm } from "@/components/wave/ArtistForm";

export const Route = createFileRoute("/artists")({
  head: () => ({ meta: [
    { title: "Calling local artists — The Sunset Wave" },
    { name: "description", content: "Help draw or design The Sunset Wave logo for neighborhood gathering flyers and possible future Wave swag. Local artists, raise your hand." },
    { property: "og:title", content: "Calling local artists — The Sunset Wave" },
    { property: "og:description", content: "Help draw or design The Sunset Wave logo. Share your interest and optional work examples with the Sunset Social Club." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Artists,
});

function Artists() {
  const { t } = useLang();
  return <SimplePage titleClassName="text-4xl leading-tight md:whitespace-nowrap md:text-5xl" title={
    <><span className="block md:inline">{t.artists.titleLead}</span>{" "}<span className="block md:inline">{t.artists.titleRest}</span></>
  }>
    <p className="font-semibold text-ocean">{t.artists.intro}</p>
    <p>{t.artists.body}</p>
    <ArtistForm />
  </SimplePage>;
}