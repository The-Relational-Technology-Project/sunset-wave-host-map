import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { MAP_COLUMNS, COASTAL_STREETS, BLOCKS, STREETS, MAP_ROWS, type Block } from "@/lib/blocks";
import { blockLabel, useLang } from "@/lib/i18n";
import { WAVE_SRC } from "./WaveHand";
import { Button } from "@/components/ui/button";

const CW = 30; // column width
const RH = 42; // row height
const LEFT = 70; // ocean band
const TOP = 100; // park band + rotated coastal labels
const RIGHT = 80; // street labels
const W = LEFT + MAP_COLUMNS.length * CW + RIGHT;
const H = TOP + MAP_ROWS * RH + 30;

const cx = (b: Block) => LEFT + b.col * CW + CW / 2;
const cy = (b: Block) => TOP + b.row * RH + RH / 2;

export function BlockMap({ claimed, onPick }: { claimed: Record<string, string[]>; onPick: (b: Block) => void }) {
  const { t, lang } = useLang();
  const [scale, setScale] = useState(1);

  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-ink bg-card shadow-poster">
      <TransformWrapper
        minScale={1}
        maxScale={5}
        wheel={{ step: 0.08, activationKeys: ["Control", "Meta"] }}
        panning={{ disabled: scale <= 1, velocityDisabled: true }}
        doubleClick={{ disabled: true }}
        onTransform={(_r: unknown, s: { scale: number }) => setScale(s.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
              {[
                { f: () => zoomIn(), I: Plus, l: t.map.zoomIn },
                { f: () => zoomOut(), I: Minus, l: t.map.zoomOut },
                { f: () => resetTransform(), I: RotateCcw, l: t.map.reset },
              ].map(({ f, I, l }) => (
                <Button variant="posterAlt" size="icon" key={l} type="button" onClick={f} aria-label={l} title={l}
                  className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-card text-ink shadow-poster-sm hover:bg-mustard">
                  <I className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <TransformComponent wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
              <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="img" aria-label={t.map.title}>
                <defs>
                  <pattern id="swell" width="24" height="12" patternUnits="userSpaceOnUse">
                    <path d="M0 8 Q6 2 12 8 T24 8" fill="none" stroke="var(--color-ocean)" strokeOpacity="0.25" strokeWidth="1.5" />
                  </pattern>
                </defs>
                {/* ocean */}
                <rect x="0" y="0" width={LEFT - 8} height={H} fill="var(--color-fog)" />
                <rect x="0" y="0" width={LEFT - 8} height={H} fill="url(#swell)" />
                <text x={LEFT / 2 - 4} y={H / 2} fill="var(--color-ocean-deep)" fontSize="12" letterSpacing="0"
                  textAnchor="middle" transform={`rotate(-90 ${LEFT / 2 - 4} ${H / 2})`} className="uppercase">{t.map.ocean}</text>
                {/* park */}
                <rect x={LEFT - 8} y="0" width={W - LEFT + 8} height="30" fill="var(--color-mint)" />
                <text x={LEFT + 10} y="20" fill="var(--color-park)" fontSize="12" letterSpacing="0" className="uppercase">{t.map.park}</text>

                {/* streets */}
                {STREETS.map((s, i) => (
                  <g key={s}>
                    <line x1={LEFT} x2={W - RIGHT + 6} y1={TOP + i * RH} y2={TOP + i * RH} stroke="var(--color-ink)" strokeOpacity="0.18" />
                    <text x={W - RIGHT + 12} y={TOP + i * RH + 4} fill="var(--color-ink)" fontSize="11" className="font-hand">{s}</text>
                  </g>
                ))}
                <text x={LEFT + 2 * CW} y={TOP + (STREETS.length - 1) * RH + 26} fill="var(--color-ink)" fontSize="11" fontWeight="700" className="uppercase">{t.map.southSloat}</text>
                {/* avenues */}
                {MAP_COLUMNS.map((a, col) => {
                  const x = LEFT + col * CW + CW / 2;
                  return (
                    <g key={a}>
                      <line x1={x} x2={x} y1={TOP} y2={TOP + (typeof a === "string" && a === "La Playa" ? 2 : STREETS.length - 1) * RH} stroke="var(--color-ink)" strokeOpacity="0.1" />
                      <text x={x} y={TOP - 8} fill="var(--color-ink)" fontSize="9" textAnchor={typeof a === "string" ? "start" : "middle"}
                        transform={typeof a === "string" ? `rotate(-90 ${x} ${TOP - 8})` : undefined}>{typeof a === "number" ? a : a === "Great Hwy" ? t.map.greatHwy : t.map.laPlaya}</text>
                    </g>
                  );
                })}
                {/* Sunset Blvd between 36th & 37th */}
                <line x1={LEFT + (11.5 + COASTAL_STREETS.length) * CW + CW / 2} x2={LEFT + (11.5 + COASTAL_STREETS.length) * CW + CW / 2} y1={TOP - 22} y2={H - 10} stroke="var(--color-park)" strokeOpacity="0.3" strokeWidth="3" />

                {BLOCKS.map((b) => {
                  const names = claimed[b.id];
                  const label = blockLabel(lang, b.avenue, b.north, b.south);
                  return (
                    <g key={b.id} role="button" tabIndex={0} aria-label={names ? `${label} – ${t.map.claimed}` : `${label} – ${t.map.open}`}
                      onClick={() => onPick(b)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(b))}
                      className="group cursor-pointer outline-none">
                      <circle cx={cx(b)} cy={cy(b)} r={13} fill="transparent" />
                      {names ? (
                        <>
                          <circle cx={cx(b)} cy={cy(b)} r={13} fill="var(--color-claim)" stroke="var(--color-ink)" strokeWidth="1.5" />
                          <image href={WAVE_SRC} x={cx(b) - 10} y={cy(b) - 10} width={20} height={20} />
                        </>
                      ) : (
                        <circle cx={cx(b)} cy={cy(b)} r={6} fill="var(--color-coral)" opacity="0.85"
                          className="transition-all group-hover:opacity-100 group-focus-visible:opacity-100" stroke="var(--color-ink)" strokeWidth="0"
                          style={{ transformOrigin: `${cx(b)}px ${cy(b)}px` }} />
                      )}
                      <circle cx={cx(b)} cy={cy(b)} r={11} fill="none" stroke="var(--color-ink)" strokeWidth="2" className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </g>
                  );
                })}
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
