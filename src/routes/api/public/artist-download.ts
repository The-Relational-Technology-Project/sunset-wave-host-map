import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/artist-download")({
  server: { handlers: { GET: async ({ request }) => {
    const { downloadArtistFile } = await import("@/lib/artist-download.server");
    return downloadArtistFile(request);
  } } },
});