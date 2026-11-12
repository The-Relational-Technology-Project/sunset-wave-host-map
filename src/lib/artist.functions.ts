import { createServerFn } from "@tanstack/react-start";
import { artistSchema, ARTIST_MIMES, MAX_ARTIST_FILES, MAX_ARTIST_FILE_SIZE } from "./artist-schema";

export const submitArtist = createServerFn({ method: "POST" })
  .inputValidator((input: FormData) => {
    if (!(input instanceof FormData)) throw new Error("Invalid form");
    return input;
  })
  .handler(async ({ data }) => {
    const fields = artistSchema.parse(Object.fromEntries(data.entries()));
    if (fields.website) return { ok: true };
    const files = data.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_ARTIST_FILES || files.some(f => f.size > MAX_ARTIST_FILE_SIZE)) throw new Error("Invalid files");
    const { getRequest } = await import("@tanstack/react-start/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = getRequest().headers.get("cf-connecting-ip") ?? "anonymous";
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
    const key = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
    const limit = await supabaseAdmin.rpc("claim_artist_submission", { rate_key: key });
    if (limit.error || !limit.data) throw new Error("Too many submissions");
    const { fileTypeFromBuffer } = await import("file-type/core");
    const prepared = await Promise.all(files.map(async file => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const type = await fileTypeFromBuffer(bytes);
      if (!type || !ARTIST_MIMES.includes(type.mime)) throw new Error("Invalid file format");
      return { bytes, type, name: file.name.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200) || `example.${type.ext}` };
    }));
    const id = crypto.randomUUID();
    const uploaded: { path: string; name: string; type: string }[] = [];
    try {
      for (const [i, file] of prepared.entries()) {
        const path = `${id}/${i + 1}.${file.type.ext}`;
        const result = await supabaseAdmin.storage.from("artist-work").upload(path, file.bytes, { contentType: file.type.mime, upsert: false });
        if (result.error) throw new Error("Could not upload");
        uploaded.push({ path, name: file.name, type: file.type.mime });
      }
      const saved = await supabaseAdmin.from("artist_submissions").insert({ id, name: fields.name, contact: fields.contact, note: fields.note, work_link: fields.workLink, language: fields.language, files: uploaded });
      if (saved.error) throw new Error("Could not save");
    } catch (error) {
      if (uploaded.length) await supabaseAdmin.storage.from("artist-work").remove(uploaded.map(f => f.path));
      throw error;
    }
    try {
      const { sendTemplateEmail } = await import("./email-templates/send-email");
      await sendTemplateEmail("artist-alert", "oursunsetsocialclub@gmail.com", {
        templateData: { ...fields, fileCount: uploaded.length }, idempotencyKey: `artist-alert-${id}`,
      });
    } catch { console.error("Artist notification failed; submission is saved for stewards."); }
    return { ok: true };
  });