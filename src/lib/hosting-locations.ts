import { BLOCKS, type Block } from "./blocks";
import { BLOCK_COORDINATES } from "./block-coordinates";
import streets from "./hosting-streets.json";

export type HostingLocation = Block & { position: [number, number]; kind: "legacy" | "segment" | "corner" };
const extras: HostingLocation[] = [...streets.segments, ...streets.corners].map((s) => ({
  id: s.id, avenue: s.street, north: s.from, south: s.to, col: -1, row: -1,
  position: [s.position[0] ?? 0, s.position[1] ?? 0], kind: s.to ? "segment" : "corner",
}));
export const HOSTING_LOCATIONS: HostingLocation[] = [
  ...BLOCKS.flatMap((b): HostingLocation[] => {
    const position = BLOCK_COORDINATES[b.id];
    return position ? [{ ...b, position, kind: "legacy" }] : [];
  }), ...extras,
];
export const LOCATION_BY_ID = new Map(HOSTING_LOCATIONS.map((b) => [b.id, b]));

export function normalizeStretch(text: string) {
  return text.normalize("NFKC").toLowerCase()
    .replace(/(\d+)\s*(st|nd|rd|th|街|大道)/g, "$1")
    .replace(/\b(avenue|ave|street|st|boulevard|blvd|drive|dr|highway|hwy)\b/g, "")
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ").trim();
}
function contains(text: string, token: string) {
  return (` ${text} `).includes(` ${normalizeStretch(token)} `);
}
export type LocationMatch = { status: "resolved" | "ambiguous" | "unmatched" | "outside"; candidates: HostingLocation[] };
export function resolveStretch(input: string): LocationMatch {
  const text = normalizeStretch(input);
  if (!text) return { status: "unmatched", candidates: [] };
  const numbers = [...text.matchAll(/\b\d+\b/g)].map((m) => Number(m[0]));
  if (numbers.some((n) => n >= 1 && n <= 99 && (n < 19 || n > 48))) return { status: "outside", candidates: [] };
  const named = ["Lincoln", "Irving", "Judah", "Kirkham", "Lawton", "Moraga", "Noriega", "Ortega", "Pacheco", "Quintara", "Rivera", "Santiago", "Taraval", "Ulloa", "Vicente", "Wawona", "Sloat"].filter((s) => contains(text, s));
  let candidates = HOSTING_LOCATIONS.filter((b) => {
    if (b.kind === "corner") return named.length === 1 && numbers.length === 1 && contains(text, String(b.avenue)) && contains(text, b.north);
    if (typeof b.avenue === "number") return numbers.length === 1 && named.length === 2 && contains(text, String(b.avenue)) && contains(text, b.north) && contains(text, b.south);
    if (b.south_of_sloat) return normalizeStretch(input) === normalizeStretch(String(b.avenue)) || text === normalizeStretch(`${b.avenue} South of Sloat`);
    if (b.kind === "segment") return named.length === 1 && contains(text, String(b.avenue)) && contains(text, b.north) && contains(text, b.south);
    return named.length === 2 && contains(text, String(b.avenue)) && contains(text, b.north) && contains(text, b.south);
  });
  // A single corner is geographically precise but always needs the host's confirmation.
  if (candidates.some((b) => b.kind === "corner")) return { status: "ambiguous", candidates };
  candidates = candidates.filter((b, i, all) => all.findIndex((x) => x.id === b.id) === i);
  return { status: candidates.length === 1 ? "resolved" : candidates.length ? "ambiguous" : "unmatched", candidates };
}

export function submissionLocation(stretch: string, selected: string | null): string | null {
  const match = resolveStretch(stretch);
  if (selected) {
    const location = LOCATION_BY_ID.get(selected);
    if (!location) throw new Error("Unknown hosting location");
    if (match.candidates.length && !match.candidates.some((c) => c.id === selected)) throw new Error("Location does not match stretch");
    if (match.status === "outside") throw new Error("Location outside campaign coverage");
    return selected;
  }
  return match.status === "resolved" ? match.candidates[0]?.id ?? null : null;
}