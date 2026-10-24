// One dot per avenue block: 19th Ave to the ocean, Lincoln to Wawona.
// Approximation of the DataSF block count; parks, schools and the reservoir leave gaps.

export const STREETS = [
  "Lincoln", "Irving", "Judah", "Kirkham", "Lawton", "Moraga", "Noriega", "Ortega",
  "Pacheco", "Quintara", "Rivera", "Santiago", "Taraval", "Ulloa", "Vicente", "Wawona",
] as const;

export const AVENUES = Array.from({ length: 30 }, (_, i) => 19 + i); // 19..48
export const COASTAL_STREETS = ["Great Hwy", "La Playa"] as const;
export const MAP_COLUMNS = [...COASTAL_STREETS, ...[...AVENUES].reverse()];

export type Block = {
  id: string;
  avenue: number | (typeof COASTAL_STREETS)[number];
  north: string;
  south: string;
  col: number; // west to east, including coastal streets
  row: number; // 0 = Lincoln–Irving
};

// [avenue, northStreetIndex] pairs with no residential block
const GAPS: Array<[number, number]> = [];
const gap = (aves: number[], rows: number[]) => aves.forEach((a) => rows.forEach((r) => GAPS.push([a, r])));
gap([24, 25, 26, 27, 28], [7, 8]); // Sunset Reservoir
gap([22, 23, 24], [9, 10]); // Lincoln High School
gap([19, 20, 21], [14]); // Stern Grove edge
gap([28, 29], [4]); // Sunset Playground
gap([19, 20], [13]); // Larsen Park
gap([47, 48], [14]); // Sloat cut-off
gap([29, 30], [8]); // A.P. Giannini

const isGap = (a: number, r: number) => GAPS.some(([ga, gr]) => ga === a && gr === r);

export function ordinal(n: number) {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${s}`;
}

export const BLOCKS: Block[] = (() => {
  const out: Block[] = [];
  for (let r = 0; r < STREETS.length - 1; r++) {
    const north = STREETS[r];
    const south = STREETS[r + 1];
    if (!north || !south) continue;
    // Great Hwy denotes the neighborhood frontage, not the ocean-side park path.
    for (const [col, street] of COASTAL_STREETS.entries()) {
      if (street === "La Playa" && r > 1) continue;
      out.push({ id: `${street === "Great Hwy" ? "great-hwy" : "la-playa"}-${north.toLowerCase()}`, avenue: street, north, south, col, row: r });
    }
    for (const a of AVENUES) {
      if (isGap(a, r)) continue;
      out.push({
        id: `${a}-${north.toLowerCase()}`,
        avenue: a,
        north,
        south,
        col: 48 - a + COASTAL_STREETS.length,
        row: r,
      });
    }
  }
  return out;
})();

export const BLOCK_BY_ID = new Map(BLOCKS.map((b) => [b.id, b]));
