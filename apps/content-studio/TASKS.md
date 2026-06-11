# TASKS.md — Lucifera AI Content Studio
# Živý pracovní log. Aktualizovat po každé session.
# Poslední update: 2026-03-31

---

## 🔴 KRITICKÉ — udělat hned

- [x] **SQL migrace** — spuštěno 2026-03-30 ✅
  ```sql
  ALTER TABLE content_posts  -- (pozor: tabulka se jmenuje content_posts, ne rtg_posts)
    ADD COLUMN IF NOT EXISTS text_hook_edited TEXT,
    ADD COLUMN IF NOT EXISTS text_body_edited TEXT;
    -- updated_at již existuje

  ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS rtg_plan TEXT
      CHECK (rtg_plan IN ('start', 'plus', 'pro'));
  ```

- [x] **API route** `/api/client/rtg/download/route.ts` ✅ 2026-03-30
  - Vrací `driveUrl` z batch nebo project záznamu
- [x] **API route** `/api/client/rtg/update-text/route.ts` ✅ 2026-03-30
  - PATCH — ukládá `text_hook_edited` / `text_body_edited`

---

## 🟡 DŮLEŽITÉ — tento týden

### 🏗️ HLAVNÍ PRIORITA: Unifikovaný klientský dashboard — architektura

#### Jeden login, tři produkty

Detekce produktů klienta ze sloupců v `client_projects`:
- `pvi_active: boolean`
- `rtg_plan: start|plus|pro|null`
- `portrait_active: boolean`

#### Sidebar sekce dle produktu

**Vždy viditelné:**
- Dashboard (přehled)
- Vizuální knihovna

**Pokud `pvi_active`:**
- Brand DNA (score, pilíře, archetyp)
- Strategie
- Brief

**Pokud `rtg_plan`:**
- Ke schválení (badge s počtem)
- Kalendář
- Moje posty

**Pokud `portrait_active`:**
- Moje fotky (galerie z Drive)
- Výběr fotek

**CTA bannery:**
- RTG klient bez PVI → „Zjisti sílu své značky" → BrandScan
- Foto klient bez RTG → „Chceš obsah každý týden?" → RTG
- RTG klient → „Nafotit se v ateliéru" → Portréty

#### Agenti (postupně)
1. Brand Scan agent — **HOTOVÝ ZÁKLAD**
2. RTG content agent — **STAVÍME**
3. Higgsfield vizuální agent — **PŘÍŠTĚ**

#### Supabase migrace potřebná
```sql
ALTER TABLE client_projects
  ADD COLUMN IF NOT EXISTS pvi_active boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS portrait_active boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}';
```

#### Pořadí práce:
1. [ ] SQL migrace (`pvi_active`, `portrait_active`, `services`)
2. [ ] `Sidebar.tsx` — podmíněný dle `pvi_active` / `rtg_plan` / `portrait_active`
3. [ ] Otestovat na test klientovi (`short_code = 'test'`)
4. [ ] `/client/[code]/gallery` — galerie fotek z Drive focení
5. [ ] Upgrade/upsell bannery (RTG → BrandScan, foto → RTG)

---

## 🟢 HOTOVO — session 2026-03-31

- [x] `rtg/onboarding/page.tsx` — přepracován na 4 kroky: URL, styl agenta, platformy, témata výběrem ✅ 2026-03-31
- [x] `api/client/rtg/onboarding/complete` — ukládá `agent_style` a `platforms` ✅ 2026-03-31
- [x] `supabase/migrations/20260330120000_add_rtg_columns.sql` — přidány RTG sloupce do `client_projects`: `agent_style`, `platforms`, `topics`, `interval_days`, `onboarding_completed`, `rtg_activated_at`, `rtg_plan`, `google_drive_folder_id` ✅ 2026-03-31
  - ⚠️ Spustit ručně v Supabase SQL Editoru

## 🟢 HOTOVO — session 2026-03-30

- [x] Prototyp RTG klientského dashboardu (vizuální artifact)
- [x] Pricing karty Start / Plus / Pro — design hotový
- [x] `api/client/rtg/update-text` — autosave textu do DB
- [x] `api/client/rtg/download` — vrátí Drive URL batche (opraveno: `google_drive_folder_id`)
- [x] `Sidebar.tsx` — RTG odkaz, bez duplikátů
- [x] `rtg/page.tsx` — autosave + download napojeny
- [x] `rtg/plans/page.tsx` — mailto CTA místo alert, `ahoj@studiolucifera.cz`
- [x] `client/[projectCode]/page.tsx` — RTG banner + notifikační badge

---

## 📂 EXISTUJÍCÍ SOUBORY A STRÁNKY

> ⚠️ Před vytvořením nového souboru vždy zkontroluj tento seznam.
> Také spusť: `find src/app -name "*.tsx" | grep -i [název]`

### Veřejné stránky (`src/app/`)
```
/                           src/app/page.tsx
/brand-scan                 src/app/brand-scan/page.tsx
/diagnostika                src/app/diagnostika/page.tsx
/diagnostika/view           src/app/diagnostika/view/page.tsx
/gdpr                       src/app/gdpr/page.tsx
/intake                     src/app/intake/page.tsx
/kontakt                    src/app/kontakt/page.tsx
/kreativa                   src/app/kreativa/page.tsx
/lucifera-diagnostic        src/app/lucifera-diagnostic/page.tsx
/lucifera-diagnostic/book   src/app/lucifera-diagnostic/book/page.tsx
/lucifera-diagnostic/start  src/app/lucifera-diagnostic/start/page.tsx
/lucifera-diagnostic/success src/app/lucifera-diagnostic/success/page.tsx
/obchodni-podminky          src/app/obchodni-podminky/page.tsx
/portrety                   src/app/portrety/page.tsx
/premiova-vizualni-identita src/app/premiova-vizualni-identita/page.tsx
/project                    src/app/project/page.tsx
/ready-to-go                src/app/ready-to-go/page.tsx  ← redirect na /ready-to-go.html
/ready-to-go/register       src/app/ready-to-go/register/page.tsx
/rezervace                  src/app/rezervace/page.tsx
/start                      src/app/start/page.tsx
/start/success              src/app/start/success/page.tsx
/studio                     src/app/studio/page.tsx
/d/[shortCode]              src/app/d/[shortCode]/page.tsx
```

### Statické HTML (`public/`)
```
/ready-to-go.html           public/ready-to-go.html  ← hlavní RTG landing page
```

### Klientský portál (`src/app/client/`)
```
/client/approval            src/app/client/approval/page.tsx
/client/assets              src/app/client/assets/page.tsx
/client/onboarding          src/app/client/onboarding/page.tsx
/client/pristup             src/app/client/pristup/page.tsx
/client/status              src/app/client/status/page.tsx
/client/verify              src/app/client/verify/page.tsx
/client/[projectCode]               src/app/client/[projectCode]/page.tsx
/client/[projectCode]/brief         src/app/client/[projectCode]/brief/page.tsx
/client/[projectCode]/media-library src/app/client/[projectCode]/media-library/page.tsx
/client/[projectCode]/rtg           src/app/client/[projectCode]/rtg/page.tsx
/client/[projectCode]/rtg/onboarding src/app/client/[projectCode]/rtg/onboarding/page.tsx
/client/[projectCode]/rtg/plans     src/app/client/[projectCode]/rtg/plans/page.tsx
```

### Admin (`src/app/admin/`)
```
/admin                      src/app/admin/page.tsx
/admin/dashboard            src/app/admin/dashboard/page.tsx
/admin/drive                src/app/admin/drive/page.tsx
/admin/login                src/app/admin/login/page.tsx
/admin/rtg                  src/app/admin/rtg/page.tsx
/admin/workspace/[id]       src/app/admin/workspace/[projectId]/page.tsx
```

### Ostatní
```
/curator                    src/app/curator/page.tsx
/drafts                     src/app/drafts/page.tsx
```

---

## 🔵 BACKLOG — příště

### RTG systém
- [ ] Stripe napojení pro upgrade plánů (Start → Plus → Pro) — zatím mailto, Stripe až v další fázi
- [ ] Email notifikace klientovi když je batch připraven
- [ ] Download ZIP — reálná implementace (stáhnout soubory z Drive, zazipit)
- [ ] Admin `/admin/rtg` — přehled všech batchů, statusů
- [ ] Analytika pro Plus plán — co fungovalo, engagement

### Web Analyzer
- [ ] Napojit Firecrawl screenshot do analyzéru (server-side)
- [ ] Uložení Brand DNA do Supabase po analýze
- [ ] Průvodce pro slabé weby (skóre < 60%) — otázky výběrem

### Start page
- [ ] Sekce "Takhle může vypadat tvůj příspěvek" pod gridem kolekcí
  - 3–4 ukázky s grafikou + hook textem + caption
  - Obsah připravit postupně (reálné příspěvky z produkce)
  - Klik → /client/magnet/rtg/onboarding

### Klientský portál
- [ ] Media Library — nahrávání fotek pro AI
- [ ] Google Drive integrace — sync fotek ze složky
- [ ] Klientský agent — učení na schválených postech
- [ ] Visual Board — disabled sekce, připravit obsah

### Infrastruktura
- [ ] Zabezpečení API routes — rate limiting
- [ ] Error logging — Sentry nebo vlastní
- [ ] Testy pro klíčové API routes

### Magnet route `/client/magnet/rtg/onboarding`
- [ ] Veřejná stránka bez autentizace
- [ ] Přijme `?web=` parametr z ready-to-go stránky
- [ ] Předvyplní URL v kroku 1 onboardingu
- [ ] Po dokončení onboardingu vytvoří dočasný projekt v DB (`magnet_used = false`)
- [ ] Vygeneruje 3 posty
- [ ] Zobrazí je s hover vodoznakem
- [ ] CTA: "Stáhnout bez vodoznaku" → `/ready-to-go#plans`

### Magnet — technická implementace

#### Magnet UX flow (schválený design)

**Zobrazení:**
- Výchozí stav: fotka BEZ vodoznaku (vidí plnou kvalitu)
- Hover na fotku: vodoznak ZMIZÍ (CSS `:hover` transition)
- Stažení: soubor dostane vodoznak přes Canvas API
- Opakované použití stejné URL: zobrazí vodoznak hned

**CSS implementace:**
```css
.post-preview { position: relative }
.post-preview .watermark {
  opacity: 1; transition: opacity 0.3s;
  position: absolute; inset: 0;
  /* "LUCIFERA PREVIEW" text přes celý obrázek */
}
.post-preview:hover .watermark { opacity: 0 }
```

**Stažení s vodoznakem:**
- Canvas API: nakresli obrázek + přidej text overlay
- Vrátí blob ke stažení
- Originální soubor bez vodoznaku zůstane na serveru

**Opakované použití:**
- Sledovat přes `localStorage` nebo IP + fingerprint
- Při druhém použití stejné domény → rovnou vodoznak
- Reset po zakoupení tarifu

---

## 📝 POZNÁMKY ze session
### Otevřené otázky
- Kdy napojit Stripe pro upgrade plánů?
- Má mít `/admin/rtg` přehled pending schválení?
- ⚠️ Spustit migraci `20260330120000_add_rtg_columns.sql` v Supabase Dashboard

---

## 🔧 ČIŠTĚNÍ — technický dluh

- [ ] `Sidebar.tsx` — původní verze má `href="#"` na disabled položkách → matoucí
- [ ] `client/approval` — stránka je duplikát RTG portálu? Upřesnit
- [ ] `client/assets` — stejná URL pro Fotografie i Mé dokumenty
- [ ] Zkontrolovat všechny `TODO` komentáře v kódu: `grep -r "TODO" src/`
- [ ] Zkontrolovat všechny `alert(` v kódu: `grep -r "alert(" src/`
- [ ] Zkontrolovat všechny `console.log` v kódu: `grep -r "console.log" src/`

---

*Tento soubor udržuj aktuální. Po každé session přesuň hotové věci do HOTOVO
a přidej nové poznámky s datem.*
