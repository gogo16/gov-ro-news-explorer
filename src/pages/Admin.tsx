import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, LogOut } from 'lucide-react';
import CountrySwitcher from '@/components/CountrySwitcher';
import { useAppData } from '@/context/AppDataContext';
import { Country, ArticleTag, ScrapedArticle } from '@/data/countryConfig';

const emptyArticle = (): Omit<ScrapedArticle, 'id'> => ({
  title: '',
  date: '',
  originalContent: '',
  simplifiedContent: '',
  detailedPoints: [''],
  category: '',
  categoryEmoji: '',
  categoryName: '',
  url: '',
  tags: [],
  source: '',
  interests: [],
});

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [country, setCountry] = useState<Country>('ro');
  const { toast } = useToast();
  const appData = useAppData();
  const config = appData.getData(country);

  // Article form state
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<Omit<ScrapedArticle, 'id'>>(emptyArticle());
  const [interestInput, setInterestInput] = useState('');

  // Simple add inputs
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceEmoji, setNewSourceEmoji] = useState('');
  const [newSourceDesc, setNewSourceDesc] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (localStorage.getItem('adminLoggedIn') === 'true') setIsLoggedIn(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === '123') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      toast({ title: 'Login successful', description: 'Welcome to the admin panel!' });
    } else {
      toast({ title: 'Login failed', description: 'Incorrect credentials', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    toast({ title: 'Logged out' });
  };

  const openNewArticle = () => {
    setEditingArticleId(null);
    setArticleForm(emptyArticle());
    setArticleDialogOpen(true);
  };

  const openEditArticle = (article: ScrapedArticle) => {
    setEditingArticleId(article.id);
    const { id, ...rest } = article;
    setArticleForm({ ...rest });
    setArticleDialogOpen(true);
  };

  const saveArticle = () => {
    if (!articleForm.title) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    if (editingArticleId) {
      appData.updateArticle(country, editingArticleId, articleForm);
      toast({ title: 'Article updated' });
    } else {
      const id = `article_${Date.now()}`;
      appData.addArticle(country, { id, ...articleForm });
      toast({ title: 'Article added' });
    }
    setArticleDialogOpen(false);
  };

  const toggleTag = (tag: ArticleTag) => {
    setArticleForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const addDetailedPoint = () => {
    setArticleForm(prev => ({ ...prev, detailedPoints: [...prev.detailedPoints, ''] }));
  };

  const updateDetailedPoint = (index: number, value: string) => {
    setArticleForm(prev => ({
      ...prev,
      detailedPoints: prev.detailedPoints.map((p, i) => i === index ? value : p),
    }));
  };

  const removeDetailedPoint = (index: number) => {
    setArticleForm(prev => ({
      ...prev,
      detailedPoints: prev.detailedPoints.filter((_, i) => i !== index),
    }));
  };

  const addArticleInterest = () => {
    if (interestInput.trim() && !articleForm.interests.includes(interestInput.trim())) {
      setArticleForm(prev => ({ ...prev, interests: [...prev.interests, interestInput.trim()] }));
      setInterestInput('');
    }
  };

  const removeArticleInterest = (interest: string) => {
    setArticleForm(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const sources = config.websites.filter(w => w.id !== 'all');
  const isEn = country === 'uk';

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
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

  const editableLabels: { key: string; label: string }[] = [
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'searchTitle', label: 'Search Title' },
    { key: 'searchPlaceholder', label: 'Search Placeholder' },
    { key: 'interestsLabel', label: 'Interests Label' },
    { key: 'interestsPlaceholder', label: 'Interests Placeholder' },
    { key: 'noArticles', label: 'No Articles Message' },
    { key: 'noArticlesDesc', label: 'No Articles Description' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Friendly GOV Admin</h1>
            <p className="text-muted-foreground">Manage platform content for both countries</p>
          </div>
          <div className="flex items-center gap-4">
            <CountrySwitcher country={country} onCountryChange={setCountry} />
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="documents">Doc Types</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="texts">Page Texts</TabsTrigger>
          </TabsList>

          {/* ARTICLES TAB */}
          <TabsContent value="articles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Articles ({config.articles.length})</CardTitle>
                  <CardDescription>Manage articles for {config.name}</CardDescription>
                </div>
                <Button onClick={openNewArticle}><Plus className="mr-2 h-4 w-4" /> Add Article</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {config.articles.map(article => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-[300px] truncate">{article.title}</TableCell>
                        <TableCell>{sources.find(s => s.id === article.source)?.name || article.source}</TableCell>
                        <TableCell><Badge variant="secondary">{article.categoryEmoji} {article.categoryName}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {article.tags.map(t => (
                              <Badge key={t} className={t === 'urgent' ? 'bg-red-500 text-white' : t === 'important' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}>
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{article.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditArticle(article)}><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => { appData.deleteArticle(country, article.id); toast({ title: 'Article deleted' }); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Article Dialog */}
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
                      <Input value={articleForm.date} onChange={e => setArticleForm(p => ({ ...p, date: e.target.value }))} placeholder={isEn ? '5 June 2025' : '5 iunie 2025'} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Select value={articleForm.source} onValueChange={v => setArticleForm(p => ({ ...p, source: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                        <SelectContent>
                          {sources.map(s => <SelectItem key={s.id} value={s.id}>{s.emoji} {s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input value={articleForm.url} onChange={e => setArticleForm(p => ({ ...p, url: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Category ID</Label>
                      <Input value={articleForm.category} onChange={e => setArticleForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. health" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category Emoji</Label>
                      <Input value={articleForm.categoryEmoji} onChange={e => setArticleForm(p => ({ ...p, categoryEmoji: e.target.value }))} placeholder="🏥" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category Name</Label>
                      <Input value={articleForm.categoryName} onChange={e => setArticleForm(p => ({ ...p, categoryName: e.target.value }))} placeholder="Health" />
                    </div>
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

                  <div className="space-y-2">
                    <Label>Original Content</Label>
                    <Textarea rows={3} value={articleForm.originalContent} onChange={e => setArticleForm(p => ({ ...p, originalContent: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Simplified Content (Easy Read)</Label>
                    <Textarea rows={3} value={articleForm.simplifiedContent} onChange={e => setArticleForm(p => ({ ...p, simplifiedContent: e.target.value }))} />
                  </div>

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
                    <Label>Interests / Topics</Label>
                    <div className="flex gap-2">
                      <Input value={interestInput} onChange={e => setInterestInput(e.target.value)} placeholder="Add interest tag" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArticleInterest())} />
                      <Button variant="outline" size="sm" onClick={addArticleInterest}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {articleForm.interests.map(i => (
                        <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeArticleInterest(i)}>
                          {i} ✕
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setArticleDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveArticle}>{editingArticleId ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* SOURCES TAB */}
          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Information Sources</CardTitle>
                <CardDescription>Manage sources for {config.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input placeholder="Source ID (e.g. nhs)" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} />
                  <Input placeholder="Emoji (e.g. 🏥)" value={newSourceEmoji} onChange={e => setNewSourceEmoji(e.target.value)} />
                  <Input placeholder="Description" value={newSourceDesc} onChange={e => setNewSourceDesc(e.target.value)} />
                  <Button onClick={() => {
                    if (newSourceName) {
                      appData.addSource(country, { id: newSourceName.toLowerCase().replace(/\s/g, '_'), name: newSourceName, emoji: newSourceEmoji || '📋', description: newSourceDesc });
                      setNewSourceName(''); setNewSourceEmoji(''); setNewSourceDesc('');
                      toast({ title: 'Source added' });
                    }
                  }}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sources.map(source => (
                    <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="mr-2">{source.emoji}</span>
                        <span className="font-medium">{source.name}</span>
                        <p className="text-xs text-muted-foreground">{source.description}</p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => { appData.deleteSource(country, source.id); toast({ title: 'Source deleted' }); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOCUMENT TYPES TAB */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
                <CardDescription>Manage document types for {config.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="New document type" value={newDocType} onChange={e => setNewDocType(e.target.value)} />
                  <Button onClick={() => {
                    if (newDocType) {
                      appData.addDocumentType(country, { value: newDocType.toLowerCase().replace(/\s/g, '_'), label: newDocType });
                      setNewDocType('');
                      toast({ title: 'Document type added' });
                    }
                  }}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.documentTypes.filter(t => t.value !== 'all').map(type => (
                    <div key={type.value} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{type.label}</span>
                      <Button size="sm" variant="destructive" onClick={() => { appData.deleteDocumentType(country, type.value); toast({ title: 'Document type deleted' }); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUBJECTS TAB */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
                <CardDescription>Manage subjects for {config.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="New subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
                  <Button onClick={() => {
                    if (newSubject) {
                      appData.addSubject(country, { value: newSubject.toLowerCase().replace(/\s/g, '_'), label: newSubject });
                      setNewSubject('');
                      toast({ title: 'Subject added' });
                    }
                  }}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.subjects.filter(s => s.value !== 'all').map(subj => (
                    <div key={subj.value} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{subj.label}</span>
                      <Button size="sm" variant="destructive" onClick={() => { appData.deleteSubject(country, subj.value); toast({ title: 'Subject deleted' }); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INTERESTS TAB */}
          <TabsContent value="interests">
            <Card>
              <CardHeader>
                <CardTitle>Interest Suggestions</CardTitle>
                <CardDescription>Manage quick-pick interest badges for {config.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="New interest suggestion" value={newInterest} onChange={e => setNewInterest(e.target.value)} />
                  <Button onClick={() => {
                    if (newInterest) {
                      appData.addInterest(country, newInterest);
                      setNewInterest('');
                      toast({ title: 'Interest added' });
                    }
                  }}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.interests.map(interest => (
                    <Badge key={interest} variant="outline" className="cursor-pointer text-sm py-2 px-3" onClick={() => { appData.deleteInterest(country, interest); toast({ title: 'Interest removed' }); }}>
                      {interest} ✕
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAGE TEXTS TAB */}
          <TabsContent value="texts">
            <Card>
              <CardHeader>
                <CardTitle>Page Texts</CardTitle>
                <CardDescription>Edit UI labels and messages for {config.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {editableLabels.map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      value={(config.labels as any)[key] || ''}
                      onChange={e => appData.updateLabel(country, key, e.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
