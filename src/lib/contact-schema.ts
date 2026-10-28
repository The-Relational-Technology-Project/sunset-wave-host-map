import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  organization: z.string().trim().max(150).default(""),
  message: z.string().trim().min(1).max(3000),
  language: z.enum(["en", "zh", "yue", "es"]),
  website: z.string().max(500).optional(),
});

export function contactRateLimiter() {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()) => {
    for (const [k, times] of hits) if ((times.at(-1) ?? 0) <= now - 600_000) hits.delete(k);
    const times = (hits.get(key) ?? []).filter(t => t > now - 600_000);
    if (times.length >= 6) return false;
    hits.set(key, [...times, now]);
    return true;
  };
}