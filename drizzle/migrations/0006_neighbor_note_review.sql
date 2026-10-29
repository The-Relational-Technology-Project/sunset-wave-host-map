ALTER TABLE public.host_notes
  ADD COLUMN review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','sending','sent','failed','suppressed')),
  ADD COLUMN reviewed_host_id uuid REFERENCES public.host_offers(id),
  ADD COLUMN review_started_at timestamptz,
  ADD COLUMN forwarded_at timestamptz;
COMMENT ON COLUMN public.host_notes.review_status IS 'Steward moderation state. Only an explicit steward approval may forward a note; not an email queue.';
GRANT ALL ON public.host_notes TO service_role;
DROP POLICY IF EXISTS "Anyone can leave a note for a host" ON public.host_notes;
CREATE POLICY "Anyone can leave a note for a host" ON public.host_notes FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(btrim(contact)) BETWEEN 3 AND 200
  AND char_length(btrim(message)) BETWEEN 1 AND 1500
  AND char_length(block_id) BETWEEN 1 AND 80
  AND language IN ('en','zh','yue','es')
  AND review_status = 'pending' AND reviewed_host_id IS NULL
  AND review_started_at IS NULL AND forwarded_at IS NULL
);
CREATE OR REPLACE FUNCTION public.get_claimed_blocks()
RETURNS TABLE(block_id text, first_names text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT block_id, array_agg(''::text ORDER BY created_at)
  FROM public.host_offers WHERE block_id IS NOT NULL GROUP BY block_id
$$;
COMMENT ON FUNCTION public.get_claimed_blocks() IS 'Public occupancy only. Legacy first_names output contains empty placeholders, never host names.';