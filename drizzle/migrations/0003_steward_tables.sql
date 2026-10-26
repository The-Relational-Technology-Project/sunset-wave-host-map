CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  path text NOT NULL,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a visit" ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (char_length(visitor_id) BETWEEN 8 AND 64 AND char_length(path) BETWEEN 1 AND 200 AND (referrer IS NULL OR char_length(referrer) <= 300));
CREATE INDEX page_views_created_idx ON public.page_views (created_at);

CREATE TABLE public.faq_content (
  language text PRIMARY KEY CHECK (language IN ('en','zh','yue','es')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq_content TO anon, authenticated;
GRANT ALL ON public.faq_content TO service_role;
ALTER TABLE public.faq_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ is public" ON public.faq_content FOR SELECT TO anon, authenticated USING (true);