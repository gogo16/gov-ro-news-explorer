import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, LogOut } from 'lucide-react';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const { toast } = useToast();
  
  // Sample data - in a real app this would come from a database
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'Hotărâre de Guvern nr. 123/2024',
      content: 'Conținut exemplu pentru hotărârea de guvern',
      simplifiedContent: 'Versiune simplificată',
      category: 'sănătate',
      source: 'Guvernul României',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Ordonanță de urgență nr. 45/2024',
      content: 'Conținut exemplu pentru ordonanța de urgență',
      simplifiedContent: 'Versiune simplificată',
      category: 'educație',
      source: 'Guvernul României',
      date: '2024-02-20'
    }
  ]);

  const [sources, setSources] = useState([
    'Guvernul României',
    'Ministerul Sănătății',
    'Ministerul Educației',
    'Ministerul Transporturilor'
  ]);

  const [documentTypes, setDocumentTypes] = useState([
    'hotărâre de guvern',
    'hotărâre',
    'ordonanță de urgență',
    'ordonanță',
    'ordin',
    'comunicat de presă',
    'informare',
    'act normativ'
  ]);

  const [subjects, setSubjects] = useState([
    'sănătate',
    'educație',
    'transport',
    'economie',
    'justiție',
    'mediu'
  ]);

  const [pageTexts, setPageTexts] = useState({
    title: 'Platforma de Informare Guvernamentală',
    subtitle: 'Acces simplu la informațiile oficiale ale guvernului',
    description: 'Găsește și înțelege rapid documentele oficiale ale guvernului României'
  });

  useEffect(() => {
    const adminStatus = localStorage.getItem('adminLoggedIn');
    if (adminStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === '123') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      toast({
        title: 'Autentificare reușită',
        description: 'Bun venit în panoul de administrare!',
      });
    } else {
      toast({
        title: 'Eroare autentificare',
        description: 'Nume utilizator sau parolă incorectă',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    setLoginForm({ username: '', password: '' });
    toast({
      title: 'Deconectare reușită',
      description: 'Ai fost deconectat din panoul de administrare',
    });
  };

  const deleteArticle = (id: number) => {
    setArticles(articles.filter(article => article.id !== id));
    toast({
      title: 'Articol șters',
      description: 'Articolul a fost șters cu succes',
    });
  };

  const deleteSource = (source: string) => {
    setSources(sources.filter(s => s !== source));
    toast({
      title: 'Sursă ștearsă',
      description: 'Sursa a fost ștearsă cu succes',
    });
  };

  const addSource = (newSource: string) => {
    if (newSource && !sources.includes(newSource)) {
      setSources([...sources, newSource]);
      toast({
        title: 'Sursă adăugată',
        description: 'Noua sursă a fost adăugată cu succes',
      });
    }
  };

  const deleteDocumentType = (type: string) => {
    setDocumentTypes(documentTypes.filter(t => t !== type));
    toast({
      title: 'Tip document șters',
      description: 'Tipul de document a fost șters cu succes',
    });
  };

  const addDocumentType = (newType: string) => {
    if (newType && !documentTypes.includes(newType)) {
      setDocumentTypes([...documentTypes, newType]);
      toast({
        title: 'Tip document adăugat',
        description: 'Noul tip de document a fost adăugat cu succes',
      });
    }
  };

  const deleteSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
    toast({
      title: 'Subiect șters',
      description: 'Subiectul a fost șters cu succes',
    });
  };

  const addSubject = (newSubject: string) => {
    if (newSubject && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject]);
      toast({
        title: 'Subiect adăugat',
        description: 'Noul subiect a fost adăugat cu succes',
      });
    }
  };

  const updatePageText = (key: keyof typeof pageTexts, value: string) => {
    setPageTexts({ ...pageTexts, [key]: value });
    toast({
      title: 'Text actualizat',
      description: 'Textul paginii a fost actualizat cu succes',
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Administrare</CardTitle>
            <CardDescription>
              Introduceti datele de autentificare pentru a accesa panoul de administrare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nume utilizator</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parolă</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Autentificare
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panou Administrare</h1>
            <p className="text-muted-foreground">Gestionează conținutul platformei</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Deconectare
          </Button>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="articles">Articole</TabsTrigger>
            <TabsTrigger value="sources">Surse</TabsTrigger>
            <TabsTrigger value="documents">Tipuri Documente</TabsTrigger>
            <TabsTrigger value="subjects">Subiecte</TabsTrigger>
            <TabsTrigger value="texts">Texte Pagină</TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle>Gestionare Articole</CardTitle>
                <CardDescription>Adaugă, editează sau șterge articole</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titlu</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead>Sursă</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{article.category}</Badge>
                        </TableCell>
                        <TableCell>{article.source}</TableCell>
                        <TableCell>{article.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteArticle(article.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Surse de Informație</CardTitle>
                <CardDescription>Gestionează sursele de informație</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adaugă Sursă
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adaugă Sursă Nouă</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newSource">Numele sursei</Label>
                        <Input id="newSource" placeholder="Numele noii surse" />
                      </div>
                      <Button onClick={() => {
                        const input = document.getElementById('newSource') as HTMLInputElement;
                        addSource(input.value);
                        input.value = '';
                      }}>
                        Adaugă
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{source}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSource(source)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Tipuri de Documente</CardTitle>
                <CardDescription>Gestionează tipurile de documente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adaugă Tip Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adaugă Tip Document Nou</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newDocType">Tipul documentului</Label>
                        <Input id="newDocType" placeholder="Numele noului tip de document" />
                      </div>
                      <Button onClick={() => {
                        const input = document.getElementById('newDocType') as HTMLInputElement;
                        addDocumentType(input.value);
                        input.value = '';
                      }}>
                        Adaugă
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{type}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDocumentType(type)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Subiecte</CardTitle>
                <CardDescription>Gestionează subiectele disponibile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adaugă Subiect
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adaugă Subiect Nou</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newSubject">Numele subiectului</Label>
                        <Input id="newSubject" placeholder="Numele noului subiect" />
                      </div>
                      <Button onClick={() => {
                        const input = document.getElementById('newSubject') as HTMLInputElement;
                        addSubject(input.value);
                        input.value = '';
                      }}>
                        Adaugă
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{subject}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSubject(subject)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="texts">
            <Card>
              <CardHeader>
                <CardTitle>Texte Pagină</CardTitle>
                <CardDescription>Editează textele afișate pe pagina principală</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pageTitle">Titlul paginii</Label>
                  <Input
                    id="pageTitle"
                    value={pageTexts.title}
                    onChange={(e) => updatePageText('title', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pageSubtitle">Subtitlul paginii</Label>
                  <Input
                    id="pageSubtitle"
                    value={pageTexts.subtitle}
                    onChange={(e) => updatePageText('subtitle', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pageDescription">Descrierea paginii</Label>
                  <Textarea
                    id="pageDescription"
                    value={pageTexts.description}
                    onChange={(e) => updatePageText('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;