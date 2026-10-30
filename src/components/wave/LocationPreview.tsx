import { useEffect, useRef } from "react";
import { WAVE_SRC } from "./WaveHand";
import type { HostingLocation } from "@/lib/hosting-locations";
import { useLang } from "@/lib/i18n";

export function LocationPreview({ location }: { location: HostingLocation }) {
  const container = useRef<HTMLDivElement>(null);
  const { t } = useLang();
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("leaflet").then((L) => {
      if (disposed || !container.current) return;
      const map = L.map(container.current, { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, keyboard: false }).setView(location.position, 17);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
      L.marker(location.position, { keyboard: false, icon: L.divIcon({ className: "wave-map-marker", iconSize: [34, 34], iconAnchor: [17, 17], html: `<span class="wave-map-dot is-claimed"><img src="${WAVE_SRC}" alt="" /></span>` }) }).addTo(map);
      cleanup = () => map.remove();
    }).catch(() => {});
    return () => { disposed = true; cleanup?.(); };
  }, [location]);
  return <div ref={container} role="img" aria-label={t.location.preview} className="relative isolate h-44 overflow-hidden rounded-lg border border-ink/20 bg-fog" />;
}