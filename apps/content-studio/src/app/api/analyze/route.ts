import { NextResponse } from "next/server";
import { selectStrategists } from "@/lib/strategist-selector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const FIRECRAWL_V1 = "https://api.firecrawl.dev/v1";
const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o";
const FETCH_TIMEOUT_MS = 55_000;

function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

type Scraped = {
  markdown: string;
  screenshot: string | null;
  url: string;
  title?: string;
  description?: string;
};

// /v2/scrape — homepage screenshot + markdown
async function scrapeWithFirecrawl(url: string, apiKey: string): Promise<Scraped> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetchWithTimeout(
    `${FIRECRAWL_V2}/scrape`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: normalized,
        formats: [
          { type: "markdown" },
          { type: "screenshot", viewport: { width: 1280, height: 800 } },
        ],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    },
    FETCH_TIMEOUT_MS
  );

  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { error?: string; message?: string; param?: string };
    const raw = e?.message ?? e?.error ?? `Firecrawl error ${res.status}`;
    const msg = raw.toLowerCase().includes("bad request") || res.status === 400
      ? "URL není platná nebo web se nepodařilo načíst. Zkuste zkontrolovat adresu a zkusit znovu."
      : raw;
    if (process.env.NODE_ENV !== "production") {
      console.error("[analyze] Firecrawl scrape error:", { raw, message: msg, param: e?.param });
    }
    throw new Error(msg);
  }

  const data = await res.json();
  if (!(data as { success?: boolean }).success) {
    throw new Error((data as { error?: string }).error || "Nepodařilo se načíst web");
  }

  const d = (data as {
    data?: {
      markdown?: string;
      screenshot?: string;
      metadata?: { title?: string | string[]; description?: string | string[] };
    };
  }).data;
  const meta = d?.metadata;
  const title = meta?.title == null ? undefined : Array.isArray(meta.title) ? meta.title[0] : meta.title;
  const description = meta?.description == null ? undefined : Array.isArray(meta.description) ? meta.description[0] : meta.description;
  return {
    markdown: d?.markdown ?? "",
    screenshot: d?.screenshot ?? null,
    url: normalized,
    title,
    description,
  };
}

type CrawlPage = {
  url?: string;
  markdown?: string;
  metadata?: { title?: string };
};

// /v1/crawl — celý web, max 10 podstránok, polling
async function crawlWithFirecrawl(url: string, apiKey: string): Promise<string> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;

  // Spusti crawl
  const crawlRes = await fetchWithTimeout(
    `${FIRECRAWL_V1}/crawl`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: normalized,
        limit: 10,
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: true,
        },
      }),
    },
    FETCH_TIMEOUT_MS
  );

  if (!crawlRes.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[analyze] Firecrawl crawl start failed:", crawlRes.status);
    }
    return "";
  }

  const crawlData = await crawlRes.json() as { id?: string };
  const crawlId = crawlData.id;
  if (!crawlId) return "";

  // Polling — max 25 iterácií × 2s = 50s
  let crawlResult: { status?: string; data?: CrawlPage[] } | null = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(
      `${FIRECRAWL_V1}/crawl/${crawlId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const statusData = await statusRes.json() as { status?: string; data?: CrawlPage[] };
    if (statusData?.status === "completed") {
      crawlResult = statusData;
      break;
    }
  }

  if (!crawlResult?.data?.length) return "";

  // Prioritné stránky navrchu
  const priorityPages = crawlResult.data.filter(p => {
    const u = p.url?.toLowerCase() || "";
    return u.includes("cen") || u.includes("reference") ||
           u.includes("o-nas") || u.includes("about") ||
           u.includes("sluzb") || u.includes("kontakt");
  });

  const priorityMarkdown = priorityPages
    .map(p => `\n\n## DŮLEŽITÁ STRÁNKA: ${p.url}\n${p.markdown || ""}`)
    .join("\n");

  const allMarkdown = crawlResult.data
    .map(p => `\n\n## ${p.metadata?.title || p.url}\n${p.markdown || ""}`)
    .join("\n");

  return (priorityMarkdown + "\n\n" + allMarkdown).slice(0, 25000);
}

function buildAnalyzeInput(scraped: Scraped, contentMarkdown: string): string {
  const textContent = contentMarkdown.slice(0, 10000);
  return `Analyzuj následující web na základě jeho skutečného obsahu. Veškerou odpověď piš výhradně v češtině.

URL: ${scraped.url}
Název: ${scraped.title ?? ""}
Meta popis: ${scraped.description ?? ""}

OBSAH WEBU (markdown):
---
${textContent}
---

Vrať čistý text (ne JSON), oddělené sekce, vše v češtině:

1. Shrnutí positioning – jak se web/služba prezentuje, hlavní sdělení.
2. Cílovou skupinu – komu je nabídka určena (pokud je z obsahu zřejmá).
3. Silné stránky – co web dělá dobře z hlediska brandu a komunikace.
4. Slabiny – co chybí nebo co by šlo zlepšit.
5. Doporučení dalšího kroku – konkrétní návrh, kam směřovat (např. vizuální identita, obsah, CTA).`;
}

const PILLAR_ANALYSIS_SCHEMA = `
  "pillarAnalysis": {
    "light": { "score": 1-10 celé číslo, "interpretation": "3-4 věty česky", "observed": ["nález 1"], "notObserved": ["co chybí 1"], "reasoning": "2-4 věty proč", "strategicOpportunity": "jedna věta" },
    "energy": { "score": 1-10 celé číslo, "interpretation": "...", "observed": ["..."], "notObserved": ["..."], "reasoning": "...", "strategicOpportunity": "..." },
    "architecture": { "score": 1-10 celé číslo, "interpretation": "...", "observed": ["..."], "notObserved": ["..."], "reasoning": "...", "strategicOpportunity": "..." },
    "identity": { "score": 1-10 celé číslo, "interpretation": "...", "observed": ["..."], "notObserved": ["..."], "reasoning": "...", "strategicOpportunity": "..." },
    "trust": { "score": 1-10 celé číslo, "interpretation": "...", "observed": ["..."], "notObserved": ["..."], "reasoning": "...", "strategicOpportunity": "..." }
  }
`;

const DIAGNOSTIKA_METHODOLOGY = `
JAZYK: Veškerý výstup piš výhradně v češtině – interpretation, observed, notObserved, reasoning, strategicOpportunity, summary i všechny položky v polích. Žádná angličtina.

Hodnoť VÝHRADNĚ podle těchto kritérií. Každý pilíř ohodnoť na stupnici 1–10, kde:
1–3 = chybí úplně
4–5 = základní úroveň
6–7 = průměrná úroveň
8–9 = nadprůměrná úroveň
10 = výjimečná úroveň
Buď konzistentní — stejný web musí dostat stejné skóre.

You are a senior brand strategist. Generate output using this strict structure for EACH pillar.

POVINNÉ u KAŽDÉHO pilíře (light, energy, architecture, identity, trust):
- score: 1–10 celé číslo (odpovídá škále výše a tomu, co jste v observed/notObserved/reasoning popsali).
- interpretation: 3–4 věty pro veřejnou část – stručně, profesionálně, co značka v pilíři dělá a co jí chybí.
- observed: pole s min. 1 konkrétním nálezem (co jste na webu/v podkladech zaznamenali). Nikdy ne prázdné.
- notObserved: pole s min. 1 položkou (co chybí nebo co by mohlo být lepší). Nikdy ne prázdné.
- reasoning: 2–4 věty – proč jste dali toto skóre, z čeho jste vycházeli. Povinné. Bez reasoning není hodnocení kompletní.
- strategicOpportunity: jedna věta – doporučený směr.

Rules:
- Be analytical, not judgmental. Explain logic clearly. Avoid generic phrases; use concrete findings.
- Skóre musí být zdůvodněno: observed + notObserved + reasoning musí odpovídat číslu. Nelze dát např. 10/10 bez vyplněného reasoning a konkrétních observed/notObserved.
- HODNOTA (light): Hodnoť jasnost hodnotové propozice. Co konkrétně nabízí, komu, proč právě oni. Observed: přítomnost headline, konkrétní nabídka, jasná cílová skupina, ceník nebo orientační ceny. NotObserved: co z toho chybí. Score 8+ pouze pokud je nabídka jednoznačná bez nutnosti hledat.
- ENERGIE (energy): Hodnoť emoční náboj a dynamiku komunikace. Observed: silná slovesa, osobní tón, příběh, humor nebo vášeň, jasná osobnost autora. NotObserved: co z toho chybí. Score 8+ pouze pokud čtenář cítí osobnost za textem ihned.
- ARCHITEKTURA (architecture): Hodnoť strukturu a UX webu. Observed: jasná navigace, logické řazení obsahu, CTA na správných místech, rychlost načítání (odhadni), mobilní optimalizace (odhadni ze struktury). NotObserved: co chybí. Score 8+ pouze pokud cesta od příchodu k akci je intuitivní.
- IDENTITA (identity): Hodnoť vizuální konzistenci a rozpoznatelnost. Observed: konzistentní barevná paleta, profesionální fotografie, vlastní styl písma nebo grafiky, rozpoznatelný vizuální jazyk. NotObserved: co chybí. Score 8+ pouze pokud vizuální identita je unikátní a konzistentní.
- DŮVĚRA (trust): Rozlišuj tři úrovně důkazu:
  1. Reference = citace od jmenovaného klienta s kontextem (firma, jméno) → silný důkaz, skóre min. 7/10 pokud jsou 3+
  2. Portfolio = ukázka práce bez hodnocení klienta → střední důkaz
  3. Case study = konkrétní výsledek s čísly → nejsilnější důkaz, skóre 9-10/10
  DŮLEŽITÉ: Pokud jsou na stránce citace od jmenovaných klientů, považuj je za reference a uveď je v observed[]. Do notObserved[] dávej jen co skutečně chybí. Nikdy nepiš chybí reference pokud jsou na stránce citace s jmény klientů.
`;

const CRAWL_INSTRUCTIONS = `
Analyzuj CELÝ web vrátane podstránok. Venuj zvláštnou pozornost:
- Cenník a ceny (ak existujú)
- Referencie a hodnotenia klientov
- O nás / tím
- Služby a produkty
- CTA prvky na každej stránke

Hľadaj konkrétne:
- Chýbajúce social proof
- Slabé miesta v predajnom funneli
- Vizuálna konzistencia naprieč stránkami
- Kvalita copywritingu
`;

function buildDiagnostikaPromptFromText(sourceContent: string): string {
  const text = sourceContent.slice(0, 25000);
  return `Analyzuj zadané podklady o značce a vrať POUZE jeden validní JSON objekt (žádný text před/za ním).

OBSAH (zadaný text nebo extrahovaný z dokumentu):
---
${text}
---
${DIAGNOSTIKA_METHODOLOGY}

JSON musí mít přesně tento tvar:
{
  "brandScore": {
    "total": <číslo 0-100, průměr skóre všech 5 pilířů × 10, zaokrouhleno>,
    "hasHeadline": true/false,
    "hasOffer": true/false,
    "hasTargetAudience": true/false,
    "hasCTA": true/false,
    "hasVisualIdentity": true/false,
    "hasSocialProof": true/false
  },
  "brandDna": {
    "name": "string nebo null",
    "positioning": "string nebo null",
    "tone": "string nebo null",
    "targetAudience": "string nebo null",
    "communicationStyle": "string nebo null",
    "uniqueValue": "string nebo null",
    "contentPillars": ["string"] nebo [],
    "missingElements": ["string"] nebo [],
    "visualStyle": { "primaryColor": "#hex", "secondaryColor": "#hex", "mood": "string", "typography": "string" } nebo null
  },
  "summary": "Krátké shrnutí od stratéga – 2–4 věty.",
  ${PILLAR_ANALYSIS_SCHEMA.trim()}
}`;
}

function buildDiagnostikaPrompt(scraped: Scraped, contentMarkdown: string): string {
  const textContent = contentMarkdown.slice(0, 25000);
  return `Jsi expert na brand strategii a marketing.
Analyzuj KOMPLETNÍ obsah webu níže a vytvoř hlubokou Brand DNA diagnostiku.

Web: ${scraped.url}
Obsah (${textContent.length} znaků):
${textContent}

Vrať JSON s touto PŘESNOU strukturou:
{
  "brandScore": {
    "total": číslo 0-100,
    "hasHeadline": true/false,
    "hasOffer": true/false,
    "hasTargetAudience": true/false,
    "hasCTA": true/false,
    "hasVisualIdentity": true/false,
    "hasSocialProof": true/false
  },
  "brandDna": {
    "name": "název značky",
    "positioning": "konkrétní positioning v 1-2 větách",
    "tone": "tón komunikace s příklady ze skutečného textu webu",
    "targetAudience": "detailní popis cílové skupiny - věk, profese, potřeby",
    "communicationStyle": "styl komunikace s konkrétními příklady",
    "uniqueValue": "unikátní hodnota - co dělá jinak než konkurence",
    "contentPillars": ["pilíř 1", "pilíř 2", "pilíř 3", "pilíř 4"],
    "missingElements": ["co chybí 1", "co chybí 2", "co chybí 3"],
    "prices": "konkrétní ceny pokud jsou na webu - uveď přesné částky",
    "services": ["služba 1 s popisem", "služba 2 s popisem"],
    "testimonials": "shrnutí referencí klientů pokud jsou na webu",
    "strengths": ["silná stránka 1", "silná stránka 2", "silná stránka 3"],
    "weaknesses": ["slabá stránka 1", "slabá stránka 2", "slabá stránka 3"],
    "visualStyle": {
      "mood": "popis vizuálního stylu",
      "colors": "barvy které jsou patrné",
      "typography": "typografie pokud je patrná"
    }
  },
  "summary": "Strategický souhrn 3-4 věty s konkrétními doporučeními",
  "pillarAnalysis": {
    "light": { "score": 1-10, "interpretation": "co jsme zjistili" },
    "energy": { "score": 1-10, "interpretation": "co jsme zjistili" },
    "architecture": { "score": 1-10, "interpretation": "co jsme zjistili" },
    "identity": { "score": 1-10, "interpretation": "co jsme zjistili" },
    "trust": { "score": 1-10, "interpretation": "co jsme zjistili - reference, ceny, garance" }
  },
  "suggested_strategists": ["id1", "id2"]
}

DŮLEŽITÉ:
- Pokud web obsahuje ceny, uveď je PŘESNĚ
- Pokud web obsahuje reference, popiš je konkrétně
- Pokud web neobsahuje něco důležitého, uveď to jako slabinu
- Vše musí vycházet z REÁLNÉHO obsahu webu, ne z domněnek
- Vrať POUZE JSON, nic jiného`;
}

function getTextFromChatResponse(data: unknown): string {
  if (data == null) return "No output received";
  const d = data as { model?: string; choices?: Array<{ message?: { content?: unknown } }> };
  const content = d.choices?.[0]?.message?.content;
  if (content == null) return "No output received";
  const text = typeof content === "string" ? content.trim() : "";
  return text || "No output received";
}

const PILLAR_KEYS = ["light", "energy", "architecture", "identity", "trust"] as const;

function parseDiagnostikaResult(raw: string): Record<string, unknown> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI nevrátilo platný JSON");
  return JSON.parse(match[0]) as Record<string, unknown>;
}

function validatePillarScores(result: Record<string, unknown>): void {
  const pillarAnalysis = result.pillarAnalysis as Record<string, { score?: unknown }> | undefined;
  if (!pillarAnalysis || typeof pillarAnalysis !== "object") {
    throw new Error("Chybí pillarAnalysis");
  }
  for (const key of PILLAR_KEYS) {
    const pillar = pillarAnalysis[key];
    if (!pillar || typeof pillar !== "object") {
      throw new Error(`Pilíř "${key}" chybí nebo není objekt`);
    }
    const score = pillar.score;
    const num = typeof score === "string" ? parseInt(score, 10) : typeof score === "number" ? score : NaN;
    if (Number.isNaN(num) || num < 1 || num > 10 || Math.floor(num) !== num) {
      throw new Error(`Pilíř "${key}" má neplatné score (očekáváno celé číslo 1–10): ${String(score)}`);
    }
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Neplatný požadavek (chybí nebo poškozené JSON tělo)." },
        { status: 400 }
      );
    }
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const manualData = typeof body?.manualData === "string" ? body.manualData.trim() : "";
    const pdfBase64 = typeof body?.pdfBase64 === "string" ? body.pdfBase64 : "";
    const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : "";
    const imageMimeType = typeof body?.imageMimeType === "string" ? body.imageMimeType : "";
    const formatDiagnostika = body?.format === "diagnostika";

    const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
    if (imageBase64) {
      if (!imageMimeType || !allowedImageTypes.includes(imageMimeType)) {
        return NextResponse.json({ error: "Nepovolený formát obrázku." }, { status: 400 });
      }
      const imageBuffer = Buffer.from(imageBase64, "base64");
      if (imageBuffer.length > 1 * 1024 * 1024) {
        return NextResponse.json({ error: "Obrázek je příliš velký." }, { status: 400 });
      }
    }

    let sourceContent = "";
    let scraped: Scraped | null = null;

    if (url) {
      const firecrawlKey = process.env.FIRECRAWL_API_KEY;
      if (!firecrawlKey) return NextResponse.json({ error: "FIRECRAWL_API_KEY není nastaven." }, { status: 500 });

      // Scrape (screenshot + homepage) a crawl (celý web) bežia súčasne
      const [scrapeResult, crawlMarkdown] = await Promise.all([
        scrapeWithFirecrawl(url, firecrawlKey),
        crawlWithFirecrawl(url, firecrawlKey),
      ]);

      scraped = scrapeResult;
      if (!scraped.markdown && !scraped.screenshot) {
        return NextResponse.json({ error: "Web nevrátil žádný obsah." }, { status: 422 });
      }
      // Crawl markdown má prednosť (viac stránok), fallback na homepage
      sourceContent = crawlMarkdown || scraped.markdown || "";
    }

    if (manualData) {
      sourceContent = sourceContent ? `${sourceContent}\n\n--- Zadaný text ---\n\n${manualData}` : manualData;
    }

    if (pdfBase64) {
      const buffer = Buffer.from(pdfBase64, "base64");
      const maxSize = 2 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return NextResponse.json({ error: "Soubor je příliš velký. Maximální velikost je 2 MB." }, { status: 400 });
      }
      const pdfParse = (await import("pdf-parse")).default as (buf: Buffer) => Promise<{ text: string }>;
      const { text: pdfText } = await pdfParse(buffer);
      sourceContent = sourceContent ? `${sourceContent}\n\n--- PDF ---\n\n${pdfText}` : pdfText;
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ error: "OPENAI_API_KEY není nastaven." }, { status: 500 });

    if (!sourceContent.trim()) {
      return NextResponse.json(
        { error: "Zadejte URL webu, text o značce nebo nahrajte PDF." },
        { status: 400 }
      );
    }

    if (!formatDiagnostika && !scraped) {
      return NextResponse.json({ error: "Pro analýzu bez diagnostiky je potřeba zadat URL webu." }, { status: 400 });
    }

    let prompt = formatDiagnostika
      ? (scraped ? buildDiagnostikaPrompt(scraped, sourceContent) : buildDiagnostikaPromptFromText(sourceContent))
      : buildAnalyzeInput(scraped!, sourceContent);

    if (imageBase64 && imageMimeType) {
      prompt += "\n\nUživatel přiložil ukázku grafiky nebo fotografie značky. Vyhodnoť ji v kontextu vizuální identity a emoční stopy (pilíř Identita a celkový dojem).";
    }

    const messageContent = imageBase64 && imageMimeType && allowedImageTypes.includes(imageMimeType)
      ? [
          { type: "text" as const, text: prompt },
          { type: "image_url" as const, image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
        ]
      : prompt;

    const response = await fetchWithTimeout(
      OPENAI_CHAT_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            {
              role: "system",
              content: "Jsi senior brand stratég s 20 lety zkušeností. Analyzuješ značky přesně, konkrétně a konzistentně. Vždy píšeš výhradně česky. Nikdy negeneralizuješ — vycházíš pouze z toho co reálně vidíš v podkladech."
            },
            { role: "user", content: messageContent }
          ],
          max_tokens: formatDiagnostika ? 4200 : 2000,
          ...(formatDiagnostika ? { temperature: 0.1, seed: 42 } : {}),
        }),
      },
      FETCH_TIMEOUT_MS
    );

    const data = await response.json();

    if (!response.ok) {
      const err = (data as { error?: { message?: string; param?: string } }).error;
      const errMsg = err?.message ?? (data as { error?: string }).error ?? `OpenAI error ${response.status}`;
      if (process.env.NODE_ENV !== "production") {
        console.error("[analyze] OpenAI error:", { message: errMsg, param: err?.param });
      }
      return NextResponse.json({ error: errMsg }, { status: response.status >= 500 ? 500 : 400 });
    }

    const outputText = getTextFromChatResponse(data);

    const scrapedPayload = scraped
      ? { markdown: scraped.markdown, screenshot: scraped.screenshot, url: scraped.url, title: scraped.title, description: scraped.description }
      : { markdown: sourceContent, screenshot: null, url: "", title: "", description: "" };

    if (formatDiagnostika) {
      try {
        const result = parseDiagnostikaResult(outputText);
        validatePillarScores(result);
        const total = (result.brandScore as { total?: number } | undefined)?.total;
        const analyzedUrl = scraped?.url ?? "";
        console.log("[diagnostika]", {
          url: analyzedUrl,
          totalScore: total,
          at: new Date().toISOString(),
        });
        const suggested = selectStrategists(result);

        // Generuj 3 príspevky z Brand DNA
        const brandDna = result.brandDna as Record<string, unknown> | undefined;
        const postsPrompt = `Si expert na social media obsah.
Na základe tejto Brand DNA analýzy vytvor 3 príspevky.

Značka: ${String(brandDna?.name || url)}
Pozicionování: ${String(brandDna?.positioning || '')}
Tón komunikace: ${String(brandDna?.tone || '')}
Cílová skupina: ${String(brandDna?.targetAudience || '')}
Unikátní hodnota: ${String(brandDna?.uniqueValue || '')}
Obsahové pilíře: ${Array.isArray(brandDna?.contentPillars) ? (brandDna.contentPillars as string[]).join(', ') : ''}

Vytvor presne 3 príspevky v JSON formáte:
[
  {
    "type": "video",
    "label": "VIDEO · REELS",
    "variant": "Varianta A",
    "platform": "Instagram",
    "duration": "15s · Reels",
    "style": "krátky popis štýlu",
    "title": "hook v úvodzovkách",
    "body": "text príspevku 2-4 vety",
    "tags": "#hashtag1 #hashtag2 #hashtag3"
  },
  {
    "type": "video",
    "label": "VIDEO · REELS",
    "variant": "Varianta B",
    "platform": "Instagram",
    "duration": "12s · Reels",
    "style": "krátky popis štýlu",
    "title": "iný hook",
    "body": "iný text 2-4 vety",
    "tags": "#hashtag1 #hashtag2"
  },
  {
    "type": "grafika",
    "label": "GRAFIKA",
    "variant": null,
    "platform": "Instagram",
    "duration": null,
    "style": "vizuálny štýl",
    "title": "headline pre grafiku",
    "body": "krátky text pod grafiku",
    "tags": "#hashtag1 #hashtag2"
  }
]

Obsah musí byť relevantný pre túto konkrétnu značku.
Použi reálne informácie z analýzy — ceny ak sú dostupné,
konkrétne služby, referencie ak existujú.
Vráť IBA JSON pole, nič iné.`;

        let generatedPosts: unknown[] = [];
        try {
          const anthropicKey = process.env.ANTHROPIC_API_KEY;
          if (anthropicKey) {
            const postsRes = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 2000,
                messages: [{ role: 'user', content: postsPrompt }],
              }),
            });
            const postsData = await postsRes.json() as { content?: Array<{ text?: string }> };
            const postsText = postsData.content?.[0]?.text || '[]';
            const clean = postsText.replace(/```json|```/g, '').trim();
            generatedPosts = JSON.parse(clean) as unknown[];
          }
        } catch (e) {
          console.error('[analyze] Posts generation failed:', e);
          generatedPosts = [];
        }

        return NextResponse.json({
          result: {
            brandScore: result.brandScore,
            brandDna: result.brandDna,
            summary: result.summary,
            pillarAnalysis: result.pillarAnalysis ?? undefined,
            suggested_strategists: suggested,
          },
          generatedPosts,
          scraped: scrapedPayload,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI nevrátilo platnou Brand DNA (JSON). Zkuste to znovu.";
        const status = message.includes("score") || message.includes("pillar") || message.includes("Pilíř") ? 400 : 500;
        return NextResponse.json({ error: message }, { status });
      }
    }

    return NextResponse.json({
      result: outputText,
      scraped: scrapedPayload,
    });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Nepodařilo se analyzovat web.";
    const message =
      raw.includes("abort") || (e instanceof Error && e.name === "AbortError")
        ? "Požadavek vypršel (timeout). Zkuste to znovu."
        : raw;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
