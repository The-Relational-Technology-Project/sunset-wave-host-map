ALTER TABLE public.artist_submissions ADD COLUMN additional_work_links text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.artist_submissions ADD CONSTRAINT artist_additional_work_links_limit CHECK (cardinality(additional_work_links) <= 9);
COMMENT ON COLUMN public.artist_submissions.additional_work_links IS 'Optional additional existing-work URLs alongside the original work_link.';