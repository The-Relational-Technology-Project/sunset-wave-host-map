import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { BLOCKS, type Block } from "@/lib/blocks";
import { BLOCK_COORDINATES } from "@/lib/block-coordinates";
import { blockLabel, useLang } from "@/lib/i18n";
import { WAVE_SRC } from "./WaveHand";
import { Button } from "@/components/ui/button";

const BOUNDS: [[number, number], [number, number]] = [[37.713, -122.5115], [37.766, -122.473]];

export function BlockMap({ claimed, onPick }: { claimed: Record<string, string[]>; onPick: (b: Block) => void }) {
  const { t, lang } = useLang();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<LayerGroup | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    setFailed(false);
    setReady(false);
    void import("leaflet").then((L) => {
      if (disposed || !container.current) return;
      const instance = L.map(container.current, {
        zoomControl: false, scrollWheelZoom: false, minZoom: 12, maxZoom: 19, zoomSnap: 0.25,
        attributionControl: true,
      });
      map.current = instance;
      instance.fitBounds(BOUNDS, { padding: [24, 24] });
      setZoom(instance.getZoom());
      instance.on("zoomend", () => setZoom(instance.getZoom()));
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      });
      tiles.on("tileerror", () => { if (!disposed) setFailed(true); });
      tiles.on("tileload", () => { if (!disposed) setFailed(false); });
      tiles.addTo(instance);
      markers.current = L.layerGroup().addTo(instance);
      resize = new ResizeObserver(() => instance.invalidateSize());
      resize.observe(container.current);
      setReady(true);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => {
      disposed = true;
      resize?.disconnect();
      map.current?.remove();
      map.current = null;
      markers.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    if (!ready) return;
    let disposed = false;
    void import("leaflet").then((L) => {
      const layer = markers.current;
      if (disposed || !layer) return;
      layer.clearLayers();
      for (const b of BLOCKS) {
        const position = BLOCK_COORDINATES[b.id];
        if (!position) continue;
        const names = claimed[b.id];
        const isClaimed = Boolean(names?.length);
        const label = `${blockLabel(lang, b.avenue, b.north, b.south)} – ${isClaimed ? t.map.claimed : t.map.open}`;
        const size = isClaimed ? (zoom < 14 ? 24 : 34) : zoom < 14 ? 6 : zoom < 15 ? 10 : 16;
        const marker = L.marker(position, {
          title: label, alt: label, keyboard: true, riseOnHover: true,
          zIndexOffset: isClaimed ? 1000 : 0,
          icon: L.divIcon({
            className: "wave-map-marker", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
            html: `<span class="wave-map-dot${isClaimed ? " is-claimed" : ""}">${isClaimed ? `<img src="${WAVE_SRC}" alt="" />` : ""}</span>`,
          }),
        });
        marker.on("click", () => pick.current(b));
        marker.addTo(layer);
        marker.getElement()?.addEventListener("keydown", (event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            pick.current(b);
          }
        });
      }
    });
    return () => { disposed = true; };
  }, [ready, claimed, lang, t, zoom]);

  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-ink bg-card shadow-poster">
      <div ref={container} className="wave-tile-map w-full" role="region" aria-label={t.map.title} />
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        {[
          { run: () => map.current?.zoomIn(), Icon: Plus, label: t.map.zoomIn },
          { run: () => map.current?.zoomOut(), Icon: Minus, label: t.map.zoomOut },
          { run: () => map.current?.fitBounds(BOUNDS, { padding: [24, 24] }), Icon: RotateCcw, label: t.map.reset },
        ].map(({ run, Icon, label }) => (
          <Button key={label} type="button" variant="posterAlt" size="icon" onClick={run} aria-label={label} title={label} disabled={!ready}
            className="h-11 w-11 border-2 border-ink bg-card text-ink"><Icon className="h-4 w-4" /></Button>
        ))}
      </div>
      {!ready && !failed && <div className="absolute inset-0 z-10 grid place-items-center bg-fog text-ink">{t.map.loading}</div>}
      {failed && <div className="absolute bottom-8 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink bg-card p-3 text-sm">
        <span>{t.map.unavailable}</span>
        <Button variant="posterAlt" size="sm" onClick={() => setAttempt((v) => v + 1)}>{t.map.retry}</Button>
      </div>}
    </div>
  );
}
