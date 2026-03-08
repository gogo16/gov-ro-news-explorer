const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { title, content, language } = await req.json()
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const isRomanian = language === 'ro'

    const systemPrompt = isRomanian
      ? `Ești un asistent care simplifică textele guvernamentale în limba română. Transformă textul într-un limbaj simplu, ușor de înțeles de oricine, inclusiv de un copil de 12 ani. Păstrează informațiile esențiale dar elimină jargonul juridic. Adaugă 1-2 emoji-uri relevante la final. Răspunsul trebuie să aibă maxim 400 caractere.`
      : `You are a helpful assistant that simplifies UK government text into plain English. Make it easy to understand for anyone, including a 12-year-old. Keep essential information but remove legal jargon. Add 1-2 relevant emojis at the end. Keep the response under 400 characters.`

    const userPrompt = isRomanian
      ? `Simplifică următorul text guvernamental:\n\nTitlu: ${title}\n\nConținut: ${content.substring(0, 2000)}`
      : `Simplify this government text:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 2000)}`

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'simplify_article',
              description: 'Return a simplified version and key points of the article',
              parameters: {
                type: 'object',
                properties: {
                  simplified: {
                    type: 'string',
                    description: 'The simplified version of the article text (max 400 chars)',
                  },
                  keyPoints: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '3-4 key points from the article, each with a relevant emoji at the end',
                  },
                },
                required: ['simplified', 'keyPoints'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'simplify_article' } },
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited, please try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      const errorText = await response.text()
      console.error('AI gateway error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'AI simplification failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]
    
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: 'Unexpected AI response format' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = JSON.parse(toolCall.function.arguments)

    return new Response(JSON.stringify({
      simplified: result.simplified,
      keyPoints: result.keyPoints,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Simplify error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
