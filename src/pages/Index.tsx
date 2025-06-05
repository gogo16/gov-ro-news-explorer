
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Globe, Sparkles, RefreshCw, FileText, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";

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
}

const Index = () => {
  const [articles, setArticles] = useState<ScrapedArticle[]>([]);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data with enhanced details and categorization
  const mockArticles: ScrapedArticle[] = [
    {
      id: "sed_04_Iun",
      date: "4 iunie 2025",
      title: "Informație de presă privind actele normative adoptate",
      originalContent: "Guvernul României a adoptat în ședința din 4 iunie 2025 mai multe acte normative importante pentru dezvoltarea economică și socială a țării. Au fost aprobate măsuri pentru sprijinirea agriculturii, bugetul pentru infrastructură și noi reglementări pentru protecția mediului.",
      simplifiedContent: "Astăzi, echipa care conduce țara noastră s-a întâlnit și a hotărât lucruri foarte importante! Au făcut reguli noi care ne vor ajuta pe toți să trăim mai bine. Au gândit cum să ajute fermierii, să facă drumuri mai frumoase și să păstreze natura curată! 🚜💰🌱",
      detailedPoints: [
        "Au hotărât să dea mai mulți bani fermierilor ca să poată crește legume și fructe mai frumoase 🥕",
        "Au planuit să construiască drumuri noi și să repare cele vechi ca să mergem mai ușor cu mașina 🛣️",
        "Au făcut reguli noi ca să păstrăm aerul curat și natura verde 🌳",
        "Au decis să ajute familiile cu copii să aibă mai mulți bani pentru mâncare și haine 👨‍👩‍👧‍👦"
      ],
      category: "budget",
      categoryEmoji: "💰",
      categoryName: "Buget și Finanțe",
      url: "https://gov.ro/ro/guvernul/sedinte-guvern/informatie-de-presa-privind-actele-normative-adoptate-in-cadrul-edintei-guvernului-romaniei-din-4-iunie-2025",
      isNew: true
    },
    {
      id: "sed_03_Iun",
      date: "3 iunie 2025",
      title: "Măsuri pentru îmbunătățirea sistemului de educație",
      originalContent: "În ședința precedentă au fost discutate aspecte referitoare la modernizarea sistemului de învățământ, construirea de noi școli și pregătirea profesorilor.",
      simplifiedContent: "Ieri, echipa care conduce țara a vorbit despre cum să facă școlile și mai frumoase pentru toți copiii! Au planuit să construiască școli noi și să îi ajute pe profesori să predea și mai bine! 🎓📚",
      detailedPoints: [
        "Vor construi școli noi cu săli de clasă mari și frumoase 🏫",
        "Vor cumpăra calculatoare și cărți noi pentru toate școlile 💻",
        "Vor ajuta profesorii să învețe lucruri noi ca să ne predea și mai bine 👩‍🏫",
        "Vor face parcuri de joacă mai mari în curtea școlilor 🛝"
      ],
      category: "education",
      categoryEmoji: "🎓",
      categoryName: "Educație",
      url: "https://gov.ro/ro/guvernul/sedinte-guvern/informatii-sedinta-03-iunie",
      isNew: false
    }
  ];

  useEffect(() => {
    setArticles(mockArticles);
    setLastCheckTime(new Date().toLocaleString('ro-RO'));
  }, []);

  const handleManualScrape = async () => {
    setIsLoading(true);
    toast.info("Începe căutarea de articole noi...");
    
    // Simulate scraping process
    setTimeout(() => {
      const hasNewArticle = Math.random() > 0.7; // 30% chance of new article
      
      if (hasNewArticle) {
        const categories = ['agriculture', 'health', 'infrastructure', 'environment'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const categoryData = {
          agriculture: { emoji: '🚜', name: 'Agricultură' },
          health: { emoji: '🏥', name: 'Sănătate' },
          infrastructure: { emoji: '🛣️', name: 'Infrastructură' },
          environment: { emoji: '🌱', name: 'Mediu' }
        };
        
        const newArticle: ScrapedArticle = {
          id: "sed_05_Iun",
          date: "5 iunie 2025",
          title: "Nouă decizie guvernamentală adoptată",
          originalContent: "Guvernul a adoptat o nouă hotărâre privind dezvoltarea durabilă...",
          simplifiedContent: "Echipa care conduce țara a luat o decizie nouă și importantă! Este ca și cum ar fi inventat o regulă nouă ca să ne ajute pe toți! 🎉",
          detailedPoints: [
            "Au hotărât să planteze mai mulți copaci în parcuri 🌳",
            "Vor face mai multe locuri de joacă pentru copii 🎠",
            "Au decis să ajute animalele să aibă case mai frumoase 🐕"
          ],
          category: randomCategory,
          categoryEmoji: categoryData[randomCategory].emoji,
          categoryName: categoryData[randomCategory].name,
          url: "https://gov.ro/ro/guvernul/sedinte-guvern/noua-decizie-05-iunie",
          isNew: true
        };
        
        setArticles(prev => [newArticle, ...prev.map(a => ({ ...a, isNew: false }))]);
        toast.success("Articol nou găsit și procesat!");
      } else {
        toast.info("Nu au fost găsite articole noi.");
      }
      
      setLastCheckTime(new Date().toLocaleString('ro-RO'));
      setIsLoading(false);
    }, 3000);
  };

  const toggleAutoScraping = () => {
    setIsScrapingActive(!isScrapingActive);
    if (!isScrapingActive) {
      toast.success("Monitorizarea automată activată! Voi verifica zilnic.");
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
            Monitorizez zilnic site-ul guvernului pentru articole noi și le transform în povești ușor de înțeles pentru copii! 
          </p>
        </div>

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
                    Verifică Manual
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
            <h2 className="text-2xl font-bold text-gray-800">Articole Procesate</h2>
            <Badge variant="outline" className="ml-2">
              {articles.length} total
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {articles.map((article) => (
              <Card key={article.id} className={`transition-all duration-300 hover:shadow-xl ${
                article.isNew ? 'border-2 border-green-400 shadow-lg bg-green-50' : 'border border-gray-200'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
            ))}
          </div>
        </div>

        {/* Technical Info */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Informații Tehnice</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p><strong>URL Monitorizat:</strong> https://gov.ro/ro/guvernul/sedinte-guvern</p>
            <p><strong>Selector CSS:</strong> div.sedinte_lista (pentru identificarea articolelor noi)</p>
            <p><strong>Frecvența de Verificare:</strong> Zilnic la 09:00</p>
            <p><strong>AI Model:</strong> GPT pentru simplificarea textului către limbaj pentru copii</p>
            <p><strong>Categorizare:</strong> Automată pe baza cuvintelor cheie</p>
            <p><strong>Stocare:</strong> Local storage cu backup în cloud</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
