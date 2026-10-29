import { describe, expect, it } from "vitest";
import { canReviewNote, forwardingKey, hostEmail, STEWARD_REPLY_TO, validateNoteHost } from "./note-review";

describe("Steward note review rules", () => {
  const note = { block_id: "30-judah", reviewed_host_id: null };
  const host = { id: "host-a", block_id: "30-judah", contact: "host@example.com" };
  it("sends only to an email belonging to a host on the note's block", () => {
    expect(validateNoteHost(note, host)).toBe("host@example.com");
    expect(() => validateNoteHost(note, { ...host, block_id: "31-judah" })).toThrow();
  });
  it("does not treat phone-only host contact as an email", () => {
    expect(hostEmail("415-555-0100")).toBeNull();
    expect(() => validateNoteHost(note, { ...host, contact: "415-555-0100" })).toThrow();
  });
  it("pins retries to the approved host", () => {
    expect(() => validateNoteHost({ ...note, reviewed_host_id: "host-b" }, host)).toThrow();
  });
  it("never resends sent or suppressed notes", () => {
    expect(canReviewNote({ review_status: "sent", review_started_at: null })).toBe(false);
    expect(canReviewNote({ review_status: "suppressed", review_started_at: null })).toBe(false);
  });
  it("prevents concurrent sends and permits recovery after five minutes", () => {
    const n = { review_status: "sending" as const, review_started_at: new Date(1000).toISOString() };
    expect(canReviewNote(n, 300999)).toBe(false);
    expect(canReviewNote(n, 301000)).toBe(true);
  });
  it("uses the Social Club inbox for replies", () => {
    expect(STEWARD_REPLY_TO).toBe("oursunsetsocialclub@gmail.com");
  });
  it("deduplicates retries of the same note", () => {
    expect(forwardingKey("note-123")).toBe("note-forward-note-123");
  });
});