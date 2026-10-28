import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { contactSchema, contactRateLimiter } from "./contact-schema";

const allow = contactRateLimiter();
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true };
    const { getRequest } = await import("@tanstack/react-start/server");
    const ip = getRequest().headers.get("cf-connecting-ip") ?? "anon";
    if (!allow(ip)) throw new Error("Too many submissions");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const id = crypto.randomUUID();
    const { website: _website, ...fields } = data;
    const { error } = await sb.from("contact_submissions").insert({ id, ...fields });
    if (error) throw new Error("Could not save inquiry");
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("contact-alert", "oursunsetsocialclub@gmail.com", {
        templateData: fields, idempotencyKey: `contact-alert-${id}`, replyTo: data.email,
      });
    } catch {
      console.error("Contact notification failed; inquiry is saved for stewards.");
    }
    return { ok: true };
  });