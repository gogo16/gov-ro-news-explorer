import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Calendar, Globe, Sparkles, FileText, Tag, ChevronDown, ExternalLink } from 'lucide-react';
import ArticleTagBadge from '@/components/ArticleTagBadge';
import ThemeToggle from '@/components/ThemeToggle';
import { useAppData } from '@/context/AppDataContext';
import { useScrapedArticles } from '@/hooks/useScrapedArticles';
import type { ScrapedArticle, Country } from '@/data/countryConfig';
import { Helmet } from 'react-helmet-async';

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const appData = useAppData();

  // Load articles from both countries
  const roConfig = useMemo(() => appData.getData('ro'), [appData]);
  const ukConfig = useMemo(() => appData.getData('uk'), [appData]);
  const { data: roDb } = useScrapedArticles('ro');
  const { data: ukDb } = useScrapedArticles('uk');

  const allArticles = useMemo(() => [
    ...roConfig.articles, ...(roDb || []),
    ...ukConfig.articles, ...(ukDb || []),
  ], [roConfig, ukConfig, roDb, ukDb]);

  const article = useMemo(() => allArticles.find(a => a.id === id), [allArticles, id]);

  const country: Country = article
    ? (roConfig.articles.some(a => a.id === article.id) || roDb?.some(a => a.id === article.id) ? 'ro' : 'uk')
    : 'ro';
  const config = country === 'ro' ? roConfig : ukConfig;
  const labels = config.labels;

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return allArticles
      .filter(a => a.id !== article.id && (a.category === article.category || a.source === article.source))
      .slice(0, 3);
  }, [article, allArticles]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Article not found</h1>
            <Link to="/">
              <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to all articles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metaDescription = article.simplifiedContent.substring(0, 155) + '...';
  const sourceWebsite = config.websites.find(w => w.id === article.source);

  return (
    <>
      <Helmet>
        <title>{article.title} — Friendly GOV</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/article/${article.id}`} />
        <link rel="canonical" href={`${window.location.origin}/article/${article.id}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            datePublished: article.date,
            description: metaDescription,
            publisher: { '@type': 'Organization', name: 'Friendly GOV' },
            mainEntityOfPage: `${window.location.origin}/article/${article.id}`,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {country === 'ro' ? 'Înapoi la toate articolele' : 'Back to all articles'}
              </Button>
            </Link>
            <ThemeToggle />
          </div>

          {/* Article */}
          <article>
            <Card className="border-2 border-border shadow-lg">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{sourceWebsite?.emoji} {sourceWebsite?.name}</Badge>
                  <Badge variant="secondary"><Tag className="h-3 w-3 mr-1" />{article.categoryEmoji} {article.categoryName}</Badge>
                  {article.tags.map(tag => <ArticleTagBadge key={tag} tag={tag} labels={labels} />)}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{article.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <time>{article.date}</time>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Simplified version — prominent */}
                <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
                  <h2 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5" />{labels.simplified}
                  </h2>
                  <p className="text-green-800 dark:text-green-300 leading-relaxed text-base">{article.simplifiedContent}</p>
                </div>

                {/* Key Points */}
                <div>
                  <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />{labels.keyPoints}
                  </h2>
                  <ul className="space-y-3">
                    {article.detailedPoints.map((point, i) => (
                      <li key={i} className="p-4 bg-secondary/50 rounded-lg border border-border">
                        <p className="text-foreground leading-relaxed">• {point}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Original text — collapsible */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {labels.originalContent}
                      </span>
                      <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border mt-2">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{article.originalContent}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* View original */}
                <Button variant="outline" className="w-full gap-2" onClick={() => window.open(article.url, '_blank')}>
                  <ExternalLink className="h-4 w-4" />{labels.viewOriginal}
                </Button>
              </CardContent>
            </Card>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">
                {country === 'ro' ? 'Articole similare' : 'Related articles'}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedArticles.map(rel => (
                  <Link key={rel.id} to={`/article/${rel.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow border border-border">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">{rel.categoryEmoji} {rel.categoryName}</Badge>
                          {rel.tags.map(tag => <ArticleTagBadge key={tag} tag={tag} labels={labels} />)}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-3">{rel.title}</h3>
                        <p className="text-xs text-muted-foreground">{rel.date}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default ArticlePage;
