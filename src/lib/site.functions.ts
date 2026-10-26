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

export type FaqItem = { q: string; a: string };
export type FaqOverrides = Partial<Record<"en" | "zh" | "yue" | "es", FaqItem[]>>;

export const getFaq = createServerFn({ method: "GET" }).handler(async (): Promise<FaqOverrides> => {
  const { data } = await publicClient().from("faq_content").select("language, items");
  const out: FaqOverrides = {};
  for (const r of data ?? []) {
    if (Array.isArray(r.items) && r.items.length) out[r.language as keyof FaqOverrides] = r.items as FaqItem[];
  }
  return out;
});

export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ visitorId: z.string().min(8).max(64), path: z.string().min(1).max(200), referrer: z.string().max(300).nullable() }).parse(d),
  )
  .handler(async ({ data }) => {
    await publicClient().from("page_views").insert({ visitor_id: data.visitorId, path: data.path, referrer: data.referrer });
    return { ok: true };
  });
