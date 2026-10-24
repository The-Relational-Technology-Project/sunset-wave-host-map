import { useEffect, useState } from "react";
import poster from "@/assets/sunset-poster.jpg";
import { fill, useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LangSwitch } from "./LangSwitch";
import { WaveHand } from "./WaveHand";

// Positions (in % of the title block) where waving hands pop up, in order.
const HANDS = [
  { top: 2, left: 30, s: 9, r: -12 },
  { top: 30, left: -2, s: 8, r: 10 },
  { top: 22, left: 88, s: 10, r: 18 },
  { top: 56, left: 47, s: 8, r: -8 },
  { top: 4, left: 70, s: 7, r: 24 },
  { top: 84, left: 12, s: 9, r: -20 },
  { top: 62, left: 92, s: 8, r: 6 },
  { top: 40, left: 30, s: 6, r: -4 },
  { top: 88, left: 64, s: 10, r: 14 },
  { top: 46, left: 70, s: 7, r: -16 },
];

export function Hero({ hostCount, onHost }: { hostCount: number; onHost: () => void }) {
  const { t } = useLang();
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(HANDS.length);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const p = window.scrollY / (window.innerHeight * 1.1);
        setShown((prev) => Math.max(prev, Math.min(HANDS.length, 1 + Math.floor(p * HANDS.length))));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-mustard">
      <img src={poster} alt={t.hero.alt} width={1920} height={1088} fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_bottom]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-2/3 bg-gradient-to-b from-sand/70 via-sand/30 to-transparent" />
      <div className="animate-fog pointer-events-none absolute inset-x-[-10%] bottom-[18%] -z-10 h-40 rounded-[50%] bg-fog/50 blur-3xl" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
        <a href="/" className="flex min-w-0 items-center gap-2">
          <WaveHand className="h-12 w-12 shrink-0 drop-shadow sm:h-16 sm:w-16 animate-wiggle" alt="The Sunset Wave" />
          <span className="hidden truncate font-hand text-2xl text-ink sm:inline">thesunsetwave.org</span>
        </a>
        <LangSwitch />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-6 sm:px-6 sm:pt-10">
        <p className="font-hand text-2xl text-ocean-deep sm:text-3xl">{t.hero.kicker} · {t.hero.date}</p>
        <h1 className="relative mt-2 w-fit text-ink" aria-label="The Sunset Wave">
          <span aria-hidden className="poster-title block text-[min(16vw,11vh)]">The</span>
          <span aria-hidden className="poster-title block text-[min(30vw,22vh)] text-coral [text-shadow:4px_4px_0_var(--color-ink)]">Sunset</span>
          <span aria-hidden className="poster-title block text-[min(30vw,22vh)] [text-shadow:4px_4px_0_var(--color-coral)]">Wave</span>
          {HANDS.slice(0, shown).map((h, i) => (
            <span key={i} aria-hidden className="pointer-events-none absolute" style={{ top: `${h.top}%`, left: `${h.left}%`, width: `${h.s}%`, rotate: `${h.r}deg` }}>
              <WaveHand className="animate-wave-pop w-full drop-shadow-md" />
            </span>
          ))}
        </h1>

        <div className="mt-auto space-y-5 pb-10 sm:pb-14">
          <p className="max-w-xl rounded-2xl bg-card/85 p-4 text-xl font-semibold text-ink shadow-poster-sm backdrop-blur sm:text-2xl">{t.hero.tagline}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="poster" size="xl" onClick={onHost}>{t.hero.cta}</Button>
            <Button variant="posterAlt" size="xl" asChild><a href="#map">{t.hero.map}</a></Button>
            {hostCount > 0 && (
              <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-sand">{fill(t.hero.count, { n: hostCount })}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
