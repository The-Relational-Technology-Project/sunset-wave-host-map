import { Link } from "@tanstack/react-router";
import ssc from "@/assets/new_SSC_logo.png.asset.json";
import { useLang } from "@/lib/i18n";
import { WaveHand } from "./WaveHand";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="grain bg-night text-night-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[auto_1fr] md:items-center">
        <a href="https://sunsetsocialclub.org" target="_blank" rel="noreferrer" className="block w-36 shrink-0 rounded-xl bg-card p-3 shadow-poster-sm transition-transform hover:-rotate-2">
          <img src={ssc.url} alt="Sunset Social Club" width={1446} height={1280} loading="lazy" className="h-auto w-full" />
        </a>
        <div className="min-w-0 space-y-5">
          <p className="max-w-2xl text-lg leading-relaxed">{t.footer.supported}</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <a href="https://sunsetsocialclub.org" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">sunsetsocialclub.org</a>
            <Link to="/privacy" className="underline-offset-4 hover:underline">{t.footer.privacy}</Link>
            <Link to="/terms" className="underline-offset-4 hover:underline">{t.footer.terms}</Link>
            <Link to="/contact" className="underline-offset-4 hover:underline">{t.footer.contact}</Link>
          </nav>
          <p className="flex items-center gap-2 text-sm opacity-70">
            <WaveHand className="h-5 w-5" /> {t.footer.made}
          </p>
        </div>
      </div>
    </footer>
  );
}
