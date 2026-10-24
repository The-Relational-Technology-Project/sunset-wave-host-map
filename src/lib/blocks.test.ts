import { describe, expect, it } from "vitest";
import { BLOCKS } from "./blocks";
import { blockLabel } from "./i18n";

describe("blocks", () => {
  it("covers roughly 400 avenue blocks from 19th Ave to 48th, Lincoln to Wawona", () => {
    expect(BLOCKS.length).toBeGreaterThanOrEqual(400);
    expect(BLOCKS.length).toBeLessThanOrEqual(430);
    expect(Math.min(...BLOCKS.map((b) => b.avenue))).toBe(19);
    expect(Math.max(...BLOCKS.map((b) => b.avenue))).toBe(48);
    expect(BLOCKS[0].north).toBe("Lincoln");
    expect(BLOCKS.at(-1)!.south).toBe("Wawona");
  });
  it("has unique ids", () => {
    expect(new Set(BLOCKS.map((b) => b.id)).size).toBe(BLOCKS.length);
  });
  it("labels blocks in plain words", () => {
    expect(blockLabel("en", 44, "Judah", "Kirkham")).toBe("44th Ave between Judah and Kirkham");
  });
});
