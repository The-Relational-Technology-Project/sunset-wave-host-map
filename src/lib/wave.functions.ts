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

const REPLY_TO = "oursunsetsocialclub@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function confirm(template: string, contact: string, id: string, data: Record<string, unknown>) {
  if (!EMAIL_RE.test(contact)) return; // contact may be a phone number
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail(template, contact, { templateData: data, idempotencyKey: `${template}-${id}`, replyTo: REPLY_TO });
  } catch (e) {
    console.error("confirmation email failed", e);
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
  sheltered: z.boolean().default(false),
  language: langSchema,
  website: z.string().max(500).optional(), // honeypot: filled = bot
});

export const submitHost = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => hostSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true }; // bot: pretend success, store nothing
    if (limited(`h:${await clientKey()}`)) throw new Error("Too many submissions, try again later.");
    const id = crypto.randomUUID();
    const { error } = await publicClient().from("host_offers").insert({
      id,
      block_id: data.blockId,
      stretch_text: data.stretch,
      name: data.name,
      contact: data.contact,
      cohosts: data.cohosts,
      wants_microgrant: data.wantsMicrogrant,
      can_give: data.canGive,
      sheltered: data.sheltered,
      language: data.language,
    });
    if (error) throw new Error("Could not save");
    await confirm("host-confirmation", data.contact, id, { name: data.name, stretch: data.stretch });
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("host-alert", REPLY_TO, {
        templateData: { name: data.name, contact: data.contact, stretch: data.stretch, cohosts: data.cohosts, wantsMicrogrant: data.wantsMicrogrant, canGive: data.canGive, sheltered: data.sheltered, language: data.language },
        idempotencyKey: `host-alert-${id}`,
        ...(EMAIL_RE.test(data.contact) ? { replyTo: data.contact } : {}),
      });
    } catch (e) {
      console.error("host alert email failed", e);
    }
    return { ok: true };
  });

export const noteSchema = z.object({
  blockId: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(200),
  message: z.string().trim().min(1).max(1500),
  language: langSchema,
  website: z.string().max(500).optional(),
});

export const submitNote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => noteSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true };
    if (limited(`n:${await clientKey()}`)) throw new Error("Too many submissions, try again later.");
    const id = crypto.randomUUID();
    const { error } = await publicClient().from("host_notes").insert({
      id,
      block_id: data.blockId,
      name: data.name,
      contact: data.contact,
      message: data.message,
      language: data.language,
    });
    if (error) throw new Error("Could not save");
    await confirm("note-confirmation", data.contact, id, { name: data.name });
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("note-alert", REPLY_TO, {
        templateData: { name: data.name, contact: data.contact, message: data.message, blockId: data.blockId },
        idempotencyKey: `note-alert-${id}`, replyTo: REPLY_TO,
      });
    } catch {
      console.error("neighbor note alert failed; note remains available for steward review");
    }
    return { ok: true };
  });
