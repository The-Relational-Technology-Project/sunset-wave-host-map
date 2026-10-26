import { describe, expect, it } from "vitest";
import { BLOCKS, BLOCK_BY_ID, MAP_COLUMNS } from "./blocks";
import { blockLabel } from "./i18n";

describe("blocks", () => {
  it("covers roughly 400 avenue blocks from 19th Ave to 48th, Lincoln to Wawona", () => {
    const avenues = BLOCKS.filter((b) => typeof b.avenue === "number");
    expect(avenues.length).toBeGreaterThanOrEqual(400);
    expect(avenues.length).toBeLessThanOrEqual(450);
    expect(Math.min(...avenues.map((b) => Number(b.avenue)))).toBe(19);
    expect(Math.max(...avenues.map((b) => Number(b.avenue)))).toBe(48);
    expect(avenues[0]?.north).toBe("Lincoln");
    expect(avenues.at(-1)?.south).toBe("Sloat");
  });
  it("extends to D4 below Sloat west of Stern Grove", () => {
    expect(BLOCK_BY_ID.get("40-wawona")).toMatchObject({ north: "Wawona", south: "Sloat" });
    expect(BLOCK_BY_ID.has("25-wawona")).toBe(false);
    expect(BLOCKS.filter((b) => b.south_of_sloat).length).toBeGreaterThanOrEqual(20);
  });
  it("has unique ids", () => {
    expect(new Set(BLOCKS.map((b) => b.id)).size).toBe(BLOCKS.length);
  });
  it("includes Great Hwy as a north–south hosting column", () => {
    expect(MAP_COLUMNS[0]).toBe("Great Hwy");
    expect(BLOCK_BY_ID.get("great-hwy-judah")).toMatchObject({ avenue: "Great Hwy", north: "Judah", south: "Kirkham", col: 0 });
  });
  it("includes La Playa as a north–south hosting column", () => {
    expect(MAP_COLUMNS[1]).toBe("La Playa");
    expect(BLOCK_BY_ID.get("la-playa-lincoln")).toMatchObject({ avenue: "La Playa", north: "Lincoln", south: "Irving", col: 1 });
  });
  it("preserves existing avenue host references", () => {
    expect(BLOCK_BY_ID.get("44-judah")).toMatchObject({ avenue: 44, north: "Judah", south: "Kirkham", col: 6 });
  });
  it("labels blocks in plain words", () => {
    expect(blockLabel("en", 44, "Judah", "Kirkham")).toBe("44th Ave between Judah and Kirkham");
  });
});
