import { describe, expect, it } from "vitest";
import { HOSTING_LOCATIONS, LOCATION_BY_ID, resolveStretch, submissionLocation } from "./hosting-locations";
import { BLOCK_COORDINATES } from "./block-coordinates";
import { validateNoteHost } from "./note-review";

describe("custom hosting locations", () => {
  it("places Renee's Wawona stretch on the actual east-west block", () => {
    expect(submissionLocation("Wawona between 37th and 38th", null)).toBe("ew-13491000");
    expect(LOCATION_BY_ID.get("ew-13491000")?.position).toEqual([37.7365815, -122.4951248]);
  });
  it("preserves existing Avenue IDs with reversed endpoints", () => {
    expect(submissionLocation("24th Avenue between Irving and Lincoln", null)).toBe("24-lincoln");
    expect(LOCATION_BY_ID.get("44-judah")?.position).toEqual(BLOCK_COORDINATES["44-judah"]);
  });
  it("matches coastal stretches", () => expect(submissionLocation("La Playa between Irving and Judah", null)).toBe("la-playa-irving"));
  it("requires confirmation of a precise corner rather than guessing an Avenue", () => {
    expect(submissionLocation("35th and Moraga", null)).toBeNull();
    expect(submissionLocation("35th and Moraga", "corner-27700000")).toBe("corner-27700000");
  });
  it("supports the four languages and Unicode width", () => {
    for (const text of ["Wawona between 37th and 38th", "Wawona entre 37 y 38", "Wawona ３７街 与 ３８街 之间", "Wawona 37街 同 38街 之間"]) expect(submissionLocation(text, null)).toBe("ew-13491000");
  });
  it("leaves multi-block and incomplete descriptions unassigned", () => {
    expect(submissionLocation("Wawona between 37th and 39th", null)).toBeNull();
    expect(submissionLocation("near Wawona", null)).toBeNull();
  });
  it("does not accept streets outside the campaign numbered-avenue bounds", () => {
    expect(resolveStretch("Wawona between 17th and 18th").status).toBe("outside");
    expect(submissionLocation("Wawona between 17th and 18th", null)).toBeNull();
  });
  it("rejects stale selections after stretch changes", () => expect(() => submissionLocation("Wawona between 37th and 38th", "24-lincoln")).toThrow());
  it("keeps existing south-Sloat IDs and unique location IDs", () => {
    expect(LOCATION_BY_ID.has("ss-20th-ave-s-of-sloat-")).toBe(true);
    expect(new Set(HOSTING_LOCATIONS.map((b) => b.id)).size).toBe(HOSTING_LOCATIONS.length);
  });
  it("keeps custom-street notes restricted to hosts at the exact location", () => {
    expect(() => validateNoteHost({ block_id: "ew-13491000", reviewed_host_id: null }, { id: "host", block_id: "37-wawona", contact: "host@example.com" })).toThrow();
  });
});