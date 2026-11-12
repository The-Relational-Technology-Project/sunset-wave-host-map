CREATE OR REPLACE FUNCTION public.claim_artist_submission(rate_key text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recent timestamptz[];
BEGIN
 INSERT INTO public.artist_submission_limits(key) VALUES (rate_key) ON CONFLICT DO NOTHING;
 SELECT hits INTO recent FROM public.artist_submission_limits WHERE key = rate_key FOR UPDATE;
 SELECT COALESCE(array_agg(t), '{}'::timestamptz[]) INTO recent FROM unnest(recent) t WHERE t > now() - interval '10 minutes';
 IF cardinality(recent) >= 6 THEN RETURN false; END IF;
 UPDATE public.artist_submission_limits SET hits = array_append(recent, now()) WHERE key = rate_key;
 RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_artist_submission(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_artist_submission(text) TO service_role;