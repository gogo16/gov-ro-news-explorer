import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// UK government sources to scrape
const UK_SOURCES = [
  {
    id: 'govuk',
    name: 'GOV.UK',
    url: 'https://www.gov.uk/search/news-and-communications?order=updated-newest',
    categories: ['housing', 'tax', 'benefits', 'education', 'employment', 'immigration', 'transport', 'environment'],
  },
  {
    id: 'hmrc',
    name: 'HMRC',
    url: 'https://www.gov.uk/government/organisations/hm-revenue-customs',
    categories: ['tax', 'benefits'],
  },
  {
    id: 'nhs',
    name: 'NHS',
    url: 'https://www.england.nhs.uk/news/',
    categories: ['health'],
  },
]

// Category detection
const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; emoji: string; name: string }> = {
  housing: { keywords: ['housing', 'landlord', 'tenant', 'rent', 'home', 'property', 'building'], emoji: '🏠', name: 'Housing' },
  tax: { keywords: ['tax', 'hmrc', 'self-assessment', 'vat', 'income tax', 'duty'], emoji: '💷', name: 'Tax' },
  benefits: { keywords: ['benefit', 'universal credit', 'pension', 'allowance', 'welfare', 'dwp'], emoji: '🤝', name: 'Benefits' },
  health: { keywords: ['health', 'nhs', 'hospital', 'mental health', 'doctor', 'vaccine', 'medical'], emoji: '🏥', name: 'Health' },
  education: { keywords: ['education', 'school', 'university', 'student', 'ofsted', 'childcare'], emoji: '🎓', name: 'Education' },
  employment: { keywords: ['employment', 'job', 'worker', 'minimum wage', 'workplace'], emoji: '💼', name: 'Employment' },
  immigration: { keywords: ['immigration', 'visa', 'asylum', 'border', 'passport'], emoji: '🌍', name: 'Immigration' },
  transport: { keywords: ['transport', 'rail', 'road', 'driving', 'highway'], emoji: '🚗', name: 'Transport' },
  environment: { keywords: ['environment', 'climate', 'energy', 'green', 'pollution'], emoji: '🌱', name: 'Environment' },
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
    'info for landlords': ['landlord', 'rental property', 'tenancy'],
    'benefits for unemployed': ['unemployment', 'jobseeker', 'universal credit'],
    'universal credit': ['universal credit'],
    'council tax': ['council tax'],
    'childcare': ['childcare', 'nursery', 'child benefit'],
    'NHS services': ['nhs', 'hospital', 'gp surgery', 'health service'],
    'visa & immigration': ['visa', 'immigration', 'passport'],
  }
  for (const [interest, keywords] of Object.entries(interestMap)) {
    if (keywords.some(kw => lower.includes(kw))) interests.push(interest)
  }
  return interests
}

function simplifyContent(text: string): string {
  // Simple rule-based simplification
  let simplified = text
    .replace(/\b(pursuant to|in accordance with|notwithstanding)\b/gi, 'following')
    .replace(/\b(aforementioned|hereinafter)\b/gi, 'this')
    .replace(/\b(shall be entitled to)\b/gi, 'can')
    .replace(/\b(with immediate effect)\b/gi, 'right away')
    .replace(/\b(in the event that)\b/gi, 'if')
    .replace(/\b(for the purpose of)\b/gi, 'to')
    .replace(/\b(it is anticipated that)\b/gi, 'we expect')

  // Truncate if too long
  if (simplified.length > 500) {
    simplified = simplified.substring(0, 497) + '...'
  }

  return simplified + ' 📋✨'
}

function extractKeyPoints(text: string): string[] {
  // Split by sentences and pick first 3 meaningful ones
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  return sentences.slice(0, 3).map((s, i) => {
    const emojis = ['📌', '✅', '💡', '⚡', '🔔']
    return `${s.trim()}. ${emojis[i % emojis.length]}`
  })
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

    // Create run log
    const { data: run } = await supabase.from('scraper_runs').insert({
      status: 'running',
      sources_scraped: UK_SOURCES.map(s => s.id),
    }).select().single()

    const errors: string[] = []
    let totalArticles = 0

    for (const source of UK_SOURCES) {
      try {
        console.log(`Scraping ${source.name}: ${source.url}`)

        // Use Firecrawl to scrape
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source.url,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
          }),
        })

        const scrapeData = await scrapeResponse.json()

        if (!scrapeResponse.ok) {
          errors.push(`${source.id}: Firecrawl error ${scrapeResponse.status}`)
          console.error(`Firecrawl error for ${source.id}:`, scrapeData)
          continue
        }

        const markdown = scrapeData.data?.markdown || scrapeData.markdown || ''
        const links = scrapeData.data?.links || scrapeData.links || []
        const metadata = scrapeData.data?.metadata || scrapeData.metadata || {}

        if (!markdown) {
          errors.push(`${source.id}: No content returned`)
          continue
        }

        // Parse articles from the markdown content
        // Split by headers or strong patterns that indicate article boundaries
        const articleBlocks = markdown.split(/\n#{1,3}\s+/).filter((b: string) => b.trim().length > 50)

        for (const block of articleBlocks.slice(0, 5)) { // Max 5 articles per source
          const lines = block.split('\n').filter((l: string) => l.trim())
          if (lines.length < 2) continue

          const title = lines[0].replace(/[\[\]#*]/g, '').trim()
          if (!title || title.length < 10) continue

          const content = lines.slice(1).join(' ').replace(/[\[\]#*]/g, '').trim()
          if (content.length < 30) continue

          // Extract URL from markdown links in the block
          const urlMatch = block.match(/\((https?:\/\/[^\)]+)\)/)
          const articleUrl = urlMatch ? urlMatch[1] : source.url

          // Check if already exists
          const { data: existing } = await supabase
            .from('scraped_articles')
            .select('id')
            .eq('url', articleUrl)
            .eq('title', title)
            .maybeSingle()

          if (existing) continue

          const { category, emoji, name } = detectCategory(title + ' ' + content)
          const interests = detectInterests(title + ' ' + content)
          const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

          const { error: insertError } = await supabase.from('scraped_articles').insert({
            country: 'uk',
            source: source.id,
            title,
            original_content: content.substring(0, 2000),
            simplified_content: simplifyContent(content),
            detailed_points: extractKeyPoints(content),
            category,
            category_emoji: emoji,
            category_name: name,
            url: articleUrl,
            tags: ['new'],
            interests,
            article_date: today,
          })

          if (insertError) {
            errors.push(`${source.id}: Insert error - ${insertError.message}`)
          } else {
            totalArticles++
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${source.id}: ${msg}`)
        console.error(`Error scraping ${source.id}:`, err)
      }
    }

    // Update run log
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
