import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Globe, Sparkles, FileText, Calendar as CalendarIcon, Tag, Edit, Trash2, Plus, LogOut, Check, X, Pencil, Settings, RefreshCw, Loader2, Zap } from "lucide-react";
import { useTriggerScrape, useScrapedArticles, useLatestScrapeRun } from "@/hooks/useScrapedArticles";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import WebsiteMenu from "@/components/WebsiteMenu";
import SearchAndFilters from "@/components/SearchAndFilters";
import LegalTermTooltip from "@/components/LegalTermTooltip";
import InterestFilter from "@/components/InterestFilter";
import CountrySwitcher from "@/components/CountrySwitcher";
import ArticleTagBadge from "@/components/ArticleTagBadge";
import { filterArticles, highlightLegalTerms, removeDiacritics } from "@/utils/textProcessing";
import { Country, Website, ScrapedArticle, ArticleTag } from "@/data/countryConfig";
import { useAppData } from "@/context/AppDataContext";

// Inline editable text component
const EditableText: React.FC<{
  value: string;
  onSave: (val: string) => void;
  as?: 'input' | 'textarea';
  className?: string;
  children: React.ReactNode;
}> = ({ value, onSave, as = 'input', className, children }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  if (!editing) {
    return (
      <span className={cn("group relative inline-flex items-center gap-1 cursor-pointer rounded px-1 -mx-1 hover:bg-amber-100/60 transition-colors", className)} onClick={() => setEditing(true)}>
        {children}
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 text-amber-600 shrink-0 transition-opacity" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      {as === 'textarea' ? (
        <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="text-sm min-h-[60px]" autoFocus />
      ) : (
        <Input value={draft} onChange={e => setDraft(e.target.value)} className="text-sm h-8" autoFocus onKeyDown={e => { if (e.key === 'Enter') { onSave(draft); setEditing(false); } if (e.key === 'Escape') setEditing(false); }} />
      )}
      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => { onSave(draft); setEditing(false); }}><Check className="h-3 w-3" /></Button>
      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => setEditing(false)}><X className="h-3 w-3" /></Button>
    </span>
  );
};

const emptyArticle = (): Omit<ScrapedArticle, 'id'> => ({
  title: '', date: '', originalContent: '', simplifiedContent: '',
  detailedPoints: [''], category: '', categoryEmoji: '', categoryName: '',
  url: '', tags: [], source: '', interests: [],
});

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [country, setCountry] = useState<Country>('ro');
  const { toast } = useToast();
  const appData = useAppData();
  const config = useMemo(() => appData.getData(country), [appData, country]);

  // Page state (same as Index)
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [interest, setInterest] = useState<string>("");

  // Article dialog
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<Omit<ScrapedArticle, 'id'>>(emptyArticle());
  const [interestInput, setInterestInput] = useState('');

  // Management dialogs
  const [manageDialogOpen, setManageDialogOpen] = useState<'sources' | 'doctypes' | 'subjects' | 'interests' | 'texts' | null>(null);
  const [newItemInput, setNewItemInput] = useState('');
  const [newSourceEmoji, setNewSourceEmoji] = useState('');
  const [newSourceDesc, setNewSourceDesc] = useState('');

  useEffect(() => {
    if (localStorage.getItem('adminLoggedIn') === 'true') setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    setSelectedWebsite('all'); setSelectedDate(undefined); setSearchTerm(""); setDocumentType("all"); setSubject("all"); setInterest("");
    setLastUpdateTime(new Date().toLocaleString(config.dateLocale));
  }, [country]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      toast({ title: 'Welcome!', description: 'You are now in edit mode.' });
    } else {
      toast({ title: 'Login failed', description: 'Incorrect credentials', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    toast({ title: 'Logged out' });
  };

  const formatDate = (date: Date) => {
    if (country === 'ro') {
      const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const articles = config.articles;
  const sources = config.websites.filter(w => w.id !== 'all');

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
      const ni = removeDiacritics(interest.toLowerCase());
      filtered = filtered.filter(a =>
        a.interests.some(i => removeDiacritics(i.toLowerCase()).includes(ni)) ||
        removeDiacritics(a.title.toLowerCase()).includes(ni) ||
        removeDiacritics(a.originalContent.toLowerCase()).includes(ni) ||
        removeDiacritics(a.simplifiedContent.toLowerCase()).includes(ni)
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
  }, [config, selectedWebsite, selectedDate, searchTerm, documentType, subject, interest]);

  const hasActiveFilters = searchTerm !== "" || documentType !== "all" || subject !== "all" || interest !== "";
  const clearAllFilters = () => { setSearchTerm(""); setDocumentType("all"); setSubject("all"); setSelectedDate(undefined); setSelectedWebsite("all"); setInterest(""); };

  // Article form helpers
  const openNewArticle = () => { setEditingArticleId(null); setArticleForm(emptyArticle()); setArticleDialogOpen(true); };
  const openEditArticle = (article: ScrapedArticle) => { setEditingArticleId(article.id); const { id, ...rest } = article; setArticleForm({ ...rest }); setArticleDialogOpen(true); };
  const saveArticle = () => {
    if (!articleForm.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    if (editingArticleId) { appData.updateArticle(country, editingArticleId, articleForm); toast({ title: 'Article updated' }); }
    else { appData.addArticle(country, { id: `article_${Date.now()}`, ...articleForm }); toast({ title: 'Article added' }); }
    setArticleDialogOpen(false);
  };
  const toggleTag = (tag: ArticleTag) => setArticleForm(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag] }));
  const addDetailedPoint = () => setArticleForm(p => ({ ...p, detailedPoints: [...p.detailedPoints, ''] }));
  const updateDetailedPoint = (i: number, v: string) => setArticleForm(p => ({ ...p, detailedPoints: p.detailedPoints.map((pt, idx) => idx === i ? v : pt) }));
  const removeDetailedPoint = (i: number) => setArticleForm(p => ({ ...p, detailedPoints: p.detailedPoints.filter((_, idx) => idx !== i) }));
  const addArticleInterest = () => { if (interestInput.trim() && !articleForm.interests.includes(interestInput.trim())) { setArticleForm(p => ({ ...p, interests: [...p.interests, interestInput.trim()] })); setInterestInput(''); } };
  const removeArticleInterest = (i: string) => setArticleForm(p => ({ ...p, interests: p.interests.filter(x => x !== i) }));

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
  const editableLabels = [
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'searchTitle', label: 'Search Title' },
    { key: 'searchPlaceholder', label: 'Search Placeholder' },
    { key: 'interestsLabel', label: 'Interests Label' },
    { key: 'interestsPlaceholder', label: 'Interests Placeholder' },
    { key: 'noArticles', label: 'No Articles Message' },
    { key: 'noArticlesDesc', label: 'No Articles Description' },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md shadow-2xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg text-center">
            <CardTitle className="text-2xl">🔐 Admin Login</CardTitle>
            <CardDescription className="text-blue-100">Friendly GOV Administration</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      {/* Admin toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="font-bold text-sm">EDIT MODE</span>
          <span className="text-xs opacity-80">Click any text to edit • Changes save automatically</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-xs" onClick={() => setManageDialogOpen('sources')}>📋 Sources</Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-xs" onClick={() => setManageDialogOpen('doctypes')}>📄 Doc Types</Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-xs" onClick={() => setManageDialogOpen('subjects')}>📌 Subjects</Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-xs" onClick={() => setManageDialogOpen('interests')}>💡 Interests</Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-xs" onClick={() => setManageDialogOpen('texts')}>✏️ Page Texts</Button>
          <Separator orientation="vertical" className="h-6 bg-white/30" />
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 pt-12">
        {/* Country Switcher */}
        <div className="flex justify-center">
          <CountrySwitcher country={country} onCountryChange={setCountry} />
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Friendly GOV {config.flag}
            </h1>
            <Sparkles className="h-10 w-10 text-purple-600" />
          </div>
          <EditableText value={(labels as any).subtitle || ''} onSave={v => appData.updateLabel(country, 'subtitle', v)}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{labels.subtitle}</p>
          </EditableText>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {labels.lastUpdate}: {lastUpdateTime}
          </div>
        </div>

        {/* Interest Filter */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardContent className="p-6">
            <InterestFilter interest={interest} onInterestChange={setInterest} suggestions={config.interests} placeholder={labels.interestsPlaceholder} label={labels.interestsLabel} />
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm} onSearchChange={setSearchTerm}
          documentType={documentType} onDocumentTypeChange={setDocumentType}
          subject={subject} onSubjectChange={setSubject}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters || selectedDate !== undefined || selectedWebsite !== 'all'}
          labels={labels} documentTypes={config.documentTypes} subjects={config.subjects}
        />

        {/* Website Menu */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{labels.sources}</CardTitle>
            <CardDescription className="text-purple-100">{labels.sourcesDesc}</CardDescription>
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
                {selectedDate && <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>{labels.reset}</Button>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-foreground">
              {labels.articles}
              {selectedWebsite !== 'all' && <span className="ml-2 text-lg text-muted-foreground">- {websites.find(w => w.id === selectedWebsite)?.name}</span>}
              {selectedDate && <span className="ml-2 text-lg text-muted-foreground">- {formatDate(selectedDate)}</span>}
            </h2>
            <Badge variant="outline" className="ml-2">{labels.articleCount(sortedArticles.length)}</Badge>
            <Button size="sm" className="ml-auto bg-green-600 hover:bg-green-700" onClick={openNewArticle}>
              <Plus className="h-4 w-4 mr-1" /> Add Article
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {sortedArticles.map(article => {
              const sourceWebsite = websites.find(w => w.id === article.source);
              const hasUrgent = article.tags.includes('urgent');
              return (
                <Card key={article.id} className={cn(
                  'transition-all duration-300 hover:shadow-xl border relative group',
                  hasUrgent && 'border-2 border-red-400 shadow-lg bg-red-50/50',
                  !hasUrgent && article.tags.includes('new') && 'border-2 border-green-400 shadow-lg bg-green-50/50',
                  !hasUrgent && !article.tags.includes('new') && 'border-border'
                )}>
                  {/* Admin overlay buttons */}
                  <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="h-7 bg-white/90 shadow-sm" onClick={() => openEditArticle(article)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 shadow-sm" onClick={() => { appData.deleteArticle(country, article.id); toast({ title: 'Article deleted' }); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <CardHeader>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-sm">{sourceWebsite?.emoji} {sourceWebsite?.name}</Badge>
                        <Badge variant="secondary" className="text-sm"><Tag className="h-3 w-3 mr-1" />{article.categoryEmoji} {article.categoryName}</Badge>
                        {article.tags.map(tag => <ArticleTagBadge key={tag} tag={tag} labels={labels} />)}
                      </div>
                      <EditableText value={article.title} onSave={v => appData.updateArticle(country, article.id, { title: v })}>
                        <CardTitle className="text-lg text-foreground leading-tight">{renderTextWithTooltips(article.title)}</CardTitle>
                      </EditableText>
                      <EditableText value={article.date} onSave={v => appData.updateArticle(country, article.id, { date: v })}>
                        <CardDescription className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" />{article.date}</CardDescription>
                      </EditableText>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-1"><FileText className="h-4 w-4" />{labels.originalContent}</h4>
                      <EditableText value={article.originalContent} onSave={v => appData.updateArticle(country, article.id, { originalContent: v })} as="textarea">
                        <ScrollArea className="h-20 w-full border rounded p-3 bg-muted/50">
                          <p className="text-sm text-muted-foreground">{renderTextWithTooltips(article.originalContent)}</p>
                        </ScrollArea>
                      </EditableText>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4" />{labels.simplified}</h4>
                      <EditableText value={article.simplifiedContent} onSave={v => appData.updateArticle(country, article.id, { simplifiedContent: v })} as="textarea">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 leading-relaxed">{article.simplifiedContent}</p>
                        </div>
                      </EditableText>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4" />{labels.keyPoints}</h4>
                      <div className="space-y-2">
                        {article.detailedPoints.map((point, i) => (
                          <EditableText key={i} value={point} onSave={v => {
                            const newPoints = [...article.detailedPoints];
                            newPoints[i] = v;
                            appData.updateArticle(country, article.id, { detailedPoints: newPoints });
                          }}>
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                              <p className="text-sm text-purple-800 leading-relaxed">• {point}</p>
                            </div>
                          </EditableText>
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

          {sortedArticles.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">{labels.noArticles}</h3>
              <p className="text-muted-foreground">{labels.noArticlesDesc}</p>
            </div>
          )}
        </div>
      </div>

      {/* Article Dialog (full form for add/edit) */}
      <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticleId ? 'Edit Article' : 'New Article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={articleForm.title} onChange={e => setArticleForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={articleForm.date} onChange={e => setArticleForm(p => ({ ...p, date: e.target.value }))} placeholder={country === 'uk' ? '5 June 2025' : '5 iunie 2025'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={articleForm.source} onValueChange={v => setArticleForm(p => ({ ...p, source: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>{sources.map(s => <SelectItem key={s.id} value={s.id}>{s.emoji} {s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input value={articleForm.url} onChange={e => setArticleForm(p => ({ ...p, url: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Category ID</Label><Input value={articleForm.category} onChange={e => setArticleForm(p => ({ ...p, category: e.target.value }))} placeholder="health" /></div>
              <div className="space-y-2"><Label>Category Emoji</Label><Input value={articleForm.categoryEmoji} onChange={e => setArticleForm(p => ({ ...p, categoryEmoji: e.target.value }))} placeholder="🏥" /></div>
              <div className="space-y-2"><Label>Category Name</Label><Input value={articleForm.categoryName} onChange={e => setArticleForm(p => ({ ...p, categoryName: e.target.value }))} placeholder="Health" /></div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-4">
                {(['new', 'important', 'urgent'] as ArticleTag[]).map(tag => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={articleForm.tags.includes(tag)} onCheckedChange={() => toggleTag(tag)} />
                    <span className="capitalize">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>Original Content</Label><Textarea rows={3} value={articleForm.originalContent} onChange={e => setArticleForm(p => ({ ...p, originalContent: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Simplified Content</Label><Textarea rows={3} value={articleForm.simplifiedContent} onChange={e => setArticleForm(p => ({ ...p, simplifiedContent: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Key Points</Label>
              {articleForm.detailedPoints.map((point, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={point} onChange={e => updateDetailedPoint(i, e.target.value)} placeholder={`Point ${i + 1}`} />
                  <Button variant="ghost" size="sm" onClick={() => removeDetailedPoint(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addDetailedPoint}><Plus className="h-4 w-4 mr-1" /> Add Point</Button>
            </div>
            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex gap-2">
                <Input value={interestInput} onChange={e => setInterestInput(e.target.value)} placeholder="Add interest" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArticleInterest(); } }} />
                <Button variant="outline" size="sm" onClick={addArticleInterest}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">{articleForm.interests.map(i => <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeArticleInterest(i)}>{i} ✕</Badge>)}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArticleDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveArticle}>{editingArticleId ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Management Dialogs */}
      <Dialog open={manageDialogOpen === 'sources'} onOpenChange={open => !open && setManageDialogOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Sources ({config.name})</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Source name" value={newItemInput} onChange={e => setNewItemInput(e.target.value)} />
              <Input placeholder="Emoji" value={newSourceEmoji} onChange={e => setNewSourceEmoji(e.target.value)} />
              <Button onClick={() => { if (newItemInput) { appData.addSource(country, { id: newItemInput.toLowerCase().replace(/\s/g, '_'), name: newItemInput, emoji: newSourceEmoji || '📋', description: '' }); setNewItemInput(''); setNewSourceEmoji(''); toast({ title: 'Source added' }); } }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div className="space-y-2">{sources.map(s => (
              <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                <span>{s.emoji} {s.name}</span>
                <Button size="sm" variant="destructive" onClick={() => { appData.deleteSource(country, s.id); toast({ title: 'Deleted' }); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}</div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={manageDialogOpen === 'doctypes'} onOpenChange={open => !open && setManageDialogOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Document Types ({config.name})</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="New type" value={newItemInput} onChange={e => setNewItemInput(e.target.value)} />
              <Button onClick={() => { if (newItemInput) { appData.addDocumentType(country, { value: newItemInput.toLowerCase().replace(/\s/g, '_'), label: newItemInput }); setNewItemInput(''); toast({ title: 'Added' }); } }}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{config.documentTypes.filter(t => t.value !== 'all').map(t => (
              <Badge key={t.value} variant="outline" className="cursor-pointer py-1.5 px-3" onClick={() => { appData.deleteDocumentType(country, t.value); toast({ title: 'Deleted' }); }}>
                {t.label} ✕
              </Badge>
            ))}</div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={manageDialogOpen === 'subjects'} onOpenChange={open => !open && setManageDialogOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Subjects ({config.name})</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="New subject" value={newItemInput} onChange={e => setNewItemInput(e.target.value)} />
              <Button onClick={() => { if (newItemInput) { appData.addSubject(country, { value: newItemInput.toLowerCase().replace(/\s/g, '_'), label: newItemInput }); setNewItemInput(''); toast({ title: 'Added' }); } }}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{config.subjects.filter(s => s.value !== 'all').map(s => (
              <Badge key={s.value} variant="outline" className="cursor-pointer py-1.5 px-3" onClick={() => { appData.deleteSubject(country, s.value); toast({ title: 'Deleted' }); }}>
                {s.label} ✕
              </Badge>
            ))}</div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={manageDialogOpen === 'interests'} onOpenChange={open => !open && setManageDialogOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Interest Suggestions ({config.name})</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="New interest" value={newItemInput} onChange={e => setNewItemInput(e.target.value)} />
              <Button onClick={() => { if (newItemInput) { appData.addInterest(country, newItemInput); setNewItemInput(''); toast({ title: 'Added' }); } }}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{config.interests.map(i => (
              <Badge key={i} variant="outline" className="cursor-pointer py-1.5 px-3" onClick={() => { appData.deleteInterest(country, i); toast({ title: 'Deleted' }); }}>
                {i} ✕
              </Badge>
            ))}</div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={manageDialogOpen === 'texts'} onOpenChange={open => !open && setManageDialogOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Page Texts ({config.name})</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {editableLabels.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input value={(labels as any)[key] || ''} onChange={e => appData.updateLabel(country, key, e.target.value)} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
