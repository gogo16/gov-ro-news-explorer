import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Romanian government sources to scrape
const RO_SOURCES = [
  {
    id: 'gov',
    name: 'Guvernul României',
    url: 'https://gov.ro/ro/guvernul/sedinte-guvern',
  },
  {
    id: 'mai',
    name: 'Min. Afacerilor Interne',
    url: 'https://www.mai.gov.ro/category/comunicate-de-presa/',
  },
  {
    id: 'ms',
    name: 'Min. Sănătății',
    url: 'https://www.ms.ro/ro/informatii-de-interes-public/noutati/',
  },
  {
    id: 'madr',
    name: 'Min. Agriculturii',
    url: 'https://www.madr.ro/comunicare/comunicate-de-presa.html',
  },
  {
    id: 'mae',
    name: 'Min. Afacerilor Externe',
    url: 'https://www.mae.ro/node/2011',
  },
]

// Romanian category detection
const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; emoji: string; name: string }> = {
  agriculture: {
    keywords: ['agricultură', 'fermieri', 'culturi', 'animale', 'recoltă', 'pământ', 'semințe', 'tractoare', 'apia', 'subvenți', 'fonduri agricole'],
    emoji: '🚜', name: 'Agricultură',
  },
  budget: {
    keywords: ['buget', 'bani', 'finanțare', 'cheltuieli', 'venituri', 'investiții', 'economie', 'financiar', 'lei', 'milioane', 'miliarde'],
    emoji: '💰', name: 'Buget și Finanțe',
  },
  people: {
    keywords: ['cetățeni', 'populație', 'oameni', 'familii', 'copii', 'pensionari', 'tineri', 'social'],
    emoji: '👥', name: 'Oameni și Societate',
  },
  education: {
    keywords: ['educație', 'școli', 'universități', 'elevi', 'studenți', 'învățământ', 'profesori'],
    emoji: '🎓', name: 'Educație',
  },
  health: {
    keywords: ['sănătate', 'spitale', 'medici', 'tratament', 'medicină', 'pacienți', 'asigurări', 'coronavirus', 'covid', 'vaccinare'],
    emoji: '🏥', name: 'Sănătate',
  },
  infrastructure: {
    keywords: ['drumuri', 'poduri', 'construcții', 'transport', 'autostrăzi', 'infrastructură', 'expropriere', 'centură'],
    emoji: '🛣️', name: 'Infrastructură',
  },
  environment: {
    keywords: ['mediu', 'natură', 'poluare', 'ecologie', 'sustenabilitate', 'energie verde'],
    emoji: '🌱', name: 'Mediu',
  },
  technology: {
    keywords: ['digitalizare', 'tehnologie', 'computer', 'internet', 'digital', 'IT'],
    emoji: '💻', name: 'Tehnologie',
  },
  law: {
    keywords: ['lege', 'juridic', 'justiție', 'tribunal', 'regulament', 'normativ', 'penal', 'civil', 'ordonanță'],
    emoji: '⚖️', name: 'Legi și Justiție',
  },
  defense: {
    keywords: ['apărare', 'armată', 'securitate', 'militari', 'NATO', 'pompieri', 'situații de urgență', 'poliție', 'jandarmerie'],
    emoji: '🛡️', name: 'Apărare și Securitate',
  },
  international: {
    keywords: ['extern', 'internațional', 'UE', 'Europa', 'relații', 'diplomație', 'ambasad', 'consul', 'parteneriat'],
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

// Romanian word replacements for kid-friendly text
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

function simplifyContent(text: string): string {
  let simplified = text
  for (const [term, replacement] of Object.entries(WORD_REPLACEMENTS)) {
    simplified = simplified.replace(new RegExp(term, 'gi'), replacement)
  }
  if (simplified.length > 500) {
    simplified = simplified.substring(0, 497) + '...'
  }
  const endings = [
    ' Lucrează pentru ca România să fie și mai frumoasă! 🇷🇴❤️',
    ' Lucruri bune se întâmplă! ✨🎉',
    ' Totul pentru oamenii din țara noastră! 👥💪',
  ]
  return simplified + endings[Math.floor(Math.random() * endings.length)]
}

function extractKeyPoints(text: string): string[] {
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
      sources_scraped: RO_SOURCES.map(s => s.id),
    }).select().single()

    const errors: string[] = []
    let totalArticles = 0

    for (const source of RO_SOURCES) {
      try {
        console.log(`Scraping ${source.name}: ${source.url}`)

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
            location: { country: 'RO', languages: ['ro'] },
          }),
        })

        const scrapeData = await scrapeResponse.json()

        if (!scrapeResponse.ok) {
          errors.push(`${source.id}: Firecrawl error ${scrapeResponse.status}`)
          console.error(`Firecrawl error for ${source.id}:`, scrapeData)
          continue
        }

        const markdown = scrapeData.data?.markdown || scrapeData.markdown || ''

        if (!markdown) {
          errors.push(`${source.id}: No content returned`)
          continue
        }

        // Parse articles from the markdown content
        const articleBlocks = markdown.split(/\n#{1,3}\s+/).filter((b: string) => b.trim().length > 50)

        for (const block of articleBlocks.slice(0, 5)) {
          const lines = block.split('\n').filter((l: string) => l.trim())
          if (lines.length < 2) continue

          // Clean markdown links from title
          const title = lines[0].replace(/[\[\]#*]/g, '').replace(/\(https?:\/\/[^\)]+\)/g, '').trim()
          if (!title || title.length < 10) continue

          // Skip non-article content
          const skipPatterns = ['cookie', 'navigare', 'meniu', 'footer', 'sidebar', 'search', 'căutare']
          if (skipPatterns.some(p => title.toLowerCase().includes(p))) continue

          // Clean content
          const content = lines.slice(1).join(' ').replace(/[\[\]#*]/g, '').replace(/\(https?:\/\/[^\)]+\)/g, '').replace(/!\S+/g, '').trim()
          if (content.length < 30) continue

          // Extract URL from markdown links
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

          // Romanian date format
          const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
          const now = new Date()
          const today = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

          const { error: insertError } = await supabase.from('scraped_articles').insert({
            country: 'ro',
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
