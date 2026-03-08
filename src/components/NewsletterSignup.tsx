import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Please enter a valid email').max(255);

interface NewsletterSignupProps {
  interests: string[];
  country: string;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ interests, country }) => {
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({ title: 'Invalid email', description: result.error.errors[0].message, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('newsletter_signups' as any).insert({
        email: result.data,
        country: selectedCountry,
        interests: selectedInterests,
      } as any);

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already subscribed!', description: 'This email is already registered.' });
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        toast({ title: '🎉 Subscribed!', description: 'You\'ll receive updates in your inbox.' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg">
        <CardContent className="p-6 text-center space-y-2">
          <Check className="h-10 w-10 text-green-600 mx-auto" />
          <p className="text-lg font-semibold text-foreground">You're subscribed! 🎉</p>
          <p className="text-sm text-muted-foreground">We'll send you updates based on your interests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary to-accent rounded-t-lg pb-3">
        <CardTitle className="flex items-center gap-2 text-primary-foreground">
          <Mail className="h-5 w-5" />
          {country === 'ro' ? 'Abonează-te la newsletter' : 'Subscribe to newsletter'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder={country === 'ro' ? 'adresa@email.com' : 'your@email.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1"
              required
              maxLength={255}
            />
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ro">🇷🇴 România</SelectItem>
                <SelectItem value="uk">🇬🇧 UK</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {country === 'ro' ? 'Abonare' : 'Subscribe'}
            </Button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {country === 'ro' ? 'Selectează subiectele care te interesează (opțional):' : 'Select topics you\'re interested in (optional):'}
            </p>
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
