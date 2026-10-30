<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Contact inquiries use a dedicated validated public server function, insert-only visitor storage and a fixed-recipient app email; stewards read them only after the shared session check, preserving private contact details if delivery fails.
- All UI copy lives in `src/lib/i18n.tsx` as one typed dictionary per language (en, zh, yue, es); never hardcode visible text in components, so every language stays complete.
- Block dots are generated in `src/lib/blocks.ts` (not stored in the database); host offers reference them by block id string, so the grid can be tuned without migrations.
- Map columns support numbered avenues and named coastal streets; preserve existing avenue block ids when expanding the grid so saved host offers remain attached.
- Render the map with Leaflet loaded inside an effect using OpenStreetMap raster tiles; keep block midpoint coordinates in a browser-safe static data module derived from public street centerlines, so geography is independent of saved host IDs and SSR never imports Leaflet.
- Public reads of host data go only through security-definer functions returning block occupancy without names; offer/note tables are insert-only for visitors to keep identities and contact details private.
- Neighbor-note forwarding is a session-gated steward action to one server-validated host on the same block; persist moderation state with atomic claims and stable email idempotency keys, never an email queue, to prevent unreviewed or duplicate sends.
- Use the shared WaveHand asset for the title, map markers, cursor and favicon so the campaign mark stays consistent across surfaces.
- Keep map count visibility in a tested presentation helper keyed to total host count, while the displayed number represents claimed blocks, so milestone logic stays independent of map generation.
- The /steward page is gated by a shared password (server-only secret + encrypted session cookie); every steward server function re-checks the session, since route gating alone does not protect RPCs. Steward copy is English-only by design (internal tool), an exception to the i18n rule.
- FAQ items are editable per language in the `faq_content` table; the main site falls back to the i18n dictionary when a language has no saved row.
- Site traffic is self-recorded in `page_views` (anonymous visitor id + referrer) because platform analytics aren't readable from app code.
- Share links use one canonical public URL in a browser-safe shared module, so the thank-you page and confirmation email never share preview links.
