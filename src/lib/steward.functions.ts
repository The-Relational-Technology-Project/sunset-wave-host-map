import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { canReviewNote, forwardingKey, STEWARD_REPLY_TO, validateNoteHost, type ReviewStatus } from "./note-review";
import { LOCATION_BY_ID } from "./hosting-locations";

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
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
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
  merged_into: string | null; merged_at: string | null;
};
export type NoteRow = { id: string; created_at: string; block_id: string; name: string; contact: string; message: string; language: string; review_status: ReviewStatus; reviewed_host_id: string | null; review_started_at: string | null; forwarded_at: string | null };
export type ContactRow = { id: string; created_at: string; name: string; email: string; organization: string; message: string; language: string };
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
  const [hosts, notes, views, contacts] = await Promise.all([
    supabaseAdmin.from("host_offers").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("host_notes").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("page_views").select("visitor_id, referrer, created_at").gte("created_at", since).limit(50000),
    supabaseAdmin.from("contact_submissions").select("*").order("created_at", { ascending: false }),
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
    contacts: (contacts.data ?? []) as ContactRow[],
    traffic,
  };
});

const faqSchema = z.object({
  language: z.enum(["en", "zh", "yue", "es"]),
  items: z.array(z.object({ q: z.string().trim().min(1).max(300), a: z.string().trim().min(1).max(3000) })).max(40),
});

export const approveNote = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ noteId: z.string().uuid(), hostId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireSteward();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: row, error: noteError }, { data: host, error: hostError }] = await Promise.all([
      supabaseAdmin.from("host_notes").select("*").eq("id", data.noteId).single(),
      supabaseAdmin.from("host_offers").select("id, block_id, contact, name, stretch_text, language").eq("id", data.hostId).single(),
    ]);
    if (noteError || hostError || !row || !host) throw new Error("Note or host not found.");
    const note = row as NoteRow;
    const recipient = validateNoteHost(note, host);
    if (!canReviewNote(note)) throw new Error("This note is already sent, blocked, or being processed. Wait five minutes before retrying.");
    const started = new Date().toISOString();
    let claim = supabaseAdmin.from("host_notes").update({ review_status: "sending", reviewed_host_id: host.id, review_started_at: started })
      .eq("id", note.id).eq("review_status", note.review_status);
    claim = note.review_started_at ? claim.eq("review_started_at", note.review_started_at) : claim.is("review_started_at", null);
    const { data: claimed, error: claimError } = await claim.select("id").maybeSingle();
    if (claimError || !claimed) throw new Error("Another steward is processing this note. Refresh to see its status.");
    let status: ReviewStatus;
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const result = await sendTemplateEmail("note-forward", recipient, {
        templateData: { hostName: host.name, name: note.name, contact: note.contact, message: note.message, stretch: host.stretch_text, language: host.language },
        idempotencyKey: forwardingKey(note.id), replyTo: STEWARD_REPLY_TO,
      });
      status = result.sent ? "sent" : "suppressed";
    } catch {
      await supabaseAdmin.from("host_notes").update({ review_status: "failed" }).eq("id", note.id).eq("review_started_at", started);
      throw new Error("Email sending could not be confirmed. The note is saved. Wait five minutes, then retry with the same host.");
    }
    const { error: saveError } = await supabaseAdmin.from("host_notes")
      .update({ review_status: status, forwarded_at: status === "sent" ? new Date().toISOString() : null })
      .eq("id", note.id).eq("review_started_at", started);
    if (saveError) throw new Error("Email was processed but its status could not be saved. Refresh and retry after five minutes if needed.");
    return { status };
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

export const assignHostLocation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ hostId: z.string().uuid(), blockId: z.string().max(80) }).parse(d))
  .handler(async ({ data }) => {
    await requireSteward();
    if (!LOCATION_BY_ID.has(data.blockId)) throw new Error("Choose a location within the campaign streets.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Null-only claims cannot have an approved note recipient: notes always require a block ID.
    // Never move an assigned host, which could invalidate existing note routing.
    const { data: row, error } = await supabaseAdmin.from("host_offers").update({ block_id: data.blockId })
      .eq("id", data.hostId).is("block_id", null).select("id").maybeSingle();
    if (error || !row) throw new Error("This host is already mapped or could not be saved. Refresh the page.");
    return { ok: true };
  });

export const mergeHosts = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ hostIds: z.array(z.string().uuid()).min(2).max(10) }).parse(d))
  .handler(async ({ data }) => {
    await requireSteward();
    const { mergePlan } = await import("./host-duplicates");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from("host_offers").select("*").in("id", data.hostIds).is("merged_into", null);
    if (error || !rows || rows.length !== data.hostIds.length) throw new Error("One of these hosts was already merged. Refresh the page.");
    const plan = mergePlan(rows as unknown as HostRow[]);
    const keeper = rows.find((r) => r.id === plan.keeperId)!;
    const now = new Date().toISOString();
    const snapshot = { at: now, before: { name: keeper.name, contact: keeper.contact, block_id: keeper.block_id, cohosts: keeper.cohosts }, merged: plan.duplicateIds };
    // Mark duplicates first (only if still unmerged) so concurrent merges cannot double-claim them.
    const { data: marked, error: markError } = await supabaseAdmin.from("host_offers")
      .update({ merged_into: plan.keeperId, merged_at: now }).in("id", plan.duplicateIds).is("merged_into", null).select("id");
    if (markError || marked?.length !== plan.duplicateIds.length) throw new Error("Merge conflicted with another change. Refresh and check.");
    const history = Array.isArray(keeper.merge_history) ? keeper.merge_history : [];
    const { error: saveError } = await supabaseAdmin.from("host_offers")
      .update({ ...plan.update, merge_history: [...history, snapshot] }).eq("id", plan.keeperId).is("merged_into", null);
    if (saveError) throw new Error("Duplicates were marked but the kept signup could not be updated. Refresh and contact support.");
    return { ok: true, keeperId: plan.keeperId };
  });
