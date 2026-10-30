import { z } from "zod";

export const STEWARD_REPLY_TO = "oursunsetsocialclub@gmail.com";
export const REVIEW_LEASE_MS = 5 * 60_000;
export type ReviewStatus = "pending" | "sending" | "sent" | "failed" | "suppressed";

export function hostEmail(contact: string): string | null {
  for (const part of contact.split(/[;,\s]+/)) {
    const value = part.trim();
    if (value && z.string().email().safeParse(value).success) return value;
  }
  return null;
}

export function canReviewNote(note: { review_status: ReviewStatus; review_started_at: string | null }, now = Date.now()) {
  if (note.review_status === "pending") return true;
  if (note.review_status === "sent" || note.review_status === "suppressed") return false;
  return !note.review_started_at || now - Date.parse(note.review_started_at) >= REVIEW_LEASE_MS;
}

export function validateNoteHost(note: { block_id: string; reviewed_host_id: string | null }, host: { id: string; block_id: string | null; contact: string }) {
  if (host.block_id !== note.block_id) throw new Error("Choose a host on this note's block.");
  if (note.reviewed_host_id && note.reviewed_host_id !== host.id) throw new Error("A previously approved note must keep the same recipient.");
  const email = hostEmail(host.contact);
  if (!email) throw new Error("This host has no email address. Please pass the note along manually.");
  return email;
}

export function forwardingKey(noteId: string) { return `note-forward-${noteId}`; }