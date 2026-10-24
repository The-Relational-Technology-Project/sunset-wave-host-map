import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { EmailLink, SimplePage } from "@/components/wave/SimplePage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — The Sunset Wave" },
      { name: "description", content: "How The Sunset Wave handles the information hosts and neighbors share." },
      { property: "og:title", content: "Privacy — The Sunset Wave" },
      { property: "og:description", content: "How The Sunset Wave handles the information hosts and neighbors share." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { t } = useLang();
  return (
    <SimplePage title={t.pages.privacyTitle}>
      <ul className="list-disc space-y-3 pl-5">{t.pages.privacy.map((p) => <li key={p}>{p}</li>)}</ul>
      <p className="pt-4">{t.pages.questions} <EmailLink />.</p>
    </SimplePage>
  );
}
