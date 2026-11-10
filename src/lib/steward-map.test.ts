import { describe, expect, it } from "vitest";
import { stewardMapNames } from "./steward-map";

describe("private steward map names", () => {
  it("keeps first names of all active hosts on a block", () => {
    expect(stewardMapNames([
      { name: " Alex Example ", block_id: "example-block" },
      { name: "Casey Sample", block_id: "example-block" },
    ])).toEqual({ "example-block": ["Alex", "Casey"] });
  });
  it("omits merged hosts and hosts without a map location", () => {
    expect(stewardMapNames([
      { name: "Taylor Example", block_id: null },
      { name: "Old Host", block_id: "block", merged_into: "new-host" },
    ])).toEqual({});
  });
});