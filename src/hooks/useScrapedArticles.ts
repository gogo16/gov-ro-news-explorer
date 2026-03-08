import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ScrapedArticle } from '@/data/countryConfig';

interface DbArticle {
  id: string;
  country: string;
  source: string;
  title: string;
  original_content: string;
  simplified_content: string;
  detailed_points: string[];
  category: string;
  category_emoji: string;
  category_name: string;
  url: string;
  tags: string[];
  interests: string[];
  article_date: string;
  scraped_at: string;
}

const toScrapedArticle = (db: DbArticle): ScrapedArticle => ({
  id: db.id,
  date: db.article_date,
  title: db.title,
  originalContent: db.original_content,
  simplifiedContent: db.simplified_content,
  detailedPoints: db.detailed_points,
  category: db.category,
  categoryEmoji: db.category_emoji,
  categoryName: db.category_name,
  url: db.url,
  tags: db.tags as ScrapedArticle['tags'],
  source: db.source,
  interests: db.interests,
});

export function useScrapedArticles(country: string) {
  return useQuery({
    queryKey: ['scraped-articles', country],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraped_articles')
        .select('*')
        .eq('country', country)
        .order('scraped_at', { ascending: false });

      if (error) throw error;
      return (data as DbArticle[]).map(toScrapedArticle);
    },
  });
}

export function useLatestScrapeRun() {
  return useQuery({
    queryKey: ['latest-scrape-run'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraper_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useTriggerScrape() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (country: 'uk' | 'ro' = 'uk') => {
      const functionName = country === 'ro' ? 'scrape-ro-articles' : 'scrape-uk-articles';
      const { data, error } = await supabase.functions.invoke(functionName);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-articles'] });
      queryClient.invalidateQueries({ queryKey: ['latest-scrape-run'] });
    },
  });
}
