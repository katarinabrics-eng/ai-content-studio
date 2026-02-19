# AI Content Studio

MVP aplikace pro správu klientských vstupů (intake).

## Jak spustit

```bash
cd apps/content-studio
npm install
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

### Auto-vyplnění z webu a PDF (enrich)

Pro funkci „Načíst automaticky“ na stránce intake je potřeba nastavit API klíče:

- **OPENAI_API_KEY** – klíč k OpenAI API (pro extrakci údajů z textu).
- **FIRECRAWL_API_KEY** – klíč k [Firecrawl](https://firecrawl.dev) (pro načtení obsahu webu).

Vytvořte soubor `.env.local` v `apps/content-studio`:

```bash
OPENAI_API_KEY=sk-…
FIRECRAWL_API_KEY=fc-…
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ…

# Processing Modes (volitelné)
OPENAI_DEFAULT_MODE=batch
OPENAI_ENABLE_PRIORITY=true
OPENAI_PRIORITY_MAX_PER_DAY=20
OPENAI_BATCH_ENABLED=true
```

Bez těchto proměnných tlačítko „Načíst automaticky“ skončí chybou ze serveru. **Supabase** (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) je potřeba pro ukládání intake a draftů; na Vercelu jsou tyto proměnné obvykle nastavené.

- **VISUAL_FAST_MODE** (volitelné, výchozí `true`) – při `true` generování vizuálů používá 1 variantu, bez kritiky a s minimálním overlay (headline + CTA). **Doporučeno na Vercel Hobby** (limit 60 s). Pro plnou kvalitu nastavte `VISUAL_FAST_MODE=false`.

**Co enrich dělá:**

- Stáhne obsah webu (Firecrawl) a volitelně text z PDF (brand manual).
- Z webu heuristicky vytáhne **brand assety**: kandidáty na logo (og:image, twitter:image, img s „logo“, favicon), barvy (hex/rgb z HTML a až 5 CSS souborů, top 5), fonty (font-family z CSS, top 5).
- LLM (OpenAI) extrahuje údaje a vrátí **prefill** (všechna pole formuláře s výchozími hodnotami, bez null) a **suggestions** (alternativní návrhy pro cílovou skupinu, nabídky, tón, CTA, zakázaná slova).

**Enrich persistence – strategy pole:** Prefill obsahuje i `strategyMode`, `strategyId`, `awarenessLevel` (defaulty: strategyMode `"auto"`, awarenessLevel `"problem_aware"`). Tato pole se při merge udržují ve formuláři a odesílají v POST /api/intake.

**Odpověď endpointu** (úspěch):

- `prefill` – objekt se všemi intake poli (předvyplnění formuláře).
- `suggestions` – `{ targetAudience, offers, toneOfVoice, ctaPreference, forbiddenWords }` – pole stringů (AI návrhy).
- `detectedAssets` – `{ logoCandidates, colors, fonts }` – detekované assety z webu.
- `missingFields`, `confidence`.

**AI návrhy v UI:** Po „Načíst automaticky“ se formulář předvyplní z `prefill`. Pod vybranými textovými poli se zobrazí chips „AI návrhy“ – kliknutím vložíte návrh do pole. Barvy a fonty z webu se předvyplní do Brand assets; první kandidát na logo do pole Logo URL (lze přepsat nebo nahrát PNG).

**Query parametry:** `/intake?client=Název%20značky&website=https://example.com` – při načtení stránky se předvyplní Název značky a Web a do pole pro auto-vyplnění se dá URL webu.

**Jak otestovat endpoint `/api/intake/enrich`:**

```bash
# pouze website (povinné)
curl -X POST http://localhost:3000/api/intake/enrich \
  -F "website=https://example.com"

# website + PDF
curl -X POST http://localhost:3000/api/intake/enrich \
  -F "website=https://example.com" \
  -F "brandManualPdf=@/cesta/k/brand-manual.pdf"
```

Očekávaná odpověď: `ok: true`, `prefill`, `suggestions`, `detectedAssets`, `missingFields`, `confidence`. PDF je volitelné, max 15 MB, pouze `application/pdf`.

**Test kroky (manuální):**

1. Spusťte `npm run dev`, otevřete [http://localhost:3000/intake](http://localhost:3000/intake).
2. Otevřete `/intake?client=Test&website=https://example.com` – ověřte předvyplnění Název značky a Web.
3. Zadejte URL webu (nebo nechte z query), volitelně nahrajte PDF, klikněte „Načíst automaticky“. Po dokončení ověřte předvyplnění všech polí z `prefill`, chips „AI návrhy“ pod cílovou skupinou, nabídkami, tónem, CTA a zakázanými slovy.
4. Klikněte na jeden z AI návrhů – text se vloží do příslušného pole.
5. Ověřte Brand assets: Barvy a Fonty z detekce (pokud web nějaké má), Logo URL z prvního kandidáta (pokud byl nalezen).
6. Vyplňte chybějící povinná pole (pokud jsou v missingFields), upravte dle potřeby a odešlete formulář.

## Intake stránka

Formulář pro zadání údajů o značce a cílech obsahu:

- **URL:** [http://localhost:3000/intake](http://localhost:3000/intake)
- Pola: název značky, web, odvětví, cílová skupina, nabídky, tón hlasu, zakázaná slova, cíl obsahu (prodej / důvěra / edukace), platformy (Instagram, Facebook, LinkedIn), styl (humor / storytelling / edukace / prodejní), CTA preference, **Úroveň povědomí publika** (awarenessLevel).
- Sekce **Brand assets**: upload loga (pouze PNG, max 5 MB), barvy, fonty, fotky (placeholder).

**Logo upload:** podporován je pouze formát PNG (`image/png`), maximální velikost 5 MB. Na klientu i na serveru se validuje typ a velikost.

## Kde se ukládají data (Supabase)

Všechna perzistentní data jsou v **Supabase** (bez lokálních souborů `data/*.json` ani `public/uploads/*`).

**Env proměnné Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` – URL projektu
- `SUPABASE_SERVICE_ROLE_KEY` – service role klíč (pro server-side operace)

**Tabulky:**
- `public.intake_submissions` – `id` (uuid), `created_at` (timestamptz), `payload` (jsonb)
- `public.post_drafts` – `id` (uuid), `intake_id` (uuid), `created_at` (timestamptz), `payload` (jsonb)
- `public.processing_jobs` – `id` (uuid), `job_type`, `status` (queued|processing|completed|failed), `payload` (jsonb), `result` (jsonb), `processing_mode`, `processing_reason`, `started_at`, `finished_at`, `created_at`, `updated_at` – pro Batch režim

**Tabulka processing_jobs:** Vytvořte v Supabase SQL Editor:
```sql
create table if not exists public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  status text not null default 'queued',
  payload jsonb default '{}',
  result jsonb,
  processing_mode text not null,
  processing_reason text not null,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Storage buckety:**
- `brand-assets` (public) – loga v `logos/<uuid>.png`, public URL se ukládá do `payload.brandAssets.logo`
- `generated-visuals` (public) – generovaná grafika vizuálů
- `exports` (public) – Canva-ready ZIP balíčky v `packages/<intakeId>/<timestamp>-canva-ready.zip`

**Bucket `exports`:** Pokud neexistuje, vytvořte ho v Supabase Dashboard → Storage → New bucket, název `exports`, public. Nebo `SUPABASE_EXPORTS_BUCKET` přepíše výchozí název.

**Test flow na produkci (Vercel):**
1. Nastavte na Vercelu env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`.
2. Ověřte, že tabulky `intake_submissions`, `post_drafts` existují a Storage buckety `brand-assets`, `generated-visuals`, `exports` jsou public.
3. Odešlete intake (s logem i bez), ověřte záznam v Supabase Dashboard.
4. Vygenerujte návrhy postů na /drafts, ověřte drafty v `post_drafts`.

### Návrhy postů (drafts)

- **Stránka:** [http://localhost:3000/drafts](http://localhost:3000/drafts)
- Po odeslání intake se zobrazí odkaz „Přejít na návrhy postů“. Na stránce /drafts klikněte na **„Vygenerovat 3 návrhy“** – podle posledního (nebo zvoleného) intake se vygenerují 3 návrhy postů přes OpenAI a zobrazí se v kartách (hook, caption, CTA, hashtags, visualBrief).
- **Uložiště:** Supabase tabulka `post_drafts`.
- **API:** `POST /api/posts/generate` (body: `{ intakeId?, count?, brandLock?, strategyMode?, strategyId? }`), `GET /api/posts?intakeId=...` (vrací drafty pro daný nebo poslední intake).

### Generování vizuálů (Art-directed creative pipeline)

Dvoukrokový pipeline pro generování reklamních vizuálů ve konzistentním brand stylu.

**Pipeline:**
1. **Step A – Creative brief:** LLM vytvoří `creativeBrief` (concept, shotType, scene, lighting, composition, palette, headline, subheadline, cta, negativePrompt) z draftu + intake + volitelného visualStyleProfile.
2. **Step B – Base image:** OpenAI gpt-image-1 vygeneruje základní obrázek BEZ textu.
3. **Text overlay:** Sharp přesně položí headline/subheadline/CTA s bezpečnými okraji.
4. **Quality scoring:** Vision model ohodnotí kandidáty (brand fit, readability, composition, conversion clarity); vybere se nejlepší s score ≥ 8, jinak se regeneruje.

**Platformové formáty:**
- instagram-feed: 1080×1350
- instagram-story: 1080×1920
- facebook-feed: 1080×1350
- linkedin-post: 1200×627

**Visual strategy override:**

- Na stránce /drafts lze u každé karty zapnout toggle „Použít override jen pro tento vizuál“ a vybrat jinou strategii ze seznamu (public labels).
- Body POST /api/visuals/generate: volitelně `strategyIdOverride?: string`, `strategyModeOverride?: "auto" | "manual"`.
- Při override se použije zvolená strategie pro art direction prompt; jinak strategie z draft payload.
- Metadata v draft payload: `visualStrategyId`, `visualStrategySource` (`"draft"` | `"override"`).

**API:**
- `POST /api/visuals/generate` – body: `{ draftId, format?, lockStyle?, brandLock?, styleProfile?, strategyIdOverride?, strategyModeOverride? }` → `{ ok, visualImageUrl, visualBaseImageUrl, visualCreativeScore, visualFormat, brandApplied, brandWarnings, visualStrategyId?, visualStrategySource? }`
- `POST /api/visuals/style-profile` – body: `{ referenceImageUrls: string[] }` → `{ ok, visualStyleProfile }`
- `POST /api/visuals/score` – body: `{ imageUrl? | imageB64? }` → `{ ok, score: { brandFit, readability, composition, conversionClarity, overall, passed } }`

**Potřebné:**
- **OPENAI_API_KEY** – pro gpt-image-1, gpt-4o-mini, gpt-4o (vision).
- Storage bucket **generated-visuals** (public). `SUPABASE_VISUALS_BUCKET` přepíše výchozí název.
- **Sharp** – pro text overlay (závislost v package.json).

**Intake – volitelný Brand Visual DNA:**
- `visualStyleProfile`: `{ styleName, palette[], typographyTone, compositionRules[], doNotUse[], referenceImageUrls[] }`
- Lze vytvořit přes `/api/visuals/style-profile` z referenčních obrázků.

**Test flow:**
1. Vygenerujte drafty na `/drafts`.
2. Zvolte formát (IG Feed, IG Story, FB, LinkedIn).
3. Klikněte „Vygenerovat vizuál“ nebo „Regenerovat“ / „Regenerovat ve stejném stylu“.
4. Ověřte badge Creative quality (score), přepínač Base/Finální náhled, „Uzamknout styl“.
5. Ověřte odkaz „Stáhnout PNG“.

### Strategy Engine

Strategy Engine řídí, podle jakých marketingových technik AI vytváří posty a vizuály. V UI se zobrazují pouze veřejné názvy režimů, nikoli jména marketérů ani frameworků.

**Režimy (publicLabel):**
- Konverzní tah
- Důvěra a autorita
- Příběh značky
- Edukační magnet
- Komunitní rezonance
- Prémiový positioning

**Auto vs. ruční výběr:**
- **Auto (default):** AI vybere strategii podle `contentGoal` a `awarenessLevel`:
  - unaware/problem_aware → více edukace a problémového rámování (education_magnet, community_resonance)
  - solution_aware/product_aware → více diferenciace a důkazů (premium_positioning, trust_authority)
  - most_aware → přímější CTA a konverzní režim (conversion_push)
- **Ruční:** Uživatel vybere strategii v intake formuláři. Uloží se do `strategyMode`, `strategyId` v intake payload.
- **Ruční:** Uživatel vybere strategii v intake formuláři. Uloží se do `strategyMode`, `strategyId` v intake payload.

**Jak funguje Brand Lock se strategií:**
- Brand Lock zůstává oddělený – vynucuje barvy, logo, tón, zakázaná slova.
- Strategie ovlivňuje copy frameworks a CTA styl v promptu; visual directives ovlivňují art direction.
- Výstupní text a UI nikdy neobsahují jména frameworků (PAS, AIDA, StoryBrand atd.).

**API:**
- `POST /api/posts/generate`: `strategyMode?: "auto"|"manual"`, `strategyId?: string` (pokud manual). Použije intake payload při chybějících hodnotách.
- `POST /api/visuals/generate`: `strategyMode?`, `strategyId?` – nebo převezme z draft payload.
- Draft payload: `strategyId`, `strategyLabel`, `strategyRationale`.

### Brand Lock

Brand Lock (ON/OFF) zajišťuje, že výstupy – text i vizuál – striktně respektují data klienta z intake.

**Když je ON (default):**
- **Text (drafty):** Zakázaná slova jsou zakázána (validace, při fail regenerace max 2×). Tón odpovídá toneOfVoice. Platforma odpovídá brand spec.
- **Vizuály:** Paleta brand barev v promptu, CTA barva z palety, logo v safe area (pokud existuje). Brand fit v image promptu.

**Validace brand compliance:**
- Text: `containsForbiddenWords` → fail, regenerace. `brandApplied: { tone, forbiddenWords, platform }`, `brandWarnings`.
- Vizuál: `brandApplied: { colors, logo, tone, layout }`, `brandWarnings`. Při nesplnění constraints (barvy/logo) max 2× regenerace.

**API rozšíření:**
- `POST /api/posts/generate`: `brandLock?: boolean` (default true)
- `POST /api/visuals/generate`: `brandLock?: boolean` (default true), `styleProfile?: "katarina_signature"|"minimal_clean"|"bold_growth"`

**Chybové odpovědi:** `{ ok: false, error, detail?, hint? }`

**Známé limity:**
- Čistá image AI (gpt-image-1) nemá přesnou font fidelity – text overlay je vykreslen Sharpem (Arial).
- Logo overlay se stahuje z URL – pro CORS/SSL problémy může selhat tichým skipem.

### Canva-ready export

Export balíček pro snadnou úpravu postů v Canvě (bez přímé Canva API integrace).

**Použití:**
1. Na stránce `/drafts` vyberte 1–4 návrhy s vygenerovaným vizuálem (checkbox „Vybrat pro export“).
2. Klikněte „Export Canva-ready“.
3. Systém vytvoří ZIP balíček a vrátí odkaz ke stažení.
4. Klikněte „Stáhnout balíček“.

**Obsah ZIP balíčku** (`export-<date>-<client>/`):
- `assets/` – obrázky postů (post-01.png, post-02.png, …)
- `texts/` – texty postů (post-01.txt, …): Hook, Caption, CTA, Hashtags, Visual brief
- `meta/brand.json` – brandName, website, toneOfVoice, brandColors, brandFonts, logoUrl, forbiddenWords
- `meta/posts.json` – platform, strategyLabel, visualStyleLabel, creativeScore pro každý post
- `meta/captions.csv` – post_id, platform, hook, caption, cta, hashtags
- `README.txt` – popis balíčku, upozornění (např. chybějící obrázky)

**Uložení:** ZIP se ukládá do Supabase Storage bucket `exports` pod cestou `packages/<intakeId>/<timestamp>-canva-ready.zip`. URL je public.

**API:** `POST /api/exports/canva-ready` – body: `{ intakeId?, draftIds?, format?: "png"|"jpg", packageName? }` → `{ ok, downloadUrl, warnings[] }`. Pokud `draftIds` chybí, vezmou se poslední 4 schválené drafty (s vizuálem).

**Test kroky:**
1. Vygenerujte drafty a vizuály na `/drafts`.
2. Zaškrtněte 1–4 návrhů s vizuálem.
3. Klikněte „Export Canva-ready“, ověřte loading stav.
4. Po úspěchu klikněte „Stáhnout balíček“, ověřte ZIP obsah (assets, texts, meta, README).
5. Test bez výběru: klikněte „Export Canva-ready“ bez zaškrtnutí – exportuje poslední 4 schválené.

### Processing Modes (chytrý routing OpenAI)

OpenAI požadavky se směrují do tří režimů podle typu úlohy a naléhavosti:

| Režim | Použití | Popis |
|-------|---------|-------|
| **batch** | Plánované úlohy (weekly_posts) | Levný asynchronní režim – job se zařadí do fronty, klient dostane `jobId` a polluje `/api/jobs/:id`. Používá se pro generování 3 návrhů postů bez rush. |
| **realtime** | Interaktivní kliknutí v UI | Synchronní odpověď – enrich, single_post_regen, single_visual_regen. Používá se pro okamžitou zpětnou vazbu. |
| **priority** | Urgentní případy (rush) | Aktivuje se při `rush=true` nebo `dueAt < 24h`. Vyžaduje `OPENAI_ENABLE_PRIORITY=true`. |

**Pravidla:** `weekly_posts` → batch (pokud `OPENAI_BATCH_ENABLED=true`), `enrich` / `single_post_regen` / `single_visual_regen` → realtime. Rush nebo dueAt &lt; 24h → priority.

**ENV proměnné:**
- `OPENAI_DEFAULT_MODE` – výchozí režim (batch)
- `OPENAI_ENABLE_PRIORITY` – povolit priority režim (true)
- `OPENAI_PRIORITY_MAX_PER_DAY` – max priority requestů za den (20)
- `OPENAI_BATCH_ENABLED` – povolit batch režim (true)

**API:** `POST /api/posts/generate` přijímá `rush?: boolean`. Při batch vrací `{ ok: true, queued: true, jobId, eta }`. `GET /api/jobs/:id` vrací stav jobu; při prvním pollu queued job se spustí zpracování.

**Fallback:** Když Batch API nebo vytvoření jobu selže, automatický fallback na realtime. Odpověď může obsahovat `warnings`.

## Skripty

- `npm run dev` – vývojový server
- `npm run build` – produkční build
- `npm run start` – spuštění po buildu
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript kontrola
