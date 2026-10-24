import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// Best-effort per-isolate limiter
const hits = new Map<string, number[]>();
function limited(key: string, max = 6, windowMs = 10 * 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}
async function clientKey() {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const r = getRequest();
    return r.headers.get("cf-connecting-ip") ?? r.headers.get("x-forwarded-for") ?? "anon";
  } catch {
    return "anon";
  }
}

export type Claims = { claimed: Record<string, string[]>; hostCount: number };

export const getClaims = createServerFn({ method: "GET" }).handler(async (): Promise<Claims> => {
  const sb = publicClient();
  const [{ data: rows }, { data: count }] = await Promise.all([
    sb.rpc("get_claimed_blocks"),
    sb.rpc("count_hosts"),
  ]);
  const claimed: Record<string, string[]> = {};
  for (const r of rows ?? []) if (r.block_id) claimed[r.block_id] = r.first_names ?? [];
  return { claimed, hostCount: count ?? 0 };
});

const langSchema = z.enum(["en", "zh", "yue", "es"]);

export const hostSchema = z.object({
  blockId: z.string().max(80).nullable(),
  stretch: z.string().trim().min(2).max(200),
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(200),
  cohosts: z
    .array(z.object({ name: z.string().trim().min(1).max(100), contact: z.string().trim().max(200) }))
    .max(3),
  wantsMicrogrant: z.boolean(),
  canGive: z.boolean(),
  language: langSchema,
  website: z.string().max(0).optional(), // honeypot
});

export const submitHost = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => hostSchema.parse(d))
  .handler(async ({ data }) => {
    if (limited(`h:${await clientKey()}`)) throw new Error("Too many submissions, try again later.");
    const { error } = await publicClient().from("host_offers").insert({
      block_id: data.blockId,
      stretch_text: data.stretch,
      name: data.name,
      contact: data.contact,
      cohosts: data.cohosts,
      wants_microgrant: data.wantsMicrogrant,
      can_give: data.canGive,
      language: data.language,
    });
    if (error) throw new Error("Could not save");
    return { ok: true };
  });

export const noteSchema = z.object({
  blockId: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(200),
  message: z.string().trim().min(1).max(1500),
  language: langSchema,
  website: z.string().max(0).optional(),
});

export const submitNote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => noteSchema.parse(d))
  .handler(async ({ data }) => {
    if (limited(`n:${await clientKey()}`)) throw new Error("Too many submissions, try again later.");
    const { error } = await publicClient().from("host_notes").insert({
      block_id: data.blockId,
      name: data.name,
      contact: data.contact,
      message: data.message,
      language: data.language,
    });
    if (error) throw new Error("Could not save");
    return { ok: true };
  });
