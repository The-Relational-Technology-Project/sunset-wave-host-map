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
- All UI copy lives in `src/lib/i18n.tsx` as one typed dictionary per language (en, zh, yue, es); never hardcode visible text in components, so every language stays complete.
- Block dots are generated in `src/lib/blocks.ts` (not stored in the database); host offers reference them by block id string, so the grid can be tuned without migrations.
- Map columns support numbered avenues and named coastal streets; preserve existing avenue block ids when expanding the grid so saved host offers remain attached.
- Public reads of host data go only through security-definer functions that return first names and block ids; offer/note tables are insert-only for visitors to keep contact details private.
- Use the shared WaveHand asset for the title, map markers, cursor and favicon so the campaign mark stays consistent across surfaces.
