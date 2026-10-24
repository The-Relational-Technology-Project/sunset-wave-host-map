import { describe, expect, it } from "vitest";
import { shouldShowMapCount } from "./map-count";

describe("map count milestone", () => {
  it("hides the number until 20 hosts and reveals it at 20", () => {
    expect(shouldShowMapCount(0)).toBe(false);
    expect(shouldShowMapCount(19)).toBe(false);
    expect(shouldShowMapCount(20)).toBe(true);
    expect(shouldShowMapCount(21)).toBe(true);
  });
});