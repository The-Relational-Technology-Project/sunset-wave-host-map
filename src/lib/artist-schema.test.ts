import { describe, expect, it } from "vitest";
import { artistSchema, validArtistFiles } from "./artist-schema";

const entry = { name: "Rowan Example", contact: "artist@example.com", language: "en" };
describe("artist submissions", () => {
  it("requires a name", () => expect(artistSchema.safeParse({ ...entry, name: " " }).success).toBe(false));
  it("requires a contact method but accepts a phone", () => {
    expect(artistSchema.safeParse({ ...entry, contact: "" }).success).toBe(false);
    expect(artistSchema.safeParse({ ...entry, contact: "202-555-0100" }).success).toBe(true);
  });
  it("allows an omitted note and work examples", () => {
    expect(artistSchema.parse(entry).note).toBe("");
    expect(artistSchema.parse(entry).workLink).toBe("");
    expect(validArtistFiles([])).toBe(true);
  });
  it("accepts four examples and rejects five", () => {
    const file = { size: 100, type: "image/png" };
    expect(validArtistFiles(Array(4).fill(file))).toBe(true);
    expect(validArtistFiles(Array(5).fill(file))).toBe(false);
  });
  it("accepts images and PDFs but rejects executable and SVG files", () => {
    expect(validArtistFiles([{ size: 100, type: "image/jpeg" }, { size: 100, type: "application/pdf" }])).toBe(true);
    expect(validArtistFiles([{ size: 100, type: "application/javascript" }])).toBe(false);
    expect(validArtistFiles([{ size: 100, type: "image/svg+xml" }])).toBe(false);
  });
  it("limits each file to 10 MB", () => {
    expect(validArtistFiles([{ size: 10485760, type: "application/pdf" }])).toBe(true);
    expect(validArtistFiles([{ size: 10485761, type: "application/pdf" }])).toBe(false);
  });
  it("rejects unsafe example links", () => expect(artistSchema.safeParse({ ...entry, workLink: "javascript:alert(1)" }).success).toBe(false));
});