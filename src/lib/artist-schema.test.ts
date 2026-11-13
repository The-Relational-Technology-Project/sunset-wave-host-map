import { describe, expect, it } from "vitest";
import { artistSchema, artistFormFields, isArtistBotSubmission, validArtistFiles } from "./artist-schema";

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
  it("accepts several optional work links and ignores empty added fields", () => {
    const form = new FormData();
    Object.entries(entry).forEach(([key, value]) => form.set(key, value));
    form.set("workLink", "https://example.com/portfolio");
    form.append("additionalWorkLinks", "https://example.com/art");
    form.append("additionalWorkLinks", "http://example.com/drawings");
    form.append("additionalWorkLinks", " ");
    expect(artistSchema.parse(artistFormFields(form)).additionalWorkLinks).toEqual(["https://example.com/art", "http://example.com/drawings"]);
    expect(artistSchema.parse(entry).additionalWorkLinks).toEqual([]);
  });
  it("validates every additional work link", () => {
    expect(artistSchema.safeParse({ ...entry, additionalWorkLinks: ["https://example.com", "javascript:alert(1)"] }).success).toBe(false);
    expect(artistSchema.safeParse({ ...entry, additionalWorkLinks: ["https://example.com/" + "a".repeat(2000)] }).success).toBe(false);
  });
  it("bounds extra links to nine", () => {
    expect(artistSchema.safeParse({ ...entry, additionalWorkLinks: Array(9).fill("https://example.com") }).success).toBe(true);
    expect(artistSchema.safeParse({ ...entry, additionalWorkLinks: Array(10).fill("https://example.com") }).success).toBe(false);
  });
  it("catches a filled honeypot including repeated values but allows an empty one", () => {
    const form = new FormData();
    form.set("website", "");
    expect(isArtistBotSubmission(form)).toBe(false);
    form.append("website", "https://example.com/bot");
    expect(isArtistBotSubmission(form)).toBe(true);
  });
});