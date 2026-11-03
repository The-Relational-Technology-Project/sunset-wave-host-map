import { describe, expect, it } from "vitest";
import { HOSTING_LOCATIONS, LOCATION_BY_ID, resolveStretch, submissionLocation } from "./hosting-locations";
import { BLOCK_COORDINATES } from "./block-coordinates";
import { validateNoteHost } from "./note-review";
import streetCatalog from "./hosting-streets.json";

describe("custom hosting locations", () => {
  it("places Pamela's approved church east of 19th between Irving and Judah without moving the existing block", () => {
    const church = LOCATION_BY_ID.get("venue-19-irving-east");
    expect(church?.position).toEqual([37.762279, -122.476694]);
    expect(church?.avenue).toBe(19);
    expect(church?.north).toBe("Irving");
    expect(church?.south).toBe("Judah");
    expect(church?.kind).toBe("venue");
    expect(church?.position[1]).toBeGreaterThan(BLOCK_COORDINATES["19-irving"]?.[1] ?? 0);
    expect(LOCATION_BY_ID.get("19-irving")?.position).toEqual(BLOCK_COORDINATES["19-irving"]);
  });
  it("keeps the approved church exception out of general stretch matching", () => {
    expect(submissionLocation("19th Ave between Irving and Judah", null)).toBe("19-irving");
    expect(submissionLocation("Wawona between 17th and 18th", null)).toBeNull();
  });
  it("makes the clarified 2670 47th Ave stretch assignable without moving the legacy pin", () => {
    expect(submissionLocation("47th Ave between Wawona and Cutler", null)).toBe("segment-2058000");
    expect(submissionLocation("47th Ave between Cutler and Wawona", null)).toBe("segment-2058000");
    expect(LOCATION_BY_ID.get("segment-2058000")?.position).toEqual([37.7366015, -122.5053296]);
    expect(LOCATION_BY_ID.get("47-wawona")?.position).toEqual([37.7358052, -122.505277]);
    expect(submissionLocation("2670 47th Ave", null)).toBeNull();
  });
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
    for (const text of ["Wawona between 37th and 38th", "Wawona entre 37 y 38", "Wawona ３７街 与 ３８街 之间", "Wawona 37街 同 38街 之間", "Wawona37街与38街之间"]) expect(submissionLocation(text, null)).toBe("ew-13491000");
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
  it("rejects arbitrary selections for descriptions that do not match", () => expect(() => submissionLocation("3 blocks east ;)", "24-lincoln")).toThrow());
  it("leaves conflicting and uncertain prose for review", () => expect(submissionLocation("Maybe Wawona between 37th and 38th", null)).toBeNull());
  it("keeps existing south-Sloat IDs and unique location IDs", () => {
    expect(LOCATION_BY_ID.has("ss-20th-ave-s-of-sloat-")).toBe(true);
    expect(new Set(HOSTING_LOCATIONS.map((b) => b.id)).size).toBe(HOSTING_LOCATIONS.length);
  });
  it("restricts every new street segment to the campaign envelope and supported endpoint streets", () => {
    for (const segment of streetCatalog.segments) {
      for (const point of segment.geometry) {
        expect(point[0]).toBeGreaterThanOrEqual(-122.512);
        expect(point[0]).toBeLessThanOrEqual(-122.4755);
        expect(point[1]).toBeGreaterThanOrEqual(37.733);
        expect(point[1]).toBeLessThanOrEqual(37.766);
      }
      for (const endpoint of [segment.from, segment.to]) {
        const avenue = Number.parseInt(endpoint);
        if (Number.isFinite(avenue)) {
          expect(avenue).toBeGreaterThanOrEqual(19);
          expect(avenue).toBeLessThanOrEqual(48);
        } else expect(["Sunset Blvd", "Great Hwy", "La Playa"]).toContain(endpoint);
      }
    }
  });
  it("keeps custom-street notes restricted to hosts at the exact location", () => {
    expect(() => validateNoteHost({ block_id: "ew-13491000", reviewed_host_id: null }, { id: "host", block_id: "37-wawona", contact: "host@example.com" })).toThrow();
  });
});