# CLAUDE.md — Lucifera AI Content Studio

Tento soubor definuje pravidla, kontext a pracovní styl pro Claude Code v tomto projektu.
Čti ho před každou změnou kódu.

---

## Projekt

**Název:** Lucifera AI Content Studio
**URL:** ai-content-studio-omega.vercel.app
**GitHub:** katarinabrics-eng/ai-content-studio
**Stack:** Next.js 14 App Router · Supabase · OpenAI GPT-4o · Anthropic Claude · Firecrawl · Canva API
**Deploy:** Vercel (automatický deploy z main větve)

---

## Kdo jsem

Katarína Brič — zakladatelka Lucifera AI Content Studio, Praha Kampa.
25 let zkušeností s portrétní, byznys a reportážní fotografií.
Programuji sama s pomocí Claude Code. Nejsem seniorní developer.
Pracuju rychle, iterativně, chci vidět výsledky.

---

## Jak pracujeme

- Vždy čti existující kód před tím než něco změníš
- Nikdy nepřepisuj funkční části které nebyly zmíněny
- Piš přesné diff nebo kompletní soubor — nikdy jen „přidej někam"
- Pokud něco nevíš, zeptej se — nehádej
- Komentáře v kódu piš česky nebo anglicky, krátce
- Nepiš zbytečné console.log do produkčního kódu
- Vždy ověř že importy existují před použitím

---

## Design systém

### Barvy
```
Primární akcent:    #b7e94c (limetková)
Akcent hover:       #a0d940
Světlá limetka:     #d3ee7f
Tmavá limetka:      #d0ec78 (v klientském portálu)
Pozadí stránky:     #f5f3ee (krémová)
Pozadí karet:       #ffffff
Border:             #e8e4dc
Text primární:      #111111
Text sekundární:    #555555
Text muted:         #aaaaaa / #b0aea8
Zelená text:        #5a7a00
Chyba:              #e05a5a
```

### Typografie
- Nadpisy (h1): Playfair Display, serif
- Tělo textu: DM Sans nebo system-ui
- Portál / UI: system-ui, sans-serif
- Monospace: font-mono pro kódy

### Komponenty
- Border radius karet: 12–14px
- Border tloušťka: 0.5px solid pro jemné, 1px pro standardní, 1.5px pro featured
- Tlačítko primární: bg #b7e94c, text #111, font-weight 500–600
- Tlačítko sekundární: bg #f5f3ee, border #e8e4dc, text #666
- Disabled stav: opacity 0.3–0.4

### Co NEDĚLAT v UI
- Žádné tmavé pozadí (#000, #111) jako hlavní bg stránky — jen pro CTA sekce
- Žádné fialové gradienty
- Žádný Inter nebo Arial jako hlavní font
- Žádné emoji v navigaci nebo badges
- Sidebar vždy světlý (#fff), nikdy tmavý

---

## Architektura

### Stránky (App Router)
```
/                           Homepage
/brand-scan                 Brand Scan nástroj
/portrety                   Portréty
/premiova-vizualni-identita Prémiová vizuální identita (12 sekcí)
/ready-to-go                RTG landing page
/ready-to-go/register       RTG registrace
/rezervace                  Booking
/kontakt                    Kontakt

/client/[projectCode]               Klientský dashboard
/client/[projectCode]/rtg           RTG schvalování obsahu
/client/[projectCode]/rtg/plans     RTG pricing plány
/client/[projectCode]/rtg/onboarding RTG onboarding
/client/[projectCode]/media-library Vizuální knihovna
/client/[projectCode]/brief         Brief

/admin                      Admin rozcestník
/admin/dashboard            Přehled klientů
/admin/rtg                  RTG správa
/admin/workspace/[id]       Detail projektu

/curator                    Kurátorování obsahu
/drafts                     Návrhy příspěvků
```

### Klíčové komponenty
```
src/app/client/[projectCode]/components/
  Sidebar.tsx               Navigační sidebar (220px, světlý)
  ScoreCard.tsx             Brand score 0–100
  WebPreviewCard.tsx        Náhled webu
  PipelineCard.tsx          Status projektu
  PillarsCard.tsx           5 pilířů brand skóre
  SpiderChart.tsx           Pavoučí graf
  BrandIdentityCard.tsx     Barvy + typografie
  BrandVoiceCard.tsx        Key messages
  StrategistsCard.tsx       Doporučení strategistů
  SymbolsCard.tsx           Archetyp + symboly
  DocumentsList.tsx         Google Drive soubory
```

### API routes
```
/api/client/project         Načtení dat projektu (token auth)
/api/client/rtg/batches     RTG batch + posts
/api/client/rtg/approve     Schválení varianty
/api/client/rtg/update-text Uložení text editu (PATCH)
/api/client/rtg/download    Stažení schváleného obsahu
```

---

## Databáze (Supabase)

### Klíčové tabulky
```sql
projects
  id, code, client_name, client_token
  scan_result (JSONB) -- brand DNA, pilíře, skóre
  drive_config (JSONB) -- folder struktura
  selected_photos (JSONB)
  rtg_plan -- 'start' | 'plus' | 'pro' | null
  onboarding_completed (bool)

content_batches
  id, project_id, week_label, week_start
  status, items_total, items_approved

content_posts
  id, batch_id, project_id
  pair_index, variant ('A'|'B')
  type ('VIDEO'|'GRAFIKA'|'CAROUSEL')
  aspect_ratio ('9:16'|'16:9'|'1:1'|'4:5')
  hook, body
  text_hook_edited, text_body_edited  -- klientské úpravy (přidáno 2026-03-30)
  thumbnail_url, output_url
  status ('pending'|'client_review'|'approved'|'rejected')
  client_approved_at, client_note
  slides_count
  updated_at
```

### Autentizace klientů
- Token v URL query param `?token=...`
- `ClientTokenGuard` komponenta obaluje chráněné stránky
- Token se ověřuje přes `client_token` v tabulce `projects`

---

## RTG plány

| Plán  | Cena       | Videa | Grafiky | Carousely |
|-------|-----------|-------|---------|-----------|
| Start | 2 900 Kč  | 2     | 8       | —         |
| Plus  | 4 900 Kč  | 4     | 16      | 4         |
| Pro   | 7 900 Kč  | 8     | 30      | 8         |

Plus = Nejoblíbenější (featured karta)

---

## Před vytvořením nového souboru

**Vždy** před `Write` nebo vytvořením nové stránky:
1. Zkontroluj sekci `📂 EXISTUJÍCÍ SOUBORY A STRÁNKY` v `TASKS.md`
2. Spusť: `find src/app -name "*.tsx" | grep -i [název]`
3. Pokud soubor existuje — uprav ho, nevytvářej nový

---

## Workflow pro nové funkce

1. Přečti existující soubor který měníš
2. Identifikuj přesné řádky kde děláš změnu
3. Napiš kompletní soubor (ne diff) pokud je soubor < 600 řádků
4. Pro větší soubory napiš přesný str_replace
5. Zkontroluj importy
6. Neměň co nebylo zmíněno

---

## Pravidla pro TASKS.md

Při každé aktualizaci TASKS.md dodržuj tato pravidla:

- **HOTOVO sekce:** Maž záznamy starší než 3 dny (porovnej s datem v záznamu)
- **POZNÁMKY ze session:** Zachovej pouze poslední 3 session, starší smaž
- **BACKLOG:** Nikdy nemaž — jen přidávej nové položky
- **KRITICKÉ a DŮLEŽITÉ:** Nikdy nemaž dokud nejsou označeny jako hotové (`[x]`)
- Při každé aktualizaci TASKS.md zkontroluj datum a vymaž co je starší

---

## Časté chyby — vyhni se jim

```typescript
// ❌ ŠPATNĚ — alert jako placeholder
onClick={() => alert("Brzy dostupné")}

// ✅ SPRÁVNĚ — reálná funkce nebo TODO s komentářem
onClick={() => handleDownload(batch.id, token)}
// TODO: napojit na Stripe upgrade flow

// ❌ ŠPATNĚ — inline style tmavého pozadí v klientském portálu
style={{ background: '#111' }}

// ✅ SPRÁVNĚ — světlé pozadí
style={{ background: '#f5f3ee' }}

// ❌ ŠPATNĚ — lokální state bez uložení
const [hook, setHook] = useState(post.hook)
onChange={(e) => setHook(e.target.value)} // jen lokální

// ✅ SPRÁVNĚ — autosave do DB
const { save } = useAutoSave(post.id, token)
onChange={(e) => { setHook(e.target.value); save('hook', e.target.value) }}

// ❌ ŠPATNĚ — duplikátní nav položky
{ label: 'Příspěvky', href: '/client/approval' }
{ label: 'Ke schválení', href: '/client/approval' } // stejná URL!

// ✅ SPRÁVNĚ — jedna položka, jasný label
{ label: 'Schvalování obsahu', href: '/client/approval' }
```

---

## Prostředí

```bash
# Lokální development
npm run dev        # http://localhost:3000

# Build check
npm run build

# Supabase lokálně (pokud máš)
npx supabase start
```

### Environment variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
FIRECRAWL_API_KEY=
NEXT_PUBLIC_SITE_URL=https://ai-content-studio-omega.vercel.app
```

---

## KOMPLETNÍ PRODUKT ARCHITEKTURA

### VSTUP: `/brand-scan` = jeden vstupní bod
- **Cesta A:** zadá web → analýza → dashboard
- **Cesta B:** bez webu → knihovna → 3× zdarma
- **Free omezení:** localStorage (3 příspěvky + 20min session)

### VIZUÁLNÍ KNIHOVNA = jádro systému
- **Tab 1:** Inspirace (Vizuální banka Drive K02–K09)
- **Tab 2:** Moje fotky
- **Tab 3:** Oblíbené ❤️ (trénuje AI styl)
- **Flow:** fotka → ➕ Použít → loading → preview → 200 kreditů

### DASHBOARD MODULY DLE TARIFU
- **Vždy:** Vizuální knihovna
- **RTG:** Obsah (schvalování, kalendář, posty)
- **PVI:** Značka (DNA, pilíře, brief)
- **Foto:** Fotografie (galerie, výběr, stažení)
- **Locked = preview mód, ne šedé mrtvé**

### KREDIT
Header vpravo: „Zbývá X kreditů"
Při nízkém stavu (<200): červeně „Zbývá posledních X kreditů"
Odečet: 200 kreditů za příspěvek z knihovny

### AI KOMUNIKACE
Nikdy: „AI generovalo"
Vždy: „Tvořím pro tebe" / „Na základě tvého stylu"

---

## PRODUKT ARCHITEKTURA

### Jeden unifikovaný onboarding
Všechny vstupní body směřují na JEDEN onboarding.
Nejlepší diagnostika je na: `/brand-scan` nebo `/diagnostika`
Po onboardingu se klient třídí dle tarifu.
Data z diagnostiky se ukládají k projektu v `project_brief`.

### Vizuální knihovna — finální struktura
Tabs v pořadí: **Inspirace** (Vizuální banka) → Moje fotky → Oblíbené ❤️
Header: „Vyber vizuál pro svůj obsah"
Sub: „Ulož si co se ti líbí nebo rovnou tvoř příspěvek"

**Hover na fotce:**
- bílé overlay (ne limetkové)
- gradient zdola: `rgba(0,0,0,0.6)` → transparent
- velké tlačítko „Vytvořit příspěvek" uprostřed
- ukázka textu pod ním (hook příklad)
- srdíčko vpravo nahoře jako kulatá ikona

**Labely na fotkách:** Reels vibe / Carousel BG / Quote post / Story moment / Feed lifestyle
Label „Použita v kampani" pokud foto bylo použito

**Vyhledávání:** fulltext search nad galerií
**Color picker:** výběr vlastní barvy + kroužky dle složek K02–K09
**Kredit:** vpravo nahoře „Zbývá X kreditů"

**Flows:**
- Klik ➕ Použít → loading „Tvořím příspěvek..." → preview hook+caption+hashtagy → „Použiješ 200 kreditů"
- Klik ❤️ Uložit → přidá do Oblíbené → „Uloženo do tvého stylu"
- Dojde kredit → „Dochází ti kredit" → Dobít / Upgrade

### AI komunikace (nikdy „AI generovalo")
Vždy: „Tvořím pro tebe" / „Na základě tvého stylu"

### Kredit systém
Zobrazit vpravo nahoře v headeru: „Zbývá X kreditů"
Při nízkém stavu (<200): „Zbývá posledních X kreditů" červeně
Odečet: 200 kreditů za příspěvek z knihovny

### Stav implementace media-library (2026-04-01)
✅ Hotovo:
- Vizuální banka s fotkama z Drive
- Hover overlay — gradient, bílá tlačítka, srdíčko jako ikona
- Labely na fotkách (Reels vibe / Carousel BG…)
- Tab Oblíbené (prázdný stav)
- Color picker (HexColorPicker + kroužky K02–K09)
- Masonry columns, přepínač 2–8 sloupců
- Podmíněný Sidebar dle produktu

❌ TODO:
- Pořadí tabů — Inspirace jako první tab
- Hover — ukázka textu (hook) pod tlačítkem
- Fulltext search nad VB galerií
- Kredit systém (zobrazení, odečet, varování)
- Label „Použita v kampani"
- ➕ Použít → reálný flow (teď alert)
- ❤️ Uložit → reálné ukládání do DB

---

## Vibe

Lucifera není generický SaaS.
Je to prémiové studio s AI přesahem.
Kód má být čistý, funkční a přímý — stejně jako komunikace studia.
Žádná omáčka. Žádné zbytečné abstrakce. Výsledky.
