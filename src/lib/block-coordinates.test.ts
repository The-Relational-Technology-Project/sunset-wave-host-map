import { describe, expect, it } from "vitest";
import { BLOCK_COORDINATES } from "./block-coordinates";
import { BLOCK_BY_ID, SOUTH_SLOAT } from "./blocks";

describe("street-map block positions", () => {
  it("keeps existing host references attached to their geographic block", () => {
    expect(BLOCK_BY_ID.get("44-judah")?.avenue).toBe(44);
    expect(BLOCK_COORDINATES["44-judah"]).toEqual([37.7605946, -122.5037835]);
  });
  it("places every south-of-Sloat hosting street below Sloat rather than in a grid", () => {
    for (const name of SOUTH_SLOAT) {
      const block = [...BLOCK_BY_ID.values()].find((b) => b.avenue === name);
      expect(block).toBeDefined();
      const position = block ? BLOCK_COORDINATES[block.id] : undefined;
      expect(position).toBeDefined();
      expect(position?.[0]).toBeLessThan(37.7352);
      expect(position?.[0]).toBeGreaterThan(37.709);
    }
  });
});