import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const FIRECRAWL_API = 'https://api.firecrawl.dev/v1'

// UK government sources — listing pages to discover article links
const UK_SOURCES = [
  {
    id: 'govuk',
    name: 'GOV.UK',
    listingUrl: 'https://www.gov.uk/search/news-and-communications?order=updated-newest',
    articlePattern: /^https:\/\/www\.gov\.uk\/government\/(news|publications|speeches|consultations|statistics)\//,
    fallbackPattern: /^https:\/\/www\.gov\.uk\/(government\/|guidance\/)/,
  },
  {
    id: 'hmrc',
    name: 'HMRC',
    listingUrl: 'https://www.gov.uk/search/news-and-communications?organisations%5B%5D=hm-revenue-customs&order=updated-newest',
    articlePattern: /^https:\/\/www\.gov\.uk\/government\/(news|publications|speeches|consultations|statistics)\//,
    fallbackPattern: /^https:\/\/www\.gov\.uk\/(government\/|guidance\/|hmrc-)/,
  },
  {
    id: 'nhs',
    name: 'NHS',
    listingUrl: 'https://www.england.nhs.uk/news/',
    articlePattern: /^https:\/\/www\.england\.nhs\.uk\/\d{4}\/\d{2}\//,
    fallbackPattern: /^https:\/\/www\.england\.nhs\.uk\//,
  },
  {
    id: 'dwp',
    name: 'DWP',
    listingUrl: 'https://www.gov.uk/search/news-and-communications?organisations%5B%5D=department-for-work-pensions&order=updated-newest',
    articlePattern: /^https:\/\/www\.gov\.uk\/government\/(news|publications|speeches|consultations|statistics)\//,
    fallbackPattern: /^https:\/\/www\.gov\.uk\/(government\/|guidance\/)/,
  },
  {
    id: 'ofsted',
    name: 'Ofsted',
    listingUrl: 'https://www.gov.uk/search/news-and-communications?organisations%5B%5D=ofsted&order=updated-newest',
    articlePattern: /^https:\/\/www\.gov\.uk\/government\/(news|publications|speeches|consultations|statistics)\//,
    fallbackPattern: /^https:\/\/www\.gov\.uk\/(government\/|guidance\/)/,
  },
]

// Non-article URL patterns to skip
const SKIP_PATTERNS = [
  /\/search\?/, /\/search\//, /\?order=/, /\?page=/, /#/,
  /\?filter-/, /filter-keyword=/, /filter-category=/,
  /\/cookie/, /\/privacy/, /\/terms/, /\/accessibility/,
  /\/about/, /\/contact/, /\/help/, /\/feedback/,
  /\/organisations$/, /\/latest$/, /\/news\/?$/,
  /twitter\.com/, /facebook\.com/, /youtube\.com/, /linkedin\.com/,
]

const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; emoji: string; name: string }> = {
  housing: { keywords: ['housing', 'landlord', 'tenant', 'rent', 'home', 'property', 'building', 'planning'], emoji: '🏠', name: 'Housing' },
  tax: { keywords: ['tax', 'hmrc', 'self-assessment', 'vat', 'income tax', 'duty', 'fiscal'], emoji: '💷', name: 'Tax' },
  benefits: { keywords: ['benefit', 'universal credit', 'pension', 'allowance', 'welfare', 'dwp', 'disability'], emoji: '🤝', name: 'Benefits' },
  health: { keywords: ['health', 'nhs', 'hospital', 'mental health', 'doctor', 'vaccine', 'medical', 'cancer', 'patient'], emoji: '🏥', name: 'Health' },
  education: { keywords: ['education', 'school', 'university', 'student', 'ofsted', 'childcare', 'teacher', 'apprentice'], emoji: '🎓', name: 'Education' },
  employment: { keywords: ['employment', 'job', 'worker', 'minimum wage', 'workplace', 'labour', 'workforce'], emoji: '💼', name: 'Employment' },
  immigration: { keywords: ['immigration', 'visa', 'asylum', 'border', 'passport', 'migrant'], emoji: '🌍', name: 'Immigration' },
  transport: { keywords: ['transport', 'rail', 'road', 'driving', 'highway', 'train', 'bus', 'aviation'], emoji: '🚗', name: 'Transport' },
  environment: { keywords: ['environment', 'climate', 'energy', 'green', 'pollution', 'carbon', 'net zero', 'renewable'], emoji: '🌱', name: 'Environment' },
  defense: { keywords: ['defence', 'military', 'armed forces', 'security', 'police', 'crime'], emoji: '🛡️', name: 'Defence & Security' },
}

function detectCategory(text: string): { category: string; emoji: string; name: string } {
  const lower = text.toLowerCase()
  for (const [cat, info] of Object.entries(CATEGORY_KEYWORDS)) {
    if (info.keywords.some(kw => lower.includes(kw))) {
      return { category: cat, emoji: info.emoji, name: info.name }
    }
  }
  return { category: 'general', emoji: '🏛️', name: 'General' }
}

function detectInterests(text: string): string[] {
  const interests: string[] = []
  const lower = text.toLowerCase()
  const interestMap: Record<string, string[]> = {
    'info for landlords': ['landlord', 'rental property', 'tenancy', 'letting'],
    'benefits for unemployed': ['unemployment', 'jobseeker', 'universal credit', 'job centre'],
    'universal credit': ['universal credit'],
    'council tax': ['council tax'],
    'childcare': ['childcare', 'nursery', 'child benefit', 'parental leave'],
    'NHS services': ['nhs', 'hospital', 'gp surgery', 'health service', 'ambulance', 'a&e'],
    'visa & immigration': ['visa', 'immigration', 'passport', 'right to work'],
  }
  for (const [interest, keywords] of Object.entries(interestMap)) {
    if (keywords.some(kw => lower.includes(kw))) interests.push(interest)
  }
  return interests
}

function simplifyContentFallback(text: string): string {
  let simplified = text
    .replace(/\b(pursuant to|in accordance with|notwithstanding)\b/gi, 'following')
    .replace(/\b(aforementioned|hereinafter)\b/gi, 'this')
    .replace(/\b(shall be entitled to)\b/gi, 'can')
    .replace(/\b(with immediate effect)\b/gi, 'right away')
    .replace(/\b(in the event that)\b/gi, 'if')
    .replace(/\b(for the purpose of)\b/gi, 'to')
    .replace(/\b(legislation|regulatory framework)\b/gi, 'rules')
  if (simplified.length > 600) simplified = simplified.substring(0, 597) + '...'
  return simplified + ' 📋✨'
}

function extractKeyPointsFallback(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30)
  const unique = [...new Set(sentences.map(s => s.trim()))]
  return unique.slice(0, 4).map((s, i) => {
    const emojis = ['📌', '✅', '💡', '⚡']
    return `${s.trim()}. ${emojis[i % emojis.length]}`
  })
}

async function aiSimplify(title: string, content: string, language: string): Promise<{ simplified: string; keyPoints: string[] } | null> {
  const maxRetries = 2
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
      if (!LOVABLE_API_KEY) return null

      // Rate limit: wait 5s before each AI call (longer on retries)
      await new Promise(r => setTimeout(r, 5000 + attempt * 5000))

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

      const response = await fetch(`${supabaseUrl}/functions/v1/simplify-article`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, language }),
      })

      if (response.status === 429 && attempt < maxRetries) {
        console.log(`AI rate limited, retry ${attempt + 1}/${maxRetries}...`)
        continue
      }

      if (!response.ok) {
        console.error(`AI simplify failed: ${response.status}`)
        return null
      }

      const data = await response.json()
      if (data.simplified && data.keyPoints) return data
      return null
    } catch (err) {
      console.error('AI simplify error:', err)
      if (attempt < maxRetries) continue
      return null
    }
  }
  return null
}

// Clean markdown artifacts and cookie/navigation boilerplate from text
function cleanText(text: string): string {
  let cleaned = text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\(https?:\/\/[^\)]+\)/g, '')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/[*_]{1,3}/g, '')
    .replace(/\|/g, ' ')
    .replace(/-{3,}/g, '')
    .replace(/\n{3,}/g, '\n\n')

  // Aggressively strip GOV.UK / NHS cookie banners - everything before actual content
  // Pattern: starts with cookie text, ends right before the article type (Press release, Speech, News story, etc.)
  cleaned = cleaned.replace(/^[\s\S]*?(?:Accept additional cookies\s*Reject additional cookies[\s\S]*?Hide cookie message\s*)/i, '')
  cleaned = cleaned.replace(/^[\s\S]*?(?:I'm OK with analytics cookies\s*)/i, '')
  cleaned = cleaned.replace(/We use some essential cookies[\s\S]*?(?:Hide cookie message|before you choose\.)\s*/gi, '')
  cleaned = cleaned.replace(/Cookies on (?:GOV\.UK|the NHS England website)[\s\S]*?(?:Hide cookie message|before you choose\.)\s*/gi, '')
  
  // Strip "Skip to main content"
  cleaned = cleaned.replace(/^Skip to (?:main )?content\s*/i, '')
  
  // Strip "Share on" footers
  cleaned = cleaned.replace(/Share on Facebook[\s\S]*$/i, '')
  
  // Strip "From:" metadata lines
  cleaned = cleaned.replace(/From:[\s\S]*?Published\d{1,2}\s+\w+\s+\d{4}\s*/gi, '')
  
  // Strip image placeholders
  cleaned = cleaned.replace(/!\[\]\s*/g, '')

  return cleaned.trim()
}

// Scrape listing page to discover article links
async function discoverArticleUrls(firecrawlKey: string, source: typeof UK_SOURCES[0]): Promise<string[]> {
  console.log(`[${source.id}] Discovering articles from: ${source.listingUrl}`)

  const response = await fetch(`${FIRECRAWL_API}/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: source.listingUrl,
      formats: ['links'],
      onlyMainContent: true,
    }),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(`Firecrawl error ${response.status}: ${JSON.stringify(data)}`)

  const allLinks: string[] = data.data?.links || data.links || []
  console.log(`[${source.id}] Found ${allLinks.length} total links`)

  // Filter to actual article URLs
  const articleUrls = allLinks.filter(url => {
    if (SKIP_PATTERNS.some(p => p.test(url))) return false
    return source.articlePattern.test(url) || source.fallbackPattern.test(url)
  })

  // Deduplicate and take top 10
  const unique = [...new Set(articleUrls)]
  console.log(`[${source.id}] ${unique.length} article URLs after filtering`)
  return unique.slice(0, 10)
}

// Scrape individual article page for rich content
async function scrapeArticle(firecrawlKey: string, url: string): Promise<{
  title: string; content: string; date?: string; summary?: string
} | null> {
  console.log(`  Scraping article: ${url}`)

  const response = await fetch(`${FIRECRAWL_API}/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error(`  Failed to scrape ${url}: ${response.status}`)
    return null
  }

  const markdown = data.data?.markdown || data.markdown || ''
  const metadata = data.data?.metadata || data.metadata || {}

  if (!markdown || markdown.length < 100) return null
  if (markdown.includes('Enable JavaScript') || markdown.includes('Verifying your browser')) return null

  // Clean all boilerplate
  const cleaned = cleanText(markdown)
  if (!cleaned || cleaned.length < 100) return null
  const title = cleanText(metadata.title || cleaned.split('\n')[0]?.substring(0, 200) || '')

  // Try to extract date from content or metadata
  const dateMatch = cleaned.match(/(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i)
  const date = dateMatch ? dateMatch[1] : undefined

  return {
    title: cleanText(title).substring(0, 300),
    content: cleaned,
    date,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: run } = await supabase.from('scraper_runs').insert({
      status: 'running',
      sources_scraped: UK_SOURCES.map(s => s.id),
    }).select().single()

    const errors: string[] = []
    let totalArticles = 0

    for (const source of UK_SOURCES) {
      try {
        // Step 1: Discover article URLs from listing page
        const articleUrls = await discoverArticleUrls(firecrawlKey, source)

        if (articleUrls.length === 0) {
          errors.push(`${source.id}: No article URLs found`)
          continue
        }

        // Step 2: Scrape each individual article
        for (const articleUrl of articleUrls) {
          // Check if already exists
          const { data: existing } = await supabase
            .from('scraped_articles')
            .select('id')
            .eq('url', articleUrl)
            .maybeSingle()

          if (existing) {
            console.log(`  Skipping (already exists): ${articleUrl}`)
            continue
          }

          const article = await scrapeArticle(firecrawlKey, articleUrl)
          if (!article || !article.title || article.title.length < 10) continue

          // Skip non-article pages
          const skipTitles = ['cookie', 'privacy', 'accessibility', 'terms', 'contact', 'about us', 'search results']
          if (skipTitles.some(s => article.title.toLowerCase().includes(s))) continue

          const fullText = article.title + ' ' + article.content
          const { category, emoji, name } = detectCategory(fullText)
          const interests = detectInterests(fullText)

          const articleDate = article.date || new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          })

          // Try AI simplification, fallback to rule-based
          const aiResult = await aiSimplify(article.title, article.content, 'en')

          const { error: insertError } = await supabase.from('scraped_articles').insert({
            country: 'uk',
            source: source.id,
            title: article.title,
            original_content: article.content.substring(0, 3000),
            simplified_content: aiResult?.simplified || simplifyContentFallback(article.content),
            detailed_points: aiResult?.keyPoints || extractKeyPointsFallback(article.content),
            category,
            category_emoji: emoji,
            category_name: name,
            url: articleUrl,
            tags: ['new'],
            interests,
            article_date: articleDate,
          })

          if (insertError) {
            errors.push(`${source.id}: Insert error - ${insertError.message}`)
          } else {
            totalArticles++
            console.log(`  ✅ Saved: ${article.title.substring(0, 60)}...`)
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${source.id}: ${msg}`)
        console.error(`Error scraping ${source.id}:`, err)
      }
    }

    if (run) {
      await supabase.from('scraper_runs').update({
        completed_at: new Date().toISOString(),
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        articles_found: totalArticles,
        errors,
      }).eq('id', run.id)
    }

    return new Response(JSON.stringify({
      success: true,
      articles_found: totalArticles,
      errors,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Scraper error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
