ALTER TABLE public.host_offers ADD COLUMN location_resolved_at timestamptz;
COMMENT ON COLUMN public.host_offers.location_resolved_at IS 'Set by a steward when a host stays on the list without a map location (e.g. outside coverage).';
DROP POLICY IF EXISTS "Anyone can offer to host" ON public.host_offers;
CREATE POLICY "Anyone can offer to host" ON public.host_offers FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100 AND char_length(btrim(contact)) BETWEEN 3 AND 200
  AND char_length(btrim(stretch_text)) BETWEEN 2 AND 200 AND (block_id IS NULL OR char_length(block_id) <= 80)
  AND language = ANY (ARRAY['en','zh','yue','es']) AND jsonb_typeof(cohosts) = 'array' AND jsonb_array_length(cohosts) <= 3
  AND merged_into IS NULL AND merged_at IS NULL AND merge_history = '[]'::jsonb AND location_resolved_at IS NULL);