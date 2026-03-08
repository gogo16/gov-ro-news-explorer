import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Globe, Sparkles, FileText, Calendar as CalendarIcon, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import WebsiteMenu from "@/components/WebsiteMenu";
import SearchAndFilters from "@/components/SearchAndFilters";
import LegalTermTooltip from "@/components/LegalTermTooltip";
import CountrySwitcher from "@/components/CountrySwitcher";
import ArticleTagBadge from "@/components/ArticleTagBadge";
import ThemeToggle from "@/components/ThemeToggle";
import NewsletterSignup from "@/components/NewsletterSignup";
import { filterArticles, highlightLegalTerms, removeDiacritics } from "@/utils/textProcessing";
import { Country, Website } from "@/data/countryConfig";
import { useAppData } from "@/context/AppDataContext";
import { useScrapedArticles } from "@/hooks/useScrapedArticles";

const ARTICLES_PER_PAGE = 4;

const Index = () => {
  const [country, setCountry] = useState<Country>('ro');
  const appData = useAppData();
  const config = useMemo(() => appData.getData(country), [appData, country]);

  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [interest, setInterest] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setSelectedWebsite('all');
    setSelectedDate(undefined);
    setSearchTerm("");
    setDocumentType("all");
    setSubject("all");
    setInterest("");
    setCurrentPage(0);
    setLastUpdateTime(new Date().toLocaleString(config.dateLocale));
  }, [country]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedWebsite, selectedDate, searchTerm, documentType, subject, interest]);

  const formatDate = (date: Date) => {
    if (country === 'ro') {
      const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const { data: dbArticles } = useScrapedArticles(country);

  const articles = [...config.articles, ...(dbArticles || [])];

  const websites: Website[] = config.websites.map(w => ({
    ...w,
    articleCount: w.id === 'all' ? articles.length : articles.filter(a => a.source === w.id).length,
  }));

  const getFilteredArticles = () => {
    let filtered = articles;
    if (selectedWebsite !== 'all') filtered = filtered.filter(a => a.source === selectedWebsite);
    if (selectedDate) filtered = filtered.filter(a => a.date === formatDate(selectedDate));
    filtered = filterArticles(filtered, searchTerm, documentType, subject);
    if (interest) {
      const normalizedInterest = removeDiacritics(interest.toLowerCase());
      filtered = filtered.filter(a =>
        a.interests.some(i => removeDiacritics(i.toLowerCase()).includes(normalizedInterest)) ||
        removeDiacritics(a.title.toLowerCase()).includes(normalizedInterest) ||
        removeDiacritics(a.originalContent.toLowerCase()).includes(normalizedInterest) ||
        removeDiacritics(a.simplifiedContent.toLowerCase()).includes(normalizedInterest)
      );
    }
    return filtered;
  };

  const sortedArticles = useMemo(() => {
    const filtered = getFilteredArticles();
    return [...filtered].sort((a, b) => {
      const aU = a.tags.includes('urgent'), bU = b.tags.includes('urgent');
      if (aU !== bU) return aU ? -1 : 1;
      const aN = a.tags.includes('new'), bN = b.tags.includes('new');
      if (aN !== bN) return aN ? -1 : 1;
      return 0;
    });
  }, [config, selectedWebsite, selectedDate, searchTerm, documentType, subject, interest, dbArticles]);

  const totalPages = Math.ceil(sortedArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = sortedArticles.slice(
    currentPage * ARTICLES_PER_PAGE,
    (currentPage + 1) * ARTICLES_PER_PAGE
  );

  const hasActiveFilters = searchTerm !== "" || documentType !== "all" || subject !== "all" || interest !== "";

  const clearAllFilters = () => {
    setSearchTerm(""); setDocumentType("all"); setSubject("all"); setSelectedDate(undefined); setSelectedWebsite("all"); setInterest("");
  };

  const renderTextWithTooltips = (text: string) => {
    if (country !== 'ro') return <span>{text}</span>;
    const parts = highlightLegalTerms(text);
    return parts.map((part, index) => {
      if (React.isValidElement(part) && part.props['data-term']) {
        return <LegalTermTooltip key={index} term={part.props['data-term']}>{part.props.children}</LegalTermTooltip>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const labels = config.labels;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <CountrySwitcher country={country} onCountryChange={setCountry} />
          <ThemeToggle />
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Friendly GOV {config.flag}
            </h1>
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{labels.subtitle}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {labels.lastUpdate}: {lastUpdateTime}
          </div>
        </div>

        <SearchAndFilters
          searchTerm={searchTerm} onSearchChange={setSearchTerm}
          documentType={documentType} onDocumentTypeChange={setDocumentType}
          subject={subject} onSubjectChange={setSubject}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters || selectedDate !== undefined || selectedWebsite !== 'all'}
          labels={labels} documentTypes={config.documentTypes} subjects={config.subjects}
          interest={interest} onInterestChange={setInterest} interestSuggestions={config.interests}
        />

        <Card className="border-2 border-border shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary to-accent-foreground text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{labels.sources}</CardTitle>
            <CardDescription className="text-primary-foreground/70">{labels.sourcesDesc}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <WebsiteMenu selectedWebsite={selectedWebsite} onWebsiteChange={setSelectedWebsite} websites={websites} />
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate) : (country === 'ro' ? 'Alege data' : 'Pick a date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                {selectedDate && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>{labels.reset}</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                {labels.articles}
                {selectedWebsite !== 'all' && <span className="ml-2 text-lg text-muted-foreground">- {websites.find(w => w.id === selectedWebsite)?.name}</span>}
                {selectedDate && <span className="ml-2 text-lg text-muted-foreground">- {formatDate(selectedDate)}</span>}
              </h2>
              <Badge variant="outline" className="ml-2">{labels.articleCount(sortedArticles.length)}</Badge>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {paginatedArticles.map(article => {
              const sourceWebsite = websites.find(w => w.id === article.source);
              const hasUrgent = article.tags.includes('urgent');
              return (
                <Card key={article.id} className={cn(
                  'transition-all duration-300 hover:shadow-xl border',
                  hasUrgent && 'border-2 border-destructive shadow-lg bg-destructive/5',
                  !hasUrgent && article.tags.includes('new') && 'border-2 border-green-400 dark:border-green-600 shadow-lg bg-green-50/50 dark:bg-green-950/20',
                  !hasUrgent && !article.tags.includes('new') && 'border-border'
                )}>
                  <CardHeader>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-sm">{sourceWebsite?.emoji} {sourceWebsite?.name}</Badge>
                        <Badge variant="secondary" className="text-sm"><Tag className="h-3 w-3 mr-1" />{article.categoryEmoji} {article.categoryName}</Badge>
                        {article.tags.map(tag => <ArticleTagBadge key={tag} tag={tag} labels={labels} />)}
                      </div>
                      <Link to={`/article/${article.id}`}>
                        <CardTitle className="text-lg text-foreground leading-tight hover:text-primary transition-colors cursor-pointer">{renderTextWithTooltips(article.title)}</CardTitle>
                      </Link>
                      <CardDescription className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" />{article.date}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-1"><FileText className="h-4 w-4" />{labels.originalContent}</h4>
                      <ScrollArea className="h-20 w-full border rounded p-3 bg-muted/50">
                        <p className="text-sm text-muted-foreground">{renderTextWithTooltips(article.originalContent)}</p>
                      </ScrollArea>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4" />{labels.simplified}</h4>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{article.simplifiedContent}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4 text-primary" />{labels.keyPoints}</h4>
                      <div className="space-y-2">
                        {article.detailedPoints.map((point, i) => (
                          <div key={i} className="p-3 bg-secondary/50 rounded-lg border border-border">
                            <p className="text-sm text-foreground leading-relaxed">• {point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(article.url, '_blank')} className="w-full">
                        <Globe className="mr-2 h-4 w-4" />{labels.viewOriginal}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {country === 'ro' ? 'Anterior' : 'Previous'}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                {country === 'ro' ? 'Următor' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {sortedArticles.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">{labels.noArticles}</h3>
              <p className="text-muted-foreground">{labels.noArticlesDesc}</p>
            </div>
          )}
        </div>

        <NewsletterSignup interests={config.interests} country={country} />
      </div>
    </div>
  );
};

export default Index;
