import { useEffect, useState } from "react";
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
        const p = window.scrollY / (window.innerHeight * 0.35);
        setShown((prev) => Math.max(prev, Math.min(HANDS.length, 1 + Math.floor(p * HANDS.length))));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="grain wave-header relative isolate flex flex-col lg:min-h-0 overflow-hidden bg-mustard">

      <div className="mx-auto flex w-full max-w-7xl justify-end px-4 pt-4 sm:px-6 sm:pt-6">
        <LangSwitch />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pt-4 sm:px-6 sm:pt-6">
        <h1 className="wave-title relative w-fit text-ink" aria-label={t.hero.brand}>
          <span aria-hidden className="poster-title wave-title-the block">{t.hero.the}</span>
          <span aria-hidden className="poster-title wave-title-main block text-coral [text-shadow:4px_4px_0_var(--color-ink)]">{t.hero.sunset}</span>
          <span aria-hidden className="poster-title wave-title-main block [text-shadow:4px_4px_0_var(--color-coral)]"><span className="animate-word-wiggle">{t.hero.wave}</span></span>
          {HANDS.slice(0, shown).map((h, i) => (
            <span key={i} aria-hidden className="pointer-events-none absolute" style={{ top: `${h.top}%`, left: `${h.left}%`, width: `${h.s}%`, rotate: `${h.r}deg` }}>
              <WaveHand className="animate-wave-pop w-full drop-shadow-md" />
            </span>
          ))}
        </h1>

        <div className="mt-auto space-y-5 pb-10 pt-8 sm:pb-12 lg:mt-10">
          <p className="poster-title text-4xl text-ink sm:text-6xl lg:text-7xl">{t.hero.date}</p>
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
