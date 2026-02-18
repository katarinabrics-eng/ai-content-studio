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
```

Bez těchto proměnných tlačítko „Načíst automaticky“ skončí chybou ze serveru. **Supabase** (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) je potřeba pro ukládání intake a draftů; na Vercelu jsou tyto proměnné obvykle nastavené.

**Co enrich dělá:**

- Stáhne obsah webu (Firecrawl) a volitelně text z PDF (brand manual).
- Z webu heuristicky vytáhne **brand assety**: kandidáty na logo (og:image, twitter:image, img s „logo“, favicon), barvy (hex/rgb z HTML a až 5 CSS souborů, top 5), fonty (font-family z CSS, top 5).
- LLM (OpenAI) extrahuje údaje a vrátí **prefill** (všechna pole formuláře s výchozími hodnotami, bez null) a **suggestions** (alternativní návrhy pro cílovou skupinu, nabídky, tón, CTA, zakázaná slova).

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
- Pola: název značky, web, odvětví, cílová skupina, nabídky, tón hlasu, zakázaná slova, cíl obsahu (prodej / důvěra / edukace), platformy (Instagram, Facebook, LinkedIn), styl (humor / storytelling / edukace / prodejní), CTA preference.
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

**Storage buckety:**
- `brand-assets` (public) – loga v `logos/<uuid>.png`, public URL se ukládá do `payload.brandAssets.logo`
- `generated-visuals` (public) – pro budoucí generovanou grafiku

**Test flow na produkci (Vercel):**
1. Nastavte na Vercelu env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`.
2. Ověřte, že tabulky `intake_submissions`, `post_drafts` existují a Storage bucket `brand-assets` je public.
3. Odešlete intake (s logem i bez), ověřte záznam v Supabase Dashboard.
4. Vygenerujte návrhy postů na /drafts, ověřte drafty v `post_drafts`.

### Návrhy postů (drafts)

- **Stránka:** [http://localhost:3000/drafts](http://localhost:3000/drafts)
- Po odeslání intake se zobrazí odkaz „Přejít na návrhy postů“. Na stránce /drafts klikněte na **„Vygenerovat 3 návrhy“** – podle posledního (nebo zvoleného) intake se vygenerují 3 návrhy postů přes OpenAI a zobrazí se v kartách (hook, caption, CTA, hashtags, visualBrief).
- **Uložiště:** Supabase tabulka `post_drafts`.
- **API:** `POST /api/posts/generate` (body: `{ intakeId?: string, count?: number }`), `GET /api/posts?intakeId=...` (vrací drafty pro daný nebo poslední intake).

### Generování vizuálů

U každého draftu lze vygenerovat vizuál (obrázek) přes OpenAI Images API (model `gpt-image-1`). Obrázek se uloží do Supabase Storage bucketu `generated-visuals` a zobrazí se v kartě draftu.

**Potřebné:**
- **OPENAI_API_KEY** – klíč k OpenAI API (stejný jako pro enrich a generování draftů).
- Storage bucket **generated-visuals** (public) – musí existovat v Supabase. Cesta: `drafts/<draftId>/<timestamp>.png`.

**API:** `POST /api/visuals/generate` (body: `{ draftId: string, regenerate?: boolean }`). Vrací `{ ok: true, visualImageUrl }` nebo `{ ok: false, error: string }`.

**Test flow:**
1. Vygenerujte drafty na `/drafts` („Vygenerovat 3 návrhy“).
2. U každé karty klikněte „Vygenerovat vizuál“.
3. Po dokončení se zobrazí náhled obrázku a odkaz „Stáhnout PNG“.
4. Při chybě se zobrazí červený text s popisem (`visualError`).

## Skripty

- `npm run dev` – vývojový server
- `npm run build` – produkční build
- `npm run start` – spuštění po buildu
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript kontrola
