import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { google } from 'googleapis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── Konfigurace Drive ────────────────────────────────────────────────────────

// Hlavní složka vizuální banky (K01–K10 jsou podsložky)
const VISUAL_BANK_FOLDER_ID = '1tl0_AbkCbBfGIcY6A607KpoLDHxAVL-u'

// Agent styl → K-složka (primary + fallback)
const AGENT_TO_KFOLDER: Record<string, string[]> = {
  editorial_silence: ['K01', 'K03'],
  bold_statement:    ['K02', 'K05'],
  golden_moment:     ['K04', 'K03'],
  the_disruptor:     ['K05', 'K06'],
  clean_educator:    ['K02', 'K03'],
}

// ── Lokální fallback obrázky (K04) ─────────────────────────────────────────

const LOCAL_FALLBACK = [
  '/placeholders/stock-vizualni knihovna/K04/k04-001.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-002.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-003.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-004.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-005.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-006.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-007.jpeg',
]

// ── Drive auth ───────────────────────────────────────────────────────────────

function getDriveClient() {
  const jsonBlob = process.env.GOOGLE_SERVICE_ACCOUNT
  if (jsonBlob) {
    const sa = JSON.parse(jsonBlob) as { client_email: string; private_key: string }
    const auth = new google.auth.JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })
    return google.drive({ version: 'v3', auth })
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  if (!email || !rawKey) throw new Error('Chybí Google Drive credentials')

  const auth = new google.auth.JWT({
    email,
    key: rawKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  return google.drive({ version: 'v3', auth })
}

// ── Načti obrázky z Drive ────────────────────────────────────────────────────
// 2 API volání: (1) najdi K-podsložku, (2) seznam obrázků v ní

async function fetchDriveImages(agentStyle: string): Promise<string[]> {
  try {
    const drive = getDriveClient()
    const kCodes = AGENT_TO_KFOLDER[agentStyle] ?? ['K04']

    // Krok 1: najdi podsložky v hlavní složce
    const foldersRes = await drive.files.list({
      q: `'${VISUAL_BANK_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 30,
    })

    const allFolders = foldersRes.data.files ?? []

    // Najdi matching K-složku (primary, pak fallback)
    let targetFolder: { id?: string | null; name?: string | null } | undefined
    for (const kCode of kCodes) {
      targetFolder = allFolders.find(f => f.name?.startsWith(kCode))
      if (targetFolder?.id) break
    }

    if (!targetFolder?.id) {
      console.warn('[magnet/generate] Žádná Drive složka pro styl:', agentStyle)
      return []
    }

    // Krok 2: seznam obrázků v té složce
    const filesRes = await drive.files.list({
      q: `'${targetFolder.id}' in parents and (mimeType contains 'image/') and trashed = false`,
      fields: 'files(id, name, thumbnailLink, mimeType)',
      pageSize: 50,
      orderBy: 'name',
    })

    const images = (filesRes.data.files ?? [])
      .filter(f => f.thumbnailLink)
      .map(f => f.thumbnailLink!.replace('=s220', '=s800'))

    console.log(`[magnet/generate] Drive: nalezeno ${images.length} obrázků ze složky ${targetFolder.name}`)
    return images

  } catch (err) {
    console.warn('[magnet/generate] Drive fetch selhal, použiji lokální fallback:', err instanceof Error ? err.message : err)
    return []
  }
}

// ── Náhodný výběr bez opakování ──────────────────────────────────────────────

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// ── GPT prompt data ──────────────────────────────────────────────────────────

const AGENT_PROMPTS: Record<string, string> = {
  editorial_silence: 'Piš klidně, minimalisticky. Méně slov, více váhy. Žádné vykřičníky. Ticho mluví.',
  bold_statement:    'Piš silně, přímo. Krátké věty. Silné výroky. Čtenář se zastaví.',
  golden_moment:     'Vyprávěj příběh. Osobní moment. Čtenář se pozná v každém slově.',
  the_disruptor:     'Buď provokativní, nekonvenční. Říkej co ostatní neřeknou. Otřes přesvědčením.',
  clean_educator:    'Edukuj strukturovaně. Jasné kroky, čísla, výsledky. Bez plevelných slov.',
}

const PLATFORM_FORMATS: Record<string, string> = {
  instagram: 'Instagram: hook 1 věta + 3-4 věty tělo + 5 hashtagů',
  facebook:  'Facebook: osobní úvod + 2-3 odstavce + výzva k akci',
  linkedin:  'LinkedIn: odborný hook + strukturovaný obsah + 3 hashtagy',
  reels:     'Reels/TikTok: krátký skript 5-7 vět max, akční, mluvená čeština',
}

// ── Handler ──────────────────────────────────────────────────────────────────

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

    // Spusť Drive fetch a GPT paralelně — šetří čas
    const [driveImages, completion] = await Promise.all([
      fetchDriveImages(agent_style),
      new OpenAI({ apiKey }).chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.85,
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content: `Jsi expert na tvorbu obsahu pro sociální sítě v češtině.
Styl psaní: ${AGENT_PROMPTS[agent_style] ?? AGENT_PROMPTS.golden_moment}
Piš vždy česky. Výsledky jsou pro česky mluvící publikum.`,
          },
          {
            role: 'user',
            content: `${web_url ? `Web značky: ${web_url}` : 'Osobní nebo firemní značka (web nezadán)'}
Témata obsahu: ${topics.join(', ')}
Formáty a platformy:
${platforms.map(p => PLATFORM_FORMATS[p] ?? p).join('\n')}

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
}`,
          },
        ],
      }),
    ])

    // Parsuj GPT výstup
    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned) as {
      posts: Array<{
        platform: string
        topic: string
        hook: string
        body: string
        hashtags: string[]
        type: string
      }>
    }

    // Přiřaď obrázky
    // Drive obrázky pro GRAFIKA/CAROUSEL, lokální K04 fallback pro REELS nebo pokud Drive selhalo
    const imagePool = driveImages.length > 0 ? driveImages : LOCAL_FALLBACK
    const pickedDrive = pickRandom(imagePool, parsed.posts.length)

    const posts = parsed.posts.map((post, i) => {
      // Pro REELS používáme lokální statik (video placeholder), dokud nebude video na Drive
      const isReels = post.type === 'REELS'
      const imageUrl = isReels
        ? LOCAL_FALLBACK[i % LOCAL_FALLBACK.length]
        : (pickedDrive[i] ?? LOCAL_FALLBACK[i % LOCAL_FALLBACK.length])

      return {
        ...post,
        imageUrl,
        imageSource: isReels ? 'local' : (driveImages.length > 0 ? 'drive' : 'local'),
      }
    })

    return NextResponse.json({ ok: true, posts })

  } catch (e) {
    console.error('POST /api/magnet/generate', e)
    const message = e instanceof Error ? e.message : 'Chyba serveru'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
