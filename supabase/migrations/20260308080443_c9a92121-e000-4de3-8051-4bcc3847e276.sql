-- Create scraped_articles table for storing auto-fetched government articles
CREATE TABLE public.scraped_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL DEFAULT 'uk',
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  original_content TEXT NOT NULL DEFAULT '',
  simplified_content TEXT NOT NULL DEFAULT '',
  detailed_points TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  category_emoji TEXT NOT NULL DEFAULT '🏛️',
  category_name TEXT NOT NULL DEFAULT 'General',
  url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  article_date TEXT NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scraped_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scraped articles"
  ON public.scraped_articles FOR SELECT USING (true);

CREATE POLICY "Service role can insert articles"
  ON public.scraped_articles FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update articles"
  ON public.scraped_articles FOR UPDATE USING (true);

CREATE INDEX idx_scraped_articles_country_source ON public.scraped_articles(country, source);
CREATE INDEX idx_scraped_articles_url ON public.scraped_articles(url);

-- Scraper run log
CREATE TABLE public.scraper_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running',
  articles_found INTEGER DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  sources_scraped TEXT[] DEFAULT '{}'
);

ALTER TABLE public.scraper_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scraper runs"
  ON public.scraper_runs FOR SELECT USING (true);

CREATE POLICY "Service role can manage scraper runs"
  ON public.scraper_runs FOR ALL USING (true);