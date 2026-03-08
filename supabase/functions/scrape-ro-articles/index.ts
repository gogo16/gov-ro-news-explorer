import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const FIRECRAWL_API = 'https://api.firecrawl.dev/v1'

// Romanian government sources — listing pages to discover article links
const RO_SOURCES = [
  {
    id: 'gov',
    name: 'Guvernul României',
    listingUrl: 'https://gov.ro/ro/guvernul/sedinte-guvern',
    articlePattern: /^https:\/\/gov\.ro\/ro\/guvernul\/sedinte-guvern\//,
    fallbackPattern: /^https:\/\/gov\.ro\/ro\//,
  },
  {
    id: 'mai',
    name: 'Min. Afacerilor Interne',
    listingUrl: 'https://www.mai.gov.ro/category/comunicate-de-presa/',
    articlePattern: /^https:\/\/www\.mai\.gov\.ro\/[a-z0-9-]+\/?$/,
    fallbackPattern: /^https:\/\/www\.mai\.gov\.ro\//,
  },
  {
    id: 'ms',
    name: 'Min. Sănătății',
    listingUrl: 'https://www.ms.ro/ro/informatii-de-interes-public/noutati/',
    articlePattern: /^https:\/\/www\.ms\.ro\/ro\//,
    fallbackPattern: /^https:\/\/www\.ms\.ro\//,
  },
  {
    id: 'madr',
    name: 'Min. Agriculturii',
    listingUrl: 'https://www.madr.ro/comunicare/comunicate-de-presa.html',
    articlePattern: /^https:\/\/www\.madr\.ro\/comunicare\/[a-z0-9-]+\.html$/,
    fallbackPattern: /^https:\/\/www\.madr\.ro\/[a-z0-9-]+\/[a-z0-9-]+\.html$/,
  },
  {
    id: 'mae',
    name: 'Min. Afacerilor Externe',
    listingUrl: 'https://www.mae.ro/node/2011',
    articlePattern: /^https?:\/\/(www\.)?mae\.ro\/node\/\d+$/,
    fallbackPattern: /^https?:\/\/(www\.)?mae\.ro\//,
  },
]

// Non-article URL patterns to skip
const SKIP_PATTERNS = [
  /\/search/, /\?page=/, /#/, /\/cookie/, /\/privacy/,
  /\/contact/, /\/despre/, /\/about/, /\/sitemap/,
  /\/category\//, /\/tag\//, /\/page\/\d/,
  /twitter\.com/, /facebook\.com/, /youtube\.com/, /linkedin\.com/,
  /\/feed\/?$/, /\/rss\/?$/, /\.pdf$/, /\.doc$/,
  /\/login/, /\/register/, /\/autentificare/,
  /\/harta-site/, /\/termeni/, /\/politica/,
]

const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; emoji: string; name: string }> = {
  agriculture: {
    keywords: ['agricultură', 'fermieri', 'culturi', 'animale', 'recoltă', 'pământ', 'semințe', 'tractoare', 'apia', 'subvenți', 'fonduri agricole', 'rural'],
    emoji: '🚜', name: 'Agricultură',
  },
  budget: {
    keywords: ['buget', 'bani', 'finanțare', 'cheltuieli', 'venituri', 'investiții', 'economie', 'financiar', 'lei', 'milioane', 'miliarde', 'fiscal'],
    emoji: '💰', name: 'Buget și Finanțe',
  },
  people: {
    keywords: ['cetățeni', 'populație', 'oameni', 'familii', 'copii', 'pensionari', 'tineri', 'social', 'asistență'],
    emoji: '👥', name: 'Oameni și Societate',
  },
  education: {
    keywords: ['educație', 'școli', 'universități', 'elevi', 'studenți', 'învățământ', 'profesori', 'bacalaureat'],
    emoji: '🎓', name: 'Educație',
  },
  health: {
    keywords: ['sănătate', 'spitale', 'medici', 'tratament', 'medicină', 'pacienți', 'asigurări', 'coronavirus', 'covid', 'vaccinare', 'epidemi'],
    emoji: '🏥', name: 'Sănătate',
  },
  infrastructure: {
    keywords: ['drumuri', 'poduri', 'construcții', 'transport', 'autostrăzi', 'infrastructură', 'expropriere', 'centură', 'cale ferată'],
    emoji: '🛣️', name: 'Infrastructură',
  },
  environment: {
    keywords: ['mediu', 'natură', 'poluare', 'ecologie', 'sustenabilitate', 'energie verde', 'climă', 'deșeuri'],
    emoji: '🌱', name: 'Mediu',
  },
  technology: {
    keywords: ['digitalizare', 'tehnologie', 'computer', 'internet', 'digital', 'IT', 'electronic'],
    emoji: '💻', name: 'Tehnologie',
  },
  law: {
    keywords: ['lege', 'juridic', 'justiție', 'tribunal', 'regulament', 'normativ', 'penal', 'civil', 'ordonanță', 'hotărâre'],
    emoji: '⚖️', name: 'Legi și Justiție',
  },
  defense: {
    keywords: ['apărare', 'armată', 'securitate', 'militari', 'NATO', 'pompieri', 'situații de urgență', 'poliție', 'jandarmerie', 'frontieră'],
    emoji: '🛡️', name: 'Apărare și Securitate',
  },
  international: {
    keywords: ['extern', 'internațional', 'UE', 'Europa', 'relații', 'diplomație', 'ambasad', 'consul', 'parteneriat', 'bilateral'],
    emoji: '🌍', name: 'Relații Internaționale',
  },
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
    'informații pentru chiriași': ['chiriași', 'chiriaș', 'închiriere', 'locuință'],
    'ajutor șomeri': ['șomaj', 'șomeri', 'locuri de muncă'],
    'pensii': ['pensie', 'pensii', 'pensionar'],
    'impozite': ['impozit', 'taxe', 'fiscal', 'anaf'],
    'alocații copii': ['alocație', 'alocații', 'copii', 'copil'],
    'sănătate': ['sănătate', 'spital', 'medic', 'tratament'],
    'educație': ['educație', 'școală', 'elev', 'student'],
    'agricultură': ['agricultură', 'fermier', 'recoltă', 'subvenție'],
    'securitate': ['securitate', 'poliție', 'pompier', 'apărare'],
  }
  for (const [interest, keywords] of Object.entries(interestMap)) {
    if (keywords.some(kw => lower.includes(kw))) interests.push(interest)
  }
  return interests
}

const WORD_REPLACEMENTS: Record<string, string> = {
  'guvernul': 'echipa care conduce țara',
  'adoptat': 'a hotărât',
  'acte normative': 'reguli importante',
  'ședința': 'întâlnirea',
  'ministru': 'persoana importantă',
  'hotărâre': 'decizie',
  'economică': 'cu banii',
  'dezvoltare': 'să crească frumos',
  'implementare': 'să pună în practică',
  'parlamentul': 'casa mare unde se fac legile',
  'buget': 'banii pe care îi avem',
  'legislație': 'regulile țării',
  'infrastructură': 'drumuri și clădiri importante',
  'digitalizare': 'să folosim mai mult computerul',
  'cetățeni': 'oamenii din țară',
  'expropriere': 'să cumpere case și terenuri',
  'hotărâre de guvern': 'decizia echipei care conduce țara',
}

function simplifyContentFallback(text: string): string {
  let simplified = text
  for (const [term, replacement] of Object.entries(WORD_REPLACEMENTS)) {
    simplified = simplified.replace(new RegExp(term, 'gi'), replacement)
  }
  if (simplified.length > 600) simplified = simplified.substring(0, 597) + '...'
  return simplified + ' 🇷🇴✨'
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
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) return null

    // Rate limit: wait 3s before each AI call
    await new Promise(r => setTimeout(r, 3000))

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

    if (!response.ok) {
      console.error(`AI simplify failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    if (data.simplified && data.keyPoints) return data
    return null
  } catch (err) {
    console.error('AI simplify error:', err)
    return null
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\(https?:\/\/[^\)]+\)/g, '')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/[*_]{1,3}/g, '')
    .replace(/\|/g, ' ')
    .replace(/-{3,}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function discoverArticleUrls(firecrawlKey: string, source: typeof RO_SOURCES[0]): Promise<string[]> {
  console.log(`[${source.id}] Discovering articles from: ${source.listingUrl}`)

  // For JS-heavy sites (madr, mae), use Firecrawl map endpoint which handles JS better
  const useMap = source.id === 'madr' || source.id === 'mae'

  let allLinks: string[] = []

  if (useMap) {
    // Use Firecrawl search to find recent articles from these JS-heavy sites
    const domain = new URL(source.listingUrl).hostname
    const response = await fetch(`${FIRECRAWL_API}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `site:${domain} comunicate presa 2026`,
        limit: 20,
        lang: 'ro',
        country: 'RO',
        tbs: 'qdr:m',
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(`Firecrawl search error ${response.status}: ${JSON.stringify(data)}`)
    const results = data.data || []
    allLinks = results.map((r: any) => r.url).filter(Boolean)
  } else {
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
        waitFor: 3000,
        location: { country: 'RO', languages: ['ro'] },
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(`Firecrawl error ${response.status}: ${JSON.stringify(data)}`)
    allLinks = data.data?.links || data.links || []
  }

  console.log(`[${source.id}] Found ${allLinks.length} total links`)

  const articleUrls = allLinks.filter(url => {
    if (SKIP_PATTERNS.some(p => p.test(url))) return false
    if (url === source.listingUrl) return false
    return source.articlePattern.test(url) || source.fallbackPattern.test(url)
  })

  const unique = [...new Set(articleUrls)]
  console.log(`[${source.id}] ${unique.length} article URLs after filtering`)
  return unique.slice(0, 10)
}

async function scrapeArticle(firecrawlKey: string, url: string): Promise<{
  title: string; content: string; date?: string
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
      location: { country: 'RO', languages: ['ro'] },
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

  const cleaned = cleanText(markdown)
  const title = metadata.title || cleaned.split('\n')[0]?.substring(0, 200) || ''

  // Try to extract Romanian date
  const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
  const datePattern = new RegExp(`(\\d{1,2})\\s+(${months.join('|')})\\s+(\\d{4})`, 'i')
  const dateMatch = cleaned.match(datePattern)
  const date = dateMatch ? `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}` : undefined

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
      sources_scraped: RO_SOURCES.map(s => s.id),
    }).select().single()

    const errors: string[] = []
    let totalArticles = 0

    for (const source of RO_SOURCES) {
      try {
        // Step 1: Discover article URLs from listing page
        const articleUrls = await discoverArticleUrls(firecrawlKey, source)

        if (articleUrls.length === 0) {
          errors.push(`${source.id}: No article URLs found`)
          continue
        }

        // Step 2: Scrape each individual article
        for (const articleUrl of articleUrls) {
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

          const skipTitles = ['cookie', 'navigare', 'meniu', 'căutare', 'contact', 'despre noi', 'harta site', 'politica', 'termeni']
          if (skipTitles.some(s => article.title.toLowerCase().includes(s))) continue

          const fullText = article.title + ' ' + article.content
          const { category, emoji, name } = detectCategory(fullText)
          const interests = detectInterests(fullText)

          const roMonths = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
          const now = new Date()
          const articleDate = article.date || `${now.getDate()} ${roMonths[now.getMonth()]} ${now.getFullYear()}`

          // Try AI simplification, fallback to rule-based
          const aiResult = await aiSimplify(article.title, article.content, 'ro')

          const { error: insertError } = await supabase.from('scraped_articles').insert({
            country: 'ro',
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
