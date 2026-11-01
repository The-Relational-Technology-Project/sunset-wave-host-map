CREATE OR REPLACE FUNCTION public.count_host_neighbors()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce(sum(1 + CASE WHEN jsonb_typeof(cohosts) = 'array' THEN jsonb_array_length(cohosts) ELSE 0 END), 0)::integer
  FROM public.host_offers
  WHERE merged_into IS NULL
$$;
REVOKE ALL ON FUNCTION public.count_host_neighbors() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_host_neighbors() TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.count_host_neighbors() IS 'Public aggregate of hosts plus their co-hosts, excluding merged offers; returns no private details.';