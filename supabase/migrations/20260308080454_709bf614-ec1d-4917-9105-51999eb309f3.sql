-- Tighten write policies to authenticated role only (service role bypasses RLS anyway)
DROP POLICY "Service role can insert articles" ON public.scraped_articles;
DROP POLICY "Service role can update articles" ON public.scraped_articles;
DROP POLICY "Service role can manage scraper runs" ON public.scraper_runs;

-- No insert/update/delete via anon key - service role bypasses RLS
-- Only authenticated admins could write if needed in future
CREATE POLICY "Authenticated can insert articles"
  ON public.scraped_articles FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update articles"
  ON public.scraped_articles FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated can manage scraper runs"
  ON public.scraper_runs FOR ALL
  TO authenticated USING (true);