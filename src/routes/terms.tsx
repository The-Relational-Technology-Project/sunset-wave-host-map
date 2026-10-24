import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { EmailLink, SimplePage } from "@/components/wave/SimplePage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — The Sunset Wave" },
      { name: "description", content: "Simple, human terms for using The Sunset Wave site and hosting a block gathering." },
      { property: "og:title", content: "Terms of Use — The Sunset Wave" },
      { property: "og:description", content: "Simple, human terms for using The Sunset Wave site and hosting a block gathering." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  const { t } = useLang();
  return (
    <SimplePage title={t.pages.termsTitle}>
      <ul className="list-disc space-y-3 pl-5">{t.pages.terms.map((p) => <li key={p}>{p}</li>)}</ul>
      <h2 className="poster-title pt-6 text-4xl">{t.pages.careTitle}</h2>
      <p>{t.pages.care}</p>
      <p className="pt-4">{t.pages.questions} <EmailLink />.</p>
    </SimplePage>
  );
}
