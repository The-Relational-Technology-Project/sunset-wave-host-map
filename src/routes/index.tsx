import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getClaims } from "@/lib/wave.functions";
import { getFaq } from "@/lib/site.functions";
import { useLang } from "@/lib/i18n";
import { shouldShowMapCount } from "@/lib/map-count";
import { Hero } from "@/components/wave/Hero";
import { BlockMap } from "@/components/wave/BlockMap";
import { HostingInvitation, MobileHostAction } from "@/components/wave/HostingInvitation";
import { WaveDialog, type DialogState } from "@/components/wave/WaveDialog";
import { WaveHand } from "@/components/wave/WaveHand";
import { Footer } from "@/components/wave/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import aerial from "@/assets/sunset_aerial.jpg.asset.json";
import flyer from "@/assets/flyer.jpeg.asset.json";
import chalk from "@/assets/chalk.jpeg.asset.json";
import sign from "@/assets/sign.jpeg.asset.json";
import hangout from "@/assets/hangout.jpeg.asset.json";

const claimsQuery = queryOptions({ queryKey: ["claims"], queryFn: () => getClaims(), staleTime: 30_000 });
const faqQuery = queryOptions({ queryKey: ["faq"], queryFn: () => getFaq(), staleTime: 60_000 });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Sunset Wave — 400 neighbor gatherings, March 20, 2027" },
      { name: "description", content: "Host a gathering on your Sunset block on Saturday, March 20, 2027. 400 blocks, hosted by the neighbors." },
       { property: "og:title", content: "The Sunset Wave — Host on your block" },
      { property: "og:description", content: "400 neighbor gatherings on March 20, 2027 in San Francisco's Sunset. Raise your hand to host." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(claimsQuery), context.queryClient.ensureQueryData(faqQuery)]),
  component: Index,
});

const STEP_PHOTOS = [flyer, chalk, sign, hangout];

function Index() {
  const { t, lang } = useLang();
  const { data } = useSuspenseQuery(claimsQuery);
  const { data: faq } = useSuspenseQuery(faqQuery);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const claimedCount = Object.keys(data.claimed).length;

  return (
    <div className="mobile-host-page overflow-x-clip">
      <Hero hostCount={data.hostCount} onHost={() => setDialog({ mode: "host", block: null })} />


      {/* Invitation */}
      <section className="grain bg-sand">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="max-w-3xl space-y-6">
            <h2 className="poster-title text-6xl text-ink sm:text-7xl">{t.invite.title}</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{t.invite.p1}</p>
            <p className="text-lg leading-relaxed text-muted-foreground">{t.invite.p2}</p>
            <p className="font-hand text-3xl text-coral">{t.invite.p3}</p>
          </div>
          <ul className="mt-14 grid grid-cols-2 items-center gap-5 sm:gap-8 md:grid-cols-4">
            {t.easy.steps.map((s, i) => (
              <li key={i} className={`rounded-2xl border-2 border-ink bg-card p-2 shadow-poster sm:p-3 ${["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"][i]}`}>
                <img src={STEP_PHOTOS[i]?.url} alt={s.t} loading="lazy" className="block h-auto w-full rounded-lg" />
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* Map */}
      <section id="map" className="grain scroll-mt-4 bg-mint text-ink">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-5 md:py-24">
          <figure className="relative mx-auto w-full mb-12 max-w-xs -rotate-2 sm:max-w-sm rounded-2xl border-2 border-ink bg-card p-3 shadow-poster">
            <img src={aerial.url} alt={t.invite.photoAlt} width={615} height={766} loading="lazy" className="h-auto w-full rounded-lg" />
            <WaveHand className="absolute -left-6 -top-6 h-16 w-16 -rotate-12" />
          </figure>
          <HostingInvitation onHost={() => setDialog({ mode: "host", block: null })} />
          <div className="mb-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="min-w-0 space-y-3">
              <h2 className="poster-title text-6xl sm:text-7xl">{t.map.title}</h2>
              <p className="max-w-2xl text-lg opacity-90">{t.map.sub}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-coral" /> {t.map.open}</span>
              <span className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full border border-ink bg-claim"><WaveHand className="h-5 w-5" /></span> {t.map.claimed}{shouldShowMapCount(data.hostCount) && <> · {claimedCount}</>}</span>
            </div>
          </div>
          <BlockMap claimed={data.claimed} onPick={(b) => {
            const names = data.claimed[b.id];
            setDialog({ mode: "block", block: b, names: names ?? [] });
          }} />
          <p className="mt-3 text-sm opacity-70">{t.map.blankNote}</p>
        </div>
      </section>

      {/* How easy */}
      <section className="grain bg-blush/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div>
            <h3 className="poster-title text-4xl text-ink">{t.easy.ideasTitle}</h3>
            <ul className="mt-5 flex flex-wrap gap-3">
              {t.easy.ideas.map((idea, i) => (
                <li key={idea} className={`rounded-full border-2 border-ink px-5 py-2 text-lg font-semibold text-ink shadow-poster-sm ${["bg-mustard", "bg-mint", "bg-card", "bg-coral text-primary-foreground", "bg-fog", "bg-blush"][i % 6]}`}>
                  {idea}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What hosts get */}
      <section className="grain bg-park text-night-foreground">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <h2 className="poster-title text-6xl sm:text-7xl">{t.gets.title}</h2>
          <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {t.gets.items.map((it) => (
              <li key={it.t} className="border-t border-night-foreground/30 py-6">
                <h3 className="font-hand text-2xl leading-snug">{it.t}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="grain bg-sand">
        <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
          <h2 className="poster-title text-6xl text-ink sm:text-7xl">{t.faq.title}</h2>
          <Accordion type="single" collapsible className="mt-8">
            {(faq[lang] ?? t.faq.items).map((f, i) => (
              <AccordionItem key={i} value={`f${i}`} className="border-b-2 border-ink/20">
                <AccordionTrigger className="text-left text-lg font-bold text-ink">{f.q}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-14 text-center">
            <Button variant="poster" size="xl" onClick={() => setDialog({ mode: "host", block: null })}>
              <WaveHand className="h-7 w-7" /> {t.nav.host}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WaveDialog state={dialog} setState={setDialog} />
      <MobileHostAction hidden={dialog.mode !== "closed"} onHost={() => setDialog({ mode: "host", block: null })} />
    </div>
  );
}
