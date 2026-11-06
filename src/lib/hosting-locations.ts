import { BLOCKS, type Block } from "./blocks";
import { BLOCK_COORDINATES } from "./block-coordinates";
import streets from "./hosting-streets.json";

export type HostingLocation = Block & { position: [number, number]; kind: "legacy" | "segment" | "corner" | "venue" };
const extras: HostingLocation[] = [...streets.segments, ...streets.corners].map((s) => ({
  id: s.id, avenue: s.street, north: s.from, south: s.to, col: -1, row: -1,
  position: [s.position[0] ?? 0, s.position[1] ?? 0], kind: s.to ? "segment" : "corner",
}));
export const HOSTING_LOCATIONS: HostingLocation[] = [
  ...BLOCKS.flatMap((b): HostingLocation[] => {
    const position = BLOCK_COORDINATES[b.id];
    return position ? [{ ...b, position, kind: "legacy" }] : [];
  }), ...extras,
  // DataSF Lower Great Hwy road nodes, separate from legacy block midpoints.
  { id: "corner-27929000", avenue: "Great Hwy", north: "Noriega", south: "", col: -1, row: -1,
    position: [37.7528302, -122.5084324], kind: "corner" },
  { id: "corner-23504000", avenue: "Great Hwy", north: "Vicente", south: "", col: -1, row: -1,
    position: [37.7379599, -122.5064356], kind: "corner" },
  // Active CNNs 8512001 + 8512002 join at a mid-block node on Lawton–Moraga.
  { id: "segment-8512001-8512002", avenue: "Great Hwy", north: "Lawton", south: "Moraga", col: -1, row: -1,
    position: [37.7556216, -122.5087899], kind: "segment" },
  // SF Public Works CNN 2058000: distinct from the legacy Wawona–Sloat pin.
  { id: "segment-2058000", avenue: 47, north: "Wawona", south: "Cutler", col: -1, row: -1,
    position: [37.7366015, -122.5053296], kind: "segment" },
  // Approved exception: church frontage at 1370 19th Ave, east of the avenue.
  // Keep separate from the existing 19th Avenue block and ordinary matching.
  { id: "venue-19-irving-east", avenue: 19, north: "Irving", south: "Judah", col: -1, row: -1,
    position: [37.762279, -122.476694], kind: "venue" },
];
export const LOCATION_BY_ID = new Map(HOSTING_LOCATIONS.map((b) => [b.id, b]));

export function normalizeStretch(text: string) {
  return text.normalize("NFKC").toLowerCase()
    .replace(/(\d+)\s*(st|nd|rd|th|街|大道)/g, "$1")
    .replace(/([a-z])(?=\d)|(?<=\d)(?=[a-z\u3400-\u9fff])/g, "$1 ")
    .replace(/\b(avenue|ave|street|st|boulevard|blvd|drive|dr|highway|hwy)\b/g, "")
    .replace(/(之间|之間|与|同|和|及)/g, " $1 ")
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ").trim();
}
function contains(text: string, token: string) {
  return (` ${text} `).includes(` ${normalizeStretch(token)} `);
}
export type LocationMatch = { status: "resolved" | "ambiguous" | "unmatched" | "outside"; candidates: HostingLocation[] };
export function resolveStretch(input: string): LocationMatch {
  const text = normalizeStretch(input);
  if (!text) return { status: "unmatched", candidates: [] };
  if (/\b(not|or|maybe|possibly|except|outside)\b|或者|或是|唔係|不是/.test(text)) return { status: "unmatched", candidates: [] };
  const numbers = [...text.matchAll(/\b\d+\b/g)].map((m) => Number(m[0]));
  const legacy = HOSTING_LOCATIONS.filter((b) => b.south_of_sloat && (text === normalizeStretch(String(b.avenue)) || text === normalizeStretch(`${b.avenue} South of Sloat`) || text === normalizeStretch(`${b.avenue} Sloat`)));
  if (legacy.length) return { status: "resolved", candidates: legacy };
  if (numbers.length && /(?:\d+(?:st|nd|rd|th)?\s*(?:ave|avenue|街|大道))|between|entre|之间|之間/i.test(input) && numbers.some((n) => n >= 1 && n <= 99 && (n < 19 || n > 48))) return { status: "outside", candidates: [] };
   const named = ["Lincoln", "Irving", "Judah", "Kirkham", "Lawton", "Moraga", "Noriega", "Ortega", "Pacheco", "Quintara", "Rivera", "Santiago", "Taraval", "Ulloa", "Vicente", "Wawona", "Sloat", "Cutler"].filter((s) => contains(text, s));
  let candidates = HOSTING_LOCATIONS.filter((b) => {
    if (b.kind === "venue") return false;
     if (b.kind === "corner") return named.length === 1 && numbers.length === (b.avenue === "Great Hwy" ? 0 : 1) && contains(text, String(b.avenue)) && contains(text, b.north);
    if (typeof b.avenue === "number") return numbers.length === 1 && named.length === 2 && contains(text, String(b.avenue)) && contains(text, b.north) && contains(text, b.south);
    if (b.south_of_sloat) return false;
    if (b.kind === "segment") return named.length === (b.avenue === "Great Hwy" ? 2 : 1) && numbers.length <= 2 && contains(text, String(b.avenue)) && contains(text, b.north) && contains(text, b.south);
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
    if (!match.candidates.some((c) => c.id === selected)) throw new Error("Location does not match stretch");
    if (match.status === "outside") throw new Error("Location outside campaign coverage");
    return selected;
  }
  return match.status === "resolved" ? match.candidates[0]?.id ?? null : null;
}