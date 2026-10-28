CREATE TABLE public.contact_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
 email text NOT NULL CHECK (char_length(email) <= 255 AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 organization text NOT NULL DEFAULT '' CHECK (char_length(organization) <= 150),
 message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 1 AND 3000),
 language text NOT NULL CHECK (language IN ('en', 'zh', 'yue', 'es'))
);
GRANT INSERT ON public.contact_submissions TO anon;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors may submit valid contact inquiries" ON public.contact_submissions FOR INSERT TO anon WITH CHECK (
 char_length(btrim(name)) BETWEEN 1 AND 100
 AND char_length(email) <= 255 AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 AND char_length(organization) <= 150
 AND char_length(btrim(message)) BETWEEN 1 AND 3000
 AND language IN ('en', 'zh', 'yue', 'es')
);
CREATE INDEX contact_submissions_created_at_idx ON public.contact_submissions (created_at DESC);