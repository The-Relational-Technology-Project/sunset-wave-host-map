ALTER TABLE public.host_offers ADD COLUMN merged_into uuid REFERENCES public.host_offers(id);
ALTER TABLE public.host_offers ADD COLUMN merged_at timestamptz;
ALTER TABLE public.host_offers ADD COLUMN merge_history jsonb NOT NULL DEFAULT '[]'::jsonb;
COMMENT ON COLUMN public.host_offers.merge_history IS 'Snapshots of this row before each steward merge; stretch_text of every submission is preserved.';

CREATE OR REPLACE FUNCTION public.count_hosts()
 RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT count(*)::int FROM public.host_offers WHERE merged_into IS NULL $$;

CREATE OR REPLACE FUNCTION public.get_claimed_blocks()
 RETURNS TABLE(block_id text, first_names text[]) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT block_id, array_agg(''::text ORDER BY created_at)
  FROM public.host_offers WHERE block_id IS NOT NULL AND merged_into IS NULL GROUP BY block_id
$$;