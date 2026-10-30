import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { SimplePage } from "@/components/wave/SimplePage";
import { WaveHand } from "@/components/wave/WaveHand";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { WAVE_URL } from "@/lib/share";

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
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(WAVE_URL);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <SimplePage title={t.host.okTitle}>
      <WaveHand className="animate-wave-pop h-28 w-28" />
      <p>{t.host.okBody}</p>
      <section className="space-y-4 border-t border-ink/20 py-6">
        <h2 className="font-bold text-2xl text-ocean">{t.host.shareTitle}</h2>
        <p>{t.host.shareBody}</p>
        <a href={WAVE_URL} className="block break-all font-semibold text-ocean underline underline-offset-4">{WAVE_URL}</a>
        <Button variant="poster" size="xl" onClick={copyUrl}>
          {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          <span aria-live="polite">{copyState === "copied" ? t.host.copiedUrl : t.host.copyUrl}</span>
        </Button>
        {copyState === "error" && <p role="alert" className="text-sm text-destructive">{t.host.copyError}</p>}
      </section>
      <Button asChild variant="posterAlt" size="lg"><Link to="/">{t.footer.back}</Link></Button>
    </SimplePage>
  );
}
