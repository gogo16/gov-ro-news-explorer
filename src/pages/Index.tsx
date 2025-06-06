import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Globe, Sparkles, FileText, Calendar as CalendarIcon, Tag, Building, Shield, Hospital } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import WebsiteMenu from "@/components/WebsiteMenu";
import SearchAndFilters from "@/components/SearchAndFilters";
import LegalTermTooltip from "@/components/LegalTermTooltip";
import { filterArticles, highlightLegalTerms } from "@/utils/textProcessing";
interface ScrapedArticle {
  id: string;
  date: string;
  title: string;
  originalContent: string;
  simplifiedContent: string;
  detailedPoints: string[];
  category: string;
  categoryEmoji: string;
  categoryName: string;
  url: string;
  isNew: boolean;
  source: string;
}
interface Website {
  id: string;
  name: string;
  emoji: string;
  description: string;
  icon: React.ComponentType<any>;
  articleCount: number;
}
const Index = () => {
  const [articles, setArticles] = useState<ScrapedArticle[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");

  // New search and filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");

  // Romanian date formatter
  const formatRomanianDate = (date: Date) => {
    const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Website configurations
  const websites: Website[] = [{
    id: 'all',
    name: 'Toate Sursele',
    emoji: '📋',
    description: 'Toate articolele din toate sursele',
    icon: FileText,
    articleCount: 0
  }, {
    id: 'gov',
    name: 'Guvernul României',
    emoji: '🏛️',
    description: 'Hotărâri și decizii guvernamentale',
    icon: Building,
    articleCount: 0
  }, {
    id: 'mai',
    name: 'Min. Afacerilor Interne',
    emoji: '🛡️',
    description: 'Comunicate despre securitate și ordine publică',
    icon: Shield,
    articleCount: 0
  }, {
    id: 'ms',
    name: 'Min. Sănătății',
    emoji: '🏥',
    description: 'Informații despre sănătate publică',
    icon: Hospital,
    articleCount: 0
  }];

  // Extended mock data with multiple dates
  const mockArticles: ScrapedArticle[] = [{
    id: "sed_05_Iun",
    date: "5 iunie 2025",
    title: "Informație de presă privind actele normative adoptate",
    originalContent: "Guvernul României a adoptat în ședința din 5 iunie 2025 mai multe acte normative importante pentru dezvoltarea economică și socială a țării. Au fost aprobate măsuri pentru sprijinirea agriculturii, bugetul pentru infrastructură și noi reglementări pentru protecția mediului.",
    simplifiedContent: "Astăzi, echipa care conduce țara noastră s-a întâlnit și a hotărât lucruri foarte importante! Au făcut reguli noi care ne vor ajuta pe toți să trăim mai bine. Au gândit cum să ajute fermierii, să facă drumuri mai frumoase și să păstreze natura curată! 🚜💰🌱",
    detailedPoints: ["Au hotărât să construiască un drum nou în jurul orașului Botoșani ca să nu mai fie aglomerat centrul! 🛣️💰", "Au planuit să construiască o casă nouă pentru pompierii care ne salvează când avem probleme! 🚒👨‍🚒", "Au decis să dea mai mulți bani fermierilor ca să poată crește legume și fructe mai frumoase! 🚜🥕"],
    category: "infrastructure",
    categoryEmoji: "🛣️",
    categoryName: "Infrastructură",
    url: "https://gov.ro/ro/guvernul/sedinte-guvern/informatie-de-presa-privind-actele-normative-adoptate-in-cadrul-edintei-guvernului-romaniei-din-5-iunie-2025",
    isNew: true,
    source: "gov"
  }, {
    id: "mai_05_Iun",
    date: "5 iunie 2025",
    title: "Participarea premierului interimar la emisiunea Ediție Specială",
    originalContent: "Premierul interimar Cătălin Predoiu a participat la emisiunea Ediție Specială de la Antena 3 CNN, unde a discutat despre măsurile de securitate și planurile ministerului pentru următoarea perioadă.",
    simplifiedContent: "Premierul nostru s-a dus la televizor să vorbească cu oamenii despre cum ne protejează și ce planuri are ca să fim toți în siguranță! A explicat cum lucrează cu poliția și pompierii pentru noi! 🛡️📺",
    detailedPoints: ["A vorbit despre cum poliția ne protejează în fiecare zi! 👮‍♂️🚔", "A explicat cum pompierii se pregătesc să ne salveze când avem probleme! 🚒👨‍🚒"],
    category: "defense",
    categoryEmoji: "🛡️",
    categoryName: "Apărare și Securitate",
    url: "https://www.mai.gov.ro/participarea-premierului-interimar-catalin-predoiu-la-emisiunea-editie-speciala-antena-3-cnn/",
    isNew: true,
    source: "mai"
  }, {
    id: "ms_04_Iun",
    date: "4 iunie 2025",
    title: "Noi măsuri pentru îmbunătățirea serviciilor medicale",
    originalContent: "Ministerul Sănătății anunță implementarea unor noi măsuri pentru îmbunătățirea calității serviciilor medicale în spitalele din România, inclusiv modernizarea echipamentelor și pregătirea personalului medical.",
    simplifiedContent: "Doctorii vor avea aparate noi și mai bune ca să ne poată ajuta mai repede când suntem bolnavi! Vor învăța lucruri noi ca să știe să ne îngrijească și mai bine! 🏥👩‍⚕️",
    detailedPoints: ["Vor cumpăra aparate noi pentru spitale ca să ne vindece mai repede! 🏥⚡", "Doctorii vor învăța să folosească tehnologii noi! 👩‍⚕️💻"],
    category: "health",
    categoryEmoji: "🏥",
    categoryName: "Sănătate",
    url: "https://www.ms.ro/ro/informatii-de-interes-public/noutati/masuri-servicii-medicale",
    isNew: false,
    source: "ms"
  }, {
    id: "gov_03_Iun",
    date: "3 iunie 2025",
    title: "Hotărâre privind bugetul pentru educație",
    originalContent: "Guvernul a aprobat suplimentarea bugetului pentru educație cu 50 milioane lei pentru modernizarea școlilor din mediul rural.",
    simplifiedContent: "Echipa care conduce țara a hotărât să dea mai mulți bani pentru școli! Vor face școlile din sate mai frumoase și mai moderne! 🎓💰",
    detailedPoints: ["Vor repara și moderniza școlile din sate! 🏫✨", "Vor cumpăra calculatoare noi pentru copii! 💻📚"],
    category: "education",
    categoryEmoji: "🎓",
    categoryName: "Educație",
    url: "https://gov.ro/ro/guvernul/sedinte-guvern/hotarare-buget-educatie",
    isNew: false,
    source: "gov"
  }];

  // Update article counts
  const updateWebsiteArticleCounts = (articles: ScrapedArticle[]) => {
    return websites.map(website => ({
      ...website,
      articleCount: website.id === 'all' ? articles.length : articles.filter(article => article.source === website.id).length
    }));
  };

  // Enhanced filter function
  const getFilteredArticles = () => {
    let filtered = articles;

    // Website filter
    if (selectedWebsite !== 'all') {
      filtered = filtered.filter(article => article.source === selectedWebsite);
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(article => article.date === formatRomanianDate(selectedDate));
    }

    // Search and advanced filters
    filtered = filterArticles(filtered, searchTerm, documentType, subject);
    return filtered;
  };
  const filteredArticles = getFilteredArticles();

  // Sort articles to show new ones first
  const sortedArticles = filteredArticles.sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return 0;
  });
  const websitesWithCounts = updateWebsiteArticleCounts(articles);

  // Check if there are active filters
  const hasActiveFilters = searchTerm !== "" || documentType !== "all" || subject !== "all";

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm("");
    setDocumentType("all");
    setSubject("all");
    setSelectedDate(undefined);
    setSelectedWebsite("all");
  };

  // Function to render text with legal term tooltips
  const renderTextWithTooltips = (text: string) => {
    const parts = highlightLegalTerms(text);
    return parts.map((part, index) => {
      if (React.isValidElement(part) && part.props['data-term']) {
        const term = part.props['data-term'];
        return <LegalTermTooltip key={index} term={term}>
            {part.props.children}
          </LegalTermTooltip>;
      }
      return <span key={index}>{part}</span>;
    });
  };
  useEffect(() => {
    setArticles(mockArticles);
    setLastUpdateTime(new Date().toLocaleString('ro-RO'));

    // Auto-refresh every 24 hours
    const interval = setInterval(() => {
      // Simulate checking for new articles
      const hasNewArticle = Math.random() > 0.7; // 30% chance of new article

      if (hasNewArticle) {
        const sources = ['gov', 'mai', 'ms'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const newArticle: ScrapedArticle = {
          id: `${randomSource}_${Date.now()}`,
          date: formatRomanianDate(new Date()),
          title: `Nouă decizie din ${formatRomanianDate(new Date())}`,
          originalContent: `Nouă hotărâre adoptată astăzi...`,
          simplifiedContent: `Astăzi s-a hotărât ceva nou și important! 🎉✨`,
          detailedPoints: ["Au luat o decizie nouă care ne ajută pe toți! 🌟"],
          category: "general",
          categoryEmoji: "🏛️",
          categoryName: "General",
          url: `https://example.com/${randomSource}/noua-decizie`,
          isNew: true,
          source: randomSource
        };
        setArticles(prev => [newArticle, ...prev.map(a => ({
          ...a,
          isNew: false
        }))]);
        toast.success("Articole noi disponibile!");
      }
      setLastUpdateTime(new Date().toLocaleString('ro-RO'));
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(interval);
  }, []);
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Romanian Government Scraper
            </h1>
            <Sparkles className="h-10 w-10 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitorizez zilnic site-urile guvernamentale pentru articole noi și le transform în povești ușor de înțeles pentru copii! 
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            Ultima actualizare: {lastUpdateTime}
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} documentType={documentType} onDocumentTypeChange={setDocumentType} subject={subject} onSubjectChange={setSubject} onClearFilters={clearAllFilters} hasActiveFilters={hasActiveFilters || selectedDate !== undefined || selectedWebsite !== 'all'} />

        {/* Website Menu */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Surse de Informații
            </CardTitle>
            <CardDescription className="text-purple-100">
              Selectează sursa de informații pe care vrei să o vezi
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <WebsiteMenu selectedWebsite={selectedWebsite} onWebsiteChange={setSelectedWebsite} websites={websitesWithCounts} />
              
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                
                {selectedDate && <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
                    Resetează
                  </Button>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Display */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Articole
              {selectedWebsite !== 'all' && <span className="ml-2 text-lg text-gray-600">
                  - {websitesWithCounts.find(w => w.id === selectedWebsite)?.name}
                </span>}
              {selectedDate && <span className="ml-2 text-lg text-gray-600">
                  - {formatRomanianDate(selectedDate)}
                </span>}
            </h2>
            <Badge variant="outline" className="ml-2">
              {sortedArticles.length} articole
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {sortedArticles.map(article => {
            const sourceWebsite = websites.find(w => w.id === article.source);
            return <Card key={article.id} className={`transition-all duration-300 hover:shadow-xl ${article.isNew ? 'border-2 border-green-400 shadow-lg bg-green-50' : 'border border-gray-200'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className="text-sm">
                            {sourceWebsite?.emoji} {sourceWebsite?.name}
                          </Badge>
                          <Badge variant="secondary" className="text-sm">
                            <Tag className="h-3 w-3 mr-1" />
                            {article.categoryEmoji} {article.categoryName}
                          </Badge>
                          {article.isNew && <Badge className="bg-green-500 hover:bg-green-600">
                              NOU!
                            </Badge>}
                        </div>
                        <CardTitle className="text-lg text-gray-800 leading-tight">
                          {renderTextWithTooltips(article.title)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {article.date}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Conținut Original:
                      </h4>
                      <ScrollArea className="h-20 w-full border rounded p-3 bg-gray-50">
                        <p className="text-sm text-gray-600">
                          {renderTextWithTooltips(article.originalContent)}
                        </p>
                      </ScrollArea>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        Gata de Citit:
                      </h4>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 leading-relaxed mb-3">{article.simplifiedContent}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        Puncte Importante:
                      </h4>
                      <div className="space-y-2">
                        {article.detailedPoints.map((point, index) => <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-800 leading-relaxed">• {point}</p>
                          </div>)}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(article.url, '_blank')} className="w-full">
                        <Globe className="mr-2 h-4 w-4" />
                        Vezi Articolul Original
                      </Button>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>

          {sortedArticles.length === 0 && <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nu sunt articole disponibile</h3>
              <p className="text-gray-500">
                Nu au fost găsite articole pentru criteriile selectate. Încercați să modificați filtrele.
              </p>
            </div>}
        </div>
      </div>
    </div>;
};
export default Index;