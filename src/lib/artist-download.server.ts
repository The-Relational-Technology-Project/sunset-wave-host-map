import { z } from "zod";
import { artistFileSchema } from "./artist-schema";
import { requireStewardSession } from "./steward-session.server";

export async function downloadArtistFile(request: Request) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  try { await requireStewardSession(); }
  catch { return new Response("Steward access required.", { status: 401, headers }); }

  const url = new URL(request.url);
  const input = z.object({ id: z.string().uuid(), path: z.string().min(1).max(300) }).safeParse(Object.fromEntries(url.searchParams));
  if (!input.success) return new Response("Invalid file request.", { status: 400, headers });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const row = await supabaseAdmin.from("artist_submissions").select("files").eq("id", input.data.id).single();
  const files = z.array(artistFileSchema).safeParse(row.data?.files ?? []);
  const file = files.success ? files.data.find(f => f.path === input.data.path) : undefined;
  if (row.error || !file) return new Response("File not found.", { status: 404, headers });

  const result = await supabaseAdmin.storage.from("artist-work").download(file.path);
  if (result.error || !result.data) return new Response("Could not download file.", { status: 502, headers });
  const name = file.name.replace(/[\u0000-\u001f\u007f]/g, "") || "work-example";
  const encoded = encodeURIComponent(name).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return new Response(result.data, { headers: {
    ...headers,
    "Content-Type": file.type,
    "Content-Disposition": `attachment; filename="${name.replace(/[^\x20-\x7e]|["\\]/g, "_")}"; filename*=UTF-8''${encoded}`,
  } });
}