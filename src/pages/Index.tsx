
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Globe, Sparkles, RefreshCw, FileText, Calendar, Tag, Building, Shield, Hospital } from "lucide-react";
import { toast } from "sonner";
import WebsiteMenu from "@/components/WebsiteMenu";

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
  source: string; // Added source field
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
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Website configurations
  const websites: Website[] = [
    {
      id: 'all',
      name: 'Toate Sursele',
      emoji: '📋',
      description: 'Toate articolele din toate sursele',
      icon: FileText,
      articleCount: 0
    },
    {
      id: 'gov',
      name: 'Guvernul României',
      emoji: '🏛️',
      description: 'Hotărâri și decizii guvernamentale',
      icon: Building,
      articleCount: 0
    },
    {
      id: 'mai',
      name: 'Min. Afacerilor Interne',
      emoji: '🛡️',
      description: 'Comunicate despre securitate și ordine publică',
      icon: Shield,
      articleCount: 0
    },
    {
      id: 'ms',
      name: 'Min. Sănătății',
      emoji: '🏥',
      description: 'Informații despre sănătate publică',
      icon: Hospital,
      articleCount: 0
    }
  ];

  // Mock data with enhanced details and multiple sources
  const mockArticles: ScrapedArticle[] = [
    {
      id: "sed_04_Iun",
      date: "4 iunie 2025",
      title: "Informație de presă privind actele normative adoptate",
      originalContent: "Guvernul României a adoptat în ședința din 4 iunie 2025 mai multe acte normative importante pentru dezvoltarea economică și socială a țării. Au fost aprobate măsuri pentru sprijinirea agriculturii, bugetul pentru infrastructură și noi reglementări pentru protecția mediului.",
      simplifiedContent: "Astăzi, echipa care conduce țara noastră s-a întâlnit și a hotărât lucruri foarte importante! Au făcut reguli noi care ne vor ajuta pe toți să trăim mai bine. Au gândit cum să ajute fermierii, să facă drumuri mai frumoase și să păstreze natura curată! 🚜💰🌱",
      detailedPoints: [
        "Au hotărât să construiască un drum nou în jurul orașului Botoșani ca să nu mai fie aglomerat centrul! 🛣️💰",
        "Au planuit să construiască o casă nouă pentru pompierii care ne salvează când avem probleme! 🚒👨‍🚒",
        "Au decis să dea mai mulți bani fermierilor ca să poată crește legume și fructe mai frumoase! 🚜🥕",
        "Au făcut reguli noi ca să păstrăm aerul curat și natura verde! 🌳🌱",
        "Au hotărât cum să cheltuie banii țării pentru lucruri importante care ne ajută pe toți! 💰📊",
        "Au planuit să facă școlile și mai frumoase pentru toți copiii! 🎓📚"
      ],
      category: "infrastructure",
      categoryEmoji: "🛣️",
      categoryName: "Infrastructură",
      url: "https://gov.ro/ro/guvernul/sedinte-guvern/informatie-de-presa-privind-actele-normative-adoptate-in-cadrul-edintei-guvernului-romaniei-din-4-iunie-2025",
      isNew: true,
      source: "gov"
    },
    {
      id: "mai_05_Iun",
      date: "5 iunie 2025",
      title: "Participarea premierului interimar la emisiunea Ediție Specială",
      originalContent: "Premierul interimar Cătălin Predoiu a participat la emisiunea Ediție Specială de la Antena 3 CNN, unde a discutat despre măsurile de securitate și planurile ministerului pentru următoarea perioadă.",
      simplifiedContent: "Premierul nostru s-a dus la televizor să vorbească cu oamenii despre cum ne protejează și ce planuri are ca să fim toți în siguranță! A explicat cum lucrează cu poliția și pompierii pentru noi! 🛡️📺",
      detailedPoints: [
        "A vorbit despre cum poliția ne protejează în fiecare zi! 👮‍♂️🚔",
        "A explicat cum pompierii se pregătesc să ne salveze când avem probleme! 🚒👨‍🚒",
        "A spus că vor face mai multe exerciții ca să fie gata să ne ajute! 🏃‍♂️💪",
        "A promis că vor avea echipamente noi și mai bune! 🎒⚡"
      ],
      category: "defense",
      categoryEmoji: "🛡️",
      categoryName: "Apărare și Securitate",
      url: "https://www.mai.gov.ro/participarea-premierului-interimar-catalin-predoiu-la-emisiunea-editie-speciala-antena-3-cnn/",
      isNew: false,
      source: "mai"
    },
    {
      id: "ms_05_Iun",
      date: "5 iunie 2025", 
      title: "Noi măsuri pentru îmbunătățirea serviciilor medicale",
      originalContent: "Ministerul Sănătății anunță implementarea unor noi măsuri pentru îmbunătățirea calității serviciilor medicale în spitalele din România, inclusiv modernizarea echipamentelor și pregătirea personalului medical.",
      simplifiedContent: "Doctorii vor avea aparate noi și mai bune ca să ne poată ajuta mai repede când suntem bolnavi! Vor învăța lucruri noi ca să știe să ne îngrijească și mai bine! 🏥👩‍⚕️",
      detailedPoints: [
        "Vor cumpăra aparate noi pentru spitale ca să ne vindece mai repede! 🏥⚡",
        "Doctorii vor învăța să folosească tehnologii noi! 👩‍⚕️💻",
        "Vor face spitalele mai frumoase și mai curate! ✨🧼",
        "Vor fi mai multe medicamente pentru copii! 💊👶"
      ],
      category: "health",
      categoryEmoji: "🏥",
      categoryName: "Sănătate",
      url: "https://www.ms.ro/ro/informatii-de-interes-public/noutati/masuri-servicii-medicale",
      isNew: true,
      source: "ms"
    }
  ];

  // Update article counts
  const updateWebsiteArticleCounts = (articles: ScrapedArticle[]) => {
    return websites.map(website => ({
      ...website,
      articleCount: website.id === 'all' 
        ? articles.length 
        : articles.filter(article => article.source === website.id).length
    }));
  };

  // Filter articles based on selected website
  const filteredArticles = selectedWebsite === 'all' 
    ? articles 
    : articles.filter(article => article.source === selectedWebsite);

  const websitesWithCounts = updateWebsiteArticleCounts(articles);

  useEffect(() => {
    setArticles(mockArticles);
    setLastCheckTime(new Date().toLocaleString('ro-RO'));
  }, []);

  const handleManualScrape = async () => {
    setIsLoading(true);
    toast.info("Începe căutarea de articole noi din toate sursele...");
    
    // Simulate scraping process
    setTimeout(() => {
      const hasNewArticle = Math.random() > 0.6; // 40% chance of new article
      
      if (hasNewArticle) {
        const sources = ['gov', 'mai', 'ms'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        
        const sourceConfig = {
          gov: { emoji: '🏛️', name: 'Guvernul României', categories: ['infrastructure', 'budget', 'agriculture'] },
          mai: { emoji: '🛡️', name: 'Min. Afacerilor Interne', categories: ['defense', 'law'] },
          ms: { emoji: '🏥', name: 'Min. Sănătății', categories: ['health'] }
        };
        
        const config = sourceConfig[randomSource];
        const randomCategory = config.categories[Math.floor(Math.random() * config.categories.length)];
        
        const categoryData = {
          infrastructure: { emoji: '🛣️', name: 'Infrastructură' },
          budget: { emoji: '💰', name: 'Buget și Finanțe' },
          agriculture: { emoji: '🚜', name: 'Agricultură' },
          defense: { emoji: '🛡️', name: 'Apărare și Securitate' },
          law: { emoji: '⚖️', name: 'Legi și Justiție' },
          health: { emoji: '🏥', name: 'Sănătate' }
        };
        
        const newPoints = [
          "Au hotărât să planteze mai mulți copaci în parcuri pentru aer curat! 🌳🌿",
          "Vor face mai multe locuri de joacă pentru copii în fiecare oraș! 🎠🛝",
          "Au decis să ajute animalele să aibă case mai frumoase în zoo! 🐕🏠",
          "Vor construi o bibliotecă mare cu multe cărți pentru copii! 📚📖"
        ];
        
        const newArticle: ScrapedArticle = {
          id: `${randomSource}_06_Iun`,
          date: "6 iunie 2025",
          title: `Nouă decizie de la ${config.name}`,
          originalContent: `${config.name} a adoptat o nouă hotărâre privind dezvoltarea și îmbunătățirea serviciilor...`,
          simplifiedContent: `${config.name} a luat o decizie nouă și importantă! ${config.emoji} Este ca și cum ar fi inventat o regulă nouă ca să ne ajute pe toți să fim mai fericiți! 🎉✨`,
          detailedPoints: newPoints,
          category: randomCategory,
          categoryEmoji: categoryData[randomCategory].emoji,
          categoryName: categoryData[randomCategory].name,
          url: `https://example.com/${randomSource}/noua-decizie-06-iunie`,
          isNew: true,
          source: randomSource
        };
        
        setArticles(prev => [newArticle, ...prev.map(a => ({ ...a, isNew: false }))]);
        toast.success(`Articol nou găsit de la ${config.name}!`);
      } else {
        toast.info("Nu au fost găsite articole noi din nicio sursă.");
      }
      
      setLastCheckTime(new Date().toLocaleString('ro-RO'));
      setIsLoading(false);
    }, 3000);
  };

  const toggleAutoScraping = () => {
    setIsScrapingActive(!isScrapingActive);
    if (!isScrapingActive) {
      toast.success("Monitorizarea automată activată pentru toate sursele!");
    } else {
      toast.info("Monitorizarea automată oprită.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
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
        </div>

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
            <WebsiteMenu
              selectedWebsite={selectedWebsite}
              onWebsiteChange={setSelectedWebsite}
              websites={websitesWithCounts}
            />
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Panou de Control
            </CardTitle>
            <CardDescription className="text-blue-100">
              Controlează procesul de monitorizare și procesare
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button 
                onClick={handleManualScrape} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Caut articole noi...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Verifică Toate Sursele
                  </>
                )}
              </Button>
              
              <Button 
                onClick={toggleAutoScraping}
                variant={isScrapingActive ? "destructive" : "outline"}
              >
                {isScrapingActive ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Oprește Monitorizarea
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Activează Monitorizarea Zilnică
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Ultima verificare: {lastCheckTime}
              </div>
              
              <Badge variant={isScrapingActive ? "default" : "secondary"} className="ml-auto">
                {isScrapingActive ? "ACTIV" : "INACTIV"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Articles Display */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Articole Procesate
              {selectedWebsite !== 'all' && (
                <span className="ml-2 text-lg text-gray-600">
                  - {websitesWithCounts.find(w => w.id === selectedWebsite)?.name}
                </span>
              )}
            </h2>
            <Badge variant="outline" className="ml-2">
              {filteredArticles.length} {selectedWebsite === 'all' ? 'total' : 'din această sursă'}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {filteredArticles.map((article) => {
              const sourceWebsite = websites.find(w => w.id === article.source);
              return (
                <Card key={article.id} className={`transition-all duration-300 hover:shadow-xl ${
                  article.isNew ? 'border-2 border-green-400 shadow-lg bg-green-50' : 'border border-gray-200'
                }`}>
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
                          {article.isNew && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              NOU!
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg text-gray-800 leading-tight">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
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
                        <p className="text-sm text-gray-600">{article.originalContent}</p>
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
                        {article.detailedPoints.map((point, index) => (
                          <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-800 leading-relaxed">• {point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(article.url, '_blank')}
                        className="w-full"
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Vezi Articolul Original
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Technical Info */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Informații Tehnice</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p><strong>🏛️ GOV.RO:</strong></p>
                <p>URL: https://gov.ro/ro/guvernul/sedinte-guvern</p>
                <p>Selector: div.sedinte_lista</p>
                <p>Conținut: div.pageDescription</p>
              </div>
              <div className="space-y-2">
                <p><strong>🛡️ MAI.GOV.RO:</strong></p>
                <p>URL: https://www.mai.gov.ro/category/comunicate-de-presa/</p>
                <p>Selector: .excerpt-big-article</p>
                <p>Link: .title-big-article a</p>
              </div>
              <div className="space-y-2">
                <p><strong>🏥 MS.RO:</strong></p>
                <p>URL: https://www.ms.ro/ro/informatii-de-interes-public/noutati/</p>
                <p>Selector: .news-list article</p>
                <p>Link: h3 a, .title a</p>
              </div>
            </div>
            <Separator className="my-4" />
            <p><strong>Frecvența de Verificare:</strong> Zilnic la 09:00 pentru toate sursele</p>
            <p><strong>AI Model:</strong> GPT pentru simplificarea textului către limbaj pentru copii</p>
            <p><strong>Categorizare:</strong> Automată pe baza cuvintelor cheie specifice fiecărei surse</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
