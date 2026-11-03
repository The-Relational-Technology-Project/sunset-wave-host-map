import { describe, expect, it } from "vitest";
import { stewardMapNames } from "./steward-map";

describe("private steward map names", () => {
  it("keeps first names of all active hosts on a block", () => {
    expect(stewardMapNames([
      { name: " Ashley Kam ", block_id: "29-irving-judah" },
      { name: "Bonnie Smith", block_id: "29-irving-judah" },
    ])).toEqual({ "29-irving-judah": ["Ashley", "Bonnie"] });
  });
  it("omits merged hosts and hosts without a map location", () => {
    expect(stewardMapNames([
      { name: "Julia Gitis", block_id: null },
      { name: "Old Host", block_id: "block", merged_into: "new-host" },
    ])).toEqual({});
  });
});