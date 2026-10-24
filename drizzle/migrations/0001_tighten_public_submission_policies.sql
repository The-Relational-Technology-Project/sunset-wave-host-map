DROP POLICY IF EXISTS "Anyone can offer to host" ON public.host_offers;
CREATE POLICY "Anyone can offer to host" ON public.host_offers FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(btrim(contact)) BETWEEN 3 AND 200
  AND char_length(btrim(stretch_text)) BETWEEN 2 AND 200
  AND (block_id IS NULL OR char_length(block_id) <= 80)
  AND language IN ('en','zh','yue','es')
  AND jsonb_typeof(cohosts) = 'array' AND jsonb_array_length(cohosts) <= 3
);
DROP POLICY IF EXISTS "Anyone can leave a note for a host" ON public.host_notes;
CREATE POLICY "Anyone can leave a note for a host" ON public.host_notes FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(btrim(contact)) BETWEEN 3 AND 200
  AND char_length(btrim(message)) BETWEEN 1 AND 1500
  AND char_length(block_id) BETWEEN 1 AND 80
  AND language IN ('en','zh','yue','es')
);