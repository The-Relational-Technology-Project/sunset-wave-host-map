import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";
import { WaveHand } from "./WaveHand";
import { Footer } from "./Footer";

export const CONTACT_EMAIL = "oursunsetsocialclub@gmail.com";

export function SimplePage({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="grain flex min-h-screen flex-col bg-sand">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-5">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-hand text-xl text-ink">
          <WaveHand className="h-10 w-10 shrink-0" /> <span className="truncate">{t.footer.back}</span>
        </Link>
        <LangSwitch />
      </div>
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-20 pt-6">
        <h1 className="poster-title text-6xl text-ink sm:text-7xl">{title}</h1>
        <div className="mt-8 space-y-4 text-lg leading-relaxed text-ink/85">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function EmailLink() {
  return <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-coral underline underline-offset-4">{CONTACT_EMAIL}</a>;
}
