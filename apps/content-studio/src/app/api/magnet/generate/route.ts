import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Statické obrázky z K04 složky (žádný DALL-E, zatím)
const K04_IMAGES = [
  '/placeholders/stock-vizualni knihovna/K04/k04-001.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-002.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-003.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-004.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-005.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-006.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-007.jpeg',
]

const AGENT_PROMPTS: Record<string, string> = {
  editorial_silence: 'Piš klidně, minimalisticky. Méně slov, více váhy. Žádné vykřičníky. Ticho mluví.',
  bold_statement: 'Piš silně, přímo. Krátké věty. Silné výroky. Čtenář se zastaví.',
  golden_moment: 'Vyprávěj příběh. Osobní moment. Čtenář se pozná v každém slově.',
  the_disruptor: 'Buď provokativní, nekonvenční. Říkej co ostatní neřeknou. Otřes přesvědčením.',
  clean_educator: 'Edukuj strukturovaně. Jasné kroky, čísla, výsledky. Bez plevelných slov.',
}

const PLATFORM_FORMATS: Record<string, string> = {
  instagram: 'Instagram: hook 1 věta + 3-4 věty tělo + 5 hashtagů',
  facebook: 'Facebook: osobní úvod + 2-3 odstavce + výzva k akci',
  linkedin: 'LinkedIn: odborný hook + strukturovaný obsah + 3 hashtagy',
  reels: 'Reels/TikTok: krátký skript 5-7 vět max, akční, mluvená čeština',
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      web_url?: string
      agent_style: string
      platforms: string[]
      topics: string[]
    }

    const { web_url, agent_style, platforms, topics } = body

    if (!topics?.length || !platforms?.length) {
      return NextResponse.json({ ok: false, error: 'Chybí témata nebo platformy.' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY není nastaven.' }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })

    const agentInstructions = AGENT_PROMPTS[agent_style] ?? AGENT_PROMPTS.golden_moment
    const platformFormat = platforms.map(p => PLATFORM_FORMATS[p] ?? p).join('\n')
    const topicList = topics.join(', ')
    const webContext = web_url ? `Web značky: ${web_url}` : 'Osobní nebo firemní značka (web nezadán)'

    const systemPrompt = `Jsi expert na tvorbu obsahu pro sociální sítě v češtině.
Styl psaní: ${agentInstructions}
Piš vždy česky. Výsledky jsou pro česky mluvící publikum.`

    const userPrompt = `${webContext}
Témata obsahu: ${topicList}
Formáty a platformy:
${platformFormat}

Vytvoř 3 různé příspěvky. Každý na jiné téma ze seznamu, jiný úhel pohledu.

Odpověz POUZE validním JSON (bez markdown, bez code bloků):
{
  "posts": [
    {
      "platform": "název platformy",
      "topic": "téma",
      "hook": "první věta - zaujme okamžitě",
      "body": "zbytek textu příspěvku",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
      "type": "GRAFIKA nebo REELS nebo CAROUSEL"
    }
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.85,
      max_tokens: 1200,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''

    // Parsuj JSON - odstraň případné markdown wrappers
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned) as { posts: Array<{
      platform: string
      topic: string
      hook: string
      body: string
      hashtags: string[]
      type: string
    }> }

    // Přidej statické obrázky (rotate přes K04)
    const posts = parsed.posts.map((post, i) => ({
      ...post,
      imageUrl: K04_IMAGES[i % K04_IMAGES.length],
    }))

    return NextResponse.json({ ok: true, posts })

  } catch (e) {
    console.error('POST /api/magnet/generate', e)
    const message = e instanceof Error ? e.message : 'Chyba serveru'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
