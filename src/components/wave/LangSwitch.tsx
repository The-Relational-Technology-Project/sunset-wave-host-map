import { LANGS, useLang } from "@/lib/i18n";

export function LangSwitch() {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t.nav.lang} className="flex rounded-full border-2 border-ink bg-card p-0.5 shadow-poster-sm">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.html}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`rounded-full px-2 py-1 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
            lang === l.code ? "bg-ink text-sand" : "text-ink hover:bg-mustard"
          }`}
        >
          {l.code === "en" ? "EN" : l.code === "es" ? "ES" : l.label}
        </button>
      ))}
    </div>
  );
}
