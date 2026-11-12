import { z } from "zod";

export const MAX_ARTIST_FILES = 4;
export const MAX_ARTIST_FILE_SIZE = 10 * 1024 * 1024;
export const ARTIST_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/heic", "image/heif", "application/pdf"];
export const artistSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(200),
  note: z.string().trim().max(1000).default(""),
  workLink: z.string().trim().max(2000).refine(value => {
    if (!value) return true;
    try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
  }).default(""),
  language: z.enum(["en", "zh", "yue", "es"]),
  website: z.string().max(500).optional(),
});
export function validArtistFiles(files: { size: number; type: string }[]) {
  return files.length <= MAX_ARTIST_FILES && files.every(f => f.size > 0 && f.size <= MAX_ARTIST_FILE_SIZE && ARTIST_MIMES.includes(f.type));
}
export const artistFileSchema = z.object({ path: z.string(), name: z.string(), type: z.string() });