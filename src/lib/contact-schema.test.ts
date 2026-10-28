import { describe, expect, it } from "vitest";
import { contactSchema, contactRateLimiter } from "./contact-schema";

const valid = { name: "Neighbor", email: "neighbor@example.com", message: "I'd like to help.", language: "en" };
describe("Contact submissions", () => {
  it.each(["name", "email", "message"])("requires %s", field => {
    expect(contactSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false);
  });
  it("allows an omitted organization", () => {
    expect(contactSchema.parse(valid).organization).toBe("");
  });
  it("rejects invalid email addresses", () => {
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
  it("allows six inquiries per visitor per ten minutes", () => {
    const allow = contactRateLimiter();
    for (let i = 0; i < 6; i++) expect(allow("visitor", 1000)).toBe(true);
    expect(allow("visitor", 1000)).toBe(false);
    expect(allow("another", 1000)).toBe(true);
    expect(allow("visitor", 601000)).toBe(true);
  });
});