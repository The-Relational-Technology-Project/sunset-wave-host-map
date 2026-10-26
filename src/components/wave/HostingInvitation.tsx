import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { WaveHand } from "./WaveHand";

export function HostingInvitation({ onHost }: { onHost: () => void }) {
  const { t } = useLang();
  return (
    <div className="mb-12 grid gap-5 rounded-lg border-2 border-ink bg-mustard p-6 shadow-poster sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-8">
      <div className="min-w-0 space-y-3">
        <h3 className="poster-title text-4xl leading-tight text-ink">{t.map.other}</h3>
        <p className="max-w-xl text-base text-ink">{t.map.otherSub}</p>
      </div>
      <Button variant="poster" size="xl" onClick={onHost} className="h-auto min-h-14 whitespace-normal px-5 py-3">
        <WaveHand className="h-7 w-7 shrink-0" />{t.nav.host}
      </Button>
    </div>
  );
}

export function MobileHostAction({ onHost, hidden }: { onHost: () => void; hidden: boolean }) {
  const { t } = useLang();
  if (hidden) return null;
  return (
    <div className="mobile-host-action fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-card px-4 pt-3 md:hidden">
      <Button variant="poster" size="xl" onClick={onHost} className="h-auto min-h-14 w-full whitespace-normal px-4 py-3">
        <WaveHand className="h-7 w-7 shrink-0" />{t.nav.host}
      </Button>
    </div>
  );
}