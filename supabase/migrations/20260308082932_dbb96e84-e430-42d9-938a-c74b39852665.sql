
CREATE TABLE public.newsletter_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  country text NOT NULL DEFAULT 'ro',
  interests text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmed boolean NOT NULL DEFAULT false,
  UNIQUE(email)
);

ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert newsletter signups"
ON public.newsletter_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read own signup by email"
ON public.newsletter_signups
FOR SELECT
TO anon, authenticated
USING (true);
