CREATE TABLE public.host_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id text,
  stretch_text text NOT NULL CHECK (char_length(stretch_text) BETWEEN 2 AND 200),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 3 AND 200),
  cohosts jsonb NOT NULL DEFAULT '[]'::jsonb,
  wants_microgrant boolean NOT NULL DEFAULT false,
  can_give boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.host_offers TO anon, authenticated;
GRANT ALL ON public.host_offers TO service_role;
ALTER TABLE public.host_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can offer to host" ON public.host_offers FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.host_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id text NOT NULL CHECK (char_length(block_id) <= 80),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 3 AND 200),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1500),
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.host_notes TO anon, authenticated;
GRANT ALL ON public.host_notes TO service_role;
ALTER TABLE public.host_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can leave a note for a host" ON public.host_notes FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.get_claimed_blocks()
RETURNS TABLE(block_id text, first_names text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT block_id, array_agg(split_part(trim(name), ' ', 1) ORDER BY created_at)
  FROM public.host_offers WHERE block_id IS NOT NULL GROUP BY block_id
$$;
CREATE OR REPLACE FUNCTION public.count_hosts()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.host_offers
$$;
GRANT EXECUTE ON FUNCTION public.get_claimed_blocks() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_hosts() TO anon, authenticated;