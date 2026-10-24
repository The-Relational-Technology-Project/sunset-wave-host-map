import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { SimplePage } from "@/components/wave/SimplePage";
import { WaveHand } from "@/components/wave/WaveHand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/thanks")({
  head: () => ({
    meta: [
      { title: "Thank you for hosting — The Sunset Wave" },
      { name: "description", content: "Thanks for raising your hand to host a Sunset Wave gathering on your block." },
      { property: "og:title", content: "Thank you for hosting — The Sunset Wave" },
      { property: "og:description", content: "Thanks for raising your hand to host a Sunset Wave gathering on your block." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Thanks,
});

function Thanks() {
  const { t } = useLang();
  return (
    <SimplePage title={t.host.okTitle}>
      <WaveHand className="animate-wave-pop h-28 w-28" />
      <p>{t.host.okBody}</p>
      <Button asChild variant="poster" size="xl"><Link to="/">{t.footer.back}</Link></Button>
    </SimplePage>
  );
}
