import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getClaims } from "@/lib/wave.functions";
import { useLang } from "@/lib/i18n";
import { Hero } from "@/components/wave/Hero";
import { BlockMap } from "@/components/wave/BlockMap";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Sunset Wave — 400 neighbor gatherings, March 20, 2027" },
      { name: "description", content: "Host a gathering on your Sunset block on Saturday, March 20, 2027. 400 blocks, one afternoon, hosted by the neighbors." },
      { property: "og:title", content: "The Sunset Wave — Host your block" },
      { property: "og:description", content: "400 neighbor gatherings on the same afternoon in San Francisco's Sunset. Raise your hand to host." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(claimsQuery),
  component: Index,
});

const STEP_PHOTOS = [flyer, chalk, sign, hangout];

function Index() {
  const { t } = useLang();
  const { data } = useSuspenseQuery(claimsQuery);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const claimedCount = Object.keys(data.claimed).length;

  return (
    <div className="overflow-x-clip">
      <Hero hostCount={data.hostCount} onHost={() => setDialog({ mode: "host", block: null })} />

      {/* Invitation */}
      <section className="grain bg-sand">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:items-center md:py-28">
          <div className="space-y-6">
            <h2 className="poster-title text-6xl text-ink sm:text-7xl">{t.invite.title}</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{t.invite.p1}</p>
            <p className="text-lg leading-relaxed text-muted-foreground">{t.invite.p2}</p>
            <p className="font-hand text-3xl text-coral">{t.invite.p3}</p>
          </div>
          <figure className="relative mx-auto w-full max-w-sm rotate-2 rounded-2xl border-2 border-ink bg-card p-3 shadow-poster">
            <img src={aerial.url} alt={t.invite.photoAlt} width={615} height={766} loading="lazy" className="h-auto w-full rounded-lg" />
            <WaveHand className="absolute -left-6 -top-6 h-16 w-16 -rotate-12" />
          </figure>
        </div>
      </section>

      {/* Map */}
      <section id="map" className="grain scroll-mt-4 bg-ocean-deep text-night-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-5 md:py-24">
          <div className="mb-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="min-w-0 space-y-3">
              <h2 className="poster-title text-6xl sm:text-7xl">{t.map.title}</h2>
              <p className="max-w-2xl text-lg opacity-90">{t.map.sub}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-mustard" /> {t.map.open}</span>
              <span className="flex items-center gap-2"><WaveHand className="h-6 w-6" /> {t.map.claimed} · {claimedCount}</span>
            </div>
          </div>
          <BlockMap claimed={data.claimed} onPick={(b) => {
            const names = data.claimed[b.id];
            setDialog({ mode: "block", block: b, names: names ?? [] });
          }} />
          <p className="mt-3 text-sm opacity-70">{t.map.hint}</p>
          <div className="mt-8 grid gap-4 rounded-2xl border-2 border-dashed border-fog/40 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="poster-title text-3xl">{t.map.other}</p>
              <p className="mt-1 opacity-80">{t.map.otherSub}</p>
            </div>
            <Button variant="poster" size="xl" onClick={() => setDialog({ mode: "host", block: null })}>{t.nav.host}</Button>
          </div>
        </div>
      </section>

      {/* How easy */}
      <section className="grain bg-blush/40">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <h2 className="poster-title text-6xl text-ink sm:text-7xl">{t.easy.title}</h2>
          <p className="mt-3 font-hand text-3xl text-ocean-deep">{t.easy.sub}</p>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.easy.steps.map((s, i) => (
              <li key={i} className={`rounded-2xl border-2 border-ink bg-card p-3 shadow-poster ${i % 2 ? "lg:translate-y-8 rotate-1" : "-rotate-1"}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img src={STEP_PHOTOS[i].url} alt={s.t} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-1 p-2 pt-4">
                  <p className="poster-title text-5xl text-coral">{i + 1}</p>
                  <h3 className="text-xl font-bold text-ink">{s.t}</h3>
                  <p className="text-muted-foreground">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-20">
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
          <p className="mt-4 max-w-2xl text-lg opacity-90">{t.gets.sub}</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.gets.items.map((it) => (
              <div key={it.t} className="rounded-2xl border-2 border-ink bg-card p-6 text-ink shadow-poster">
                <p className="font-hand text-xl text-coral">{it.w}</p>
                <h3 className="mt-1 text-xl font-bold">{it.t}</h3>
                <p className="mt-2 text-muted-foreground">{it.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="grain bg-mustard">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <h2 className="poster-title text-6xl text-ink sm:text-7xl">{t.goals.title}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {t.goals.items.map((g) => (
              <div key={g.n} className="border-t-4 border-ink pt-4">
                <p className="poster-title text-[7rem] text-ink [text-shadow:4px_4px_0_var(--color-coral)]">{g.n}</p>
                <p className="text-lg font-semibold text-ink">{g.l}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-lg text-ink">{t.goals.note}</p>
          <div className="mt-12 flex items-center gap-4 rounded-2xl bg-ink p-6 text-sand">
            <WaveHand className="animate-wiggle h-14 w-14 shrink-0" />
            <p className="font-hand text-2xl sm:text-3xl">{t.goals.annual}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="grain bg-sand">
        <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
          <h2 className="poster-title text-6xl text-ink sm:text-7xl">{t.faq.title}</h2>
          <Accordion type="single" collapsible className="mt-8">
            {t.faq.items.map((f, i) => (
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
    </div>
  );
}
