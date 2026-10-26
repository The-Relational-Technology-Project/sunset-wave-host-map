import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type StewardSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env["STEWARD_SESSION_SECRET"]!,
    name: "steward",
    maxAge: 60 * 60 * 24 * 14,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

async function session() {
  const { useSession } = await import("@tanstack/react-start/server");
  return useSession<StewardSession>(sessionConfig());
}

async function digest(s: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
}
async function matches(input: string, expected: string) {
  const [a, b] = await Promise.all([digest(input), digest(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function requireSteward() {
  const s = await session();
  if (!s.data.unlocked) throw new Error("LOCKED");
}

export const stewardStatus = createServerFn({ method: "GET" }).handler(async () => {
  const s = await session();
  return { unlocked: !!s.data.unlocked };
});

export const unlockSteward = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env["STEWARD_PASSWORD"];
    if (!expected) throw new Error("Steward password not set");
    if (!(await matches(data.password, expected))) return { ok: false as const };
    const s = await session();
    await s.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockSteward = createServerFn({ method: "POST" }).handler(async () => {
  const s = await session();
  await s.clear();
  return { ok: true };
});

export type HostRow = {
  id: string; created_at: string; block_id: string | null; stretch_text: string; name: string; contact: string;
  cohosts: { name: string; contact: string }[]; wants_microgrant: boolean; can_give: boolean; sheltered: boolean; language: string;
};
export type NoteRow = { id: string; created_at: string; block_id: string; name: string; contact: string; message: string; language: string };
export type Traffic = {
  visitors: number; views: number;
  daily: { day: string; visitors: number; views: number }[];
  sources: { source: string; visitors: number }[];
};

function sourceOf(ref: string | null) {
  if (!ref) return "Direct / unknown";
  try {
    const h = new URL(ref).hostname.replace(/^www\./, "");
    if (h.endsWith("thesunsetwave.org") || h.endsWith("lovable.app")) return "Direct / unknown";
    return h;
  } catch {
    return "Direct / unknown";
  }
}

export const getStewardData = createServerFn({ method: "GET" }).handler(async () => {
  await requireSteward();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const [hosts, notes, views] = await Promise.all([
    supabaseAdmin.from("host_offers").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("host_notes").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("page_views").select("visitor_id, referrer, created_at").gte("created_at", since).limit(50000),
  ]);
  const v = views.data ?? [];
  const days = new Map<string, { v: Set<string>; n: number }>();
  for (let i = 6; i >= 0; i--) days.set(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), { v: new Set(), n: 0 });
  const firstRef = new Map<string, string>();
  for (const r of [...v].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    const d = days.get(r.created_at.slice(0, 10));
    if (d) { d.v.add(r.visitor_id); d.n++; }
    if (!firstRef.has(r.visitor_id)) firstRef.set(r.visitor_id, sourceOf(r.referrer));
  }
  const src = new Map<string, number>();
  for (const s of firstRef.values()) src.set(s, (src.get(s) ?? 0) + 1);
  const traffic: Traffic = {
    visitors: firstRef.size,
    views: v.length,
    daily: [...days].map(([day, d]) => ({ day, visitors: d.v.size, views: d.n })),
    sources: [...src].map(([source, visitors]) => ({ source, visitors })).sort((a, b) => b.visitors - a.visitors),
  };
  return {
    hosts: (hosts.data ?? []) as unknown as HostRow[],
    notes: (notes.data ?? []) as NoteRow[],
    traffic,
  };
});

const faqSchema = z.object({
  language: z.enum(["en", "zh", "yue", "es"]),
  items: z.array(z.object({ q: z.string().trim().min(1).max(300), a: z.string().trim().min(1).max(3000) })).max(40),
});

export const saveFaq = createServerFn({ method: "POST" })
  .inputValidator((d) => faqSchema.parse(d))
  .handler(async ({ data }) => {
    await requireSteward();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("faq_content")
      .upsert({ language: data.language, items: data.items, updated_at: new Date().toISOString() });
    if (error) throw new Error("Could not save");
    return { ok: true };
  });
