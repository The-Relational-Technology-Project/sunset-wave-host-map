import { z } from "zod";

export const MAX_ARTIST_FILES = 4;
export const MAX_ARTIST_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_ADDITIONAL_ARTIST_LINKS = 9;
export const ARTIST_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/heic", "image/heif", "application/pdf"];
const workLinkSchema = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
});
export const artistSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(200),
  note: z.string().trim().max(1000).default(""),
  workLink: workLinkSchema.default(""),
  additionalWorkLinks: z.array(workLinkSchema).max(MAX_ADDITIONAL_ARTIST_LINKS).default([]).transform(links => links.filter(Boolean)),
  language: z.enum(["en", "zh", "yue", "es"]),
  website: z.string().max(500).optional(),
});
export function artistFormFields(form: FormData) {
  return { ...Object.fromEntries(form.entries()), additionalWorkLinks: form.getAll("additionalWorkLinks") };
}
export function isArtistBotSubmission(form: FormData) {
  return form.getAll("website").some(value => typeof value !== "string" || value.length > 0);
}
export function validArtistFiles(files: { size: number; type: string }[]) {
  return files.length <= MAX_ARTIST_FILES && files.every(f => f.size > 0 && f.size <= MAX_ARTIST_FILE_SIZE && ARTIST_MIMES.includes(f.type));
}
export const artistFileSchema = z.object({ path: z.string(), name: z.string(), type: z.string() });