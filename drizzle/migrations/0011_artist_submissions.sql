CREATE TABLE public.artist_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
 contact text NOT NULL CHECK (char_length(btrim(contact)) BETWEEN 3 AND 200),
 note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 1000),
 work_link text NOT NULL DEFAULT '' CHECK (char_length(work_link) <= 2000),
 files jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(files) = 'array' AND jsonb_array_length(files) <= 4),
 language text NOT NULL CHECK (language IN ('en', 'zh', 'yue', 'es'))
);
GRANT ALL ON public.artist_submissions TO service_role;
ALTER TABLE public.artist_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service handles artist submissions" ON public.artist_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TABLE public.artist_submission_limits (key text PRIMARY KEY, hits timestamptz[] NOT NULL DEFAULT '{}');
GRANT ALL ON public.artist_submission_limits TO service_role;
ALTER TABLE public.artist_submission_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service handles artist limits" ON public.artist_submission_limits FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE FUNCTION public.claim_artist_submission(rate_key text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recent timestamptz[];
BEGIN
 INSERT INTO public.artist_submission_limits(key) VALUES (rate_key) ON CONFLICT DO NOTHING;
 SELECT ARRAY(SELECT unnest(hits) AS t WHERE unnest_placeholder()) INTO recent;
 RETURN false;
END;
$$;