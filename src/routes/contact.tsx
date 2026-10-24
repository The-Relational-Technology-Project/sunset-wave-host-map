import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { EmailLink, SimplePage } from "@/components/wave/SimplePage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — The Sunset Wave" },
      { name: "description", content: "Questions, ideas, or want to help with The Sunset Wave? Say hello." },
      { property: "og:title", content: "Contact — The Sunset Wave" },
      { property: "og:description", content: "Questions, ideas, or want to help with The Sunset Wave? Say hello." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useLang();
  return (
    <SimplePage title={t.pages.contactTitle}>
      <p>{t.pages.contactBody} <EmailLink />.</p>
    </SimplePage>
  );
}
