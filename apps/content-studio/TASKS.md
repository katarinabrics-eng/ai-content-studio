# TASKS.md — Lucifera AI Content Studio
# Živý pracovní log. Aktualizovat po každé session.
# Poslední update: 2026-03-30

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

- [ ] **API route chybí** — vytvořit `/api/client/rtg/download/route.ts`
  - Má vrátit buď ZIP blob nebo `{ driveUrl: string }`
  - Zatím může vrátit Drive URL na složku batche
  - Soubor: `src/app/api/client/rtg/download/route.ts`

- [ ] **API route chybí** — zkopírovat `update-text/route.ts` z dodaného ZIP do:
  `src/app/api/client/rtg/update-text/route.ts`

---

## 🟡 DŮLEŽITÉ — tento týden

- [ ] **Sidebar.tsx** — nasadit opravenou verzi z ZIP balíčku
  - Přidat RTG odkaz do navigace
  - Odstranit duplikáty (Příspěvky / Ke schválení → jedno)
  - Předat nové props: `rtgPlan`, `pendingApprovals`

- [ ] **rtg/page.tsx** — nasadit novou verzi (dodaný soubor)
  - Autosave textu funguje, download funkce připravena
  - Potřebuje fungující `/api/client/rtg/download`

- [ ] **Nová stránka** `/client/[projectCode]/rtg/plans/page.tsx` — WIP
  - Pricing karty Start / Plus / Pro ✅ vytvořeno 2026-03-30
  - CTA tlačítka zatím alert → TODO: napojit na Stripe

- [ ] **Hlavní dashboard** `/client/[projectCode]/page.tsx`
  - Přidat odkaz/banner na RTG portál pokud má klient `rtg_plan`
  - Přidat notifikaci pokud čeká obsah ke schválení

---

## 🟢 HOTOVO — tato session (2026-03-30)

- [x] Prototyp RTG klientského dashboardu (vizuální artifact)
- [x] Pricing karty Start / Plus / Pro — design hotový
- [x] `rtg/page.tsx` — autosave + download funkce napsány
- [x] `Sidebar.tsx` — opravená verze připravena
- [x] `/rtg/plans/page.tsx` — nová stránka připravena
- [x] `CLAUDE.md` — vibe code dokument vytvořen
- [x] `TASKS.md` — tento soubor
- [x] `ready-to-go/page.tsx` — existuje jako `/ready-to-go.html` (redirect z Next.js route)

---

## 🔵 BACKLOG — příště

### RTG systém
- [ ] Stripe napojení pro upgrade plánů (Start → Plus → Pro)
- [ ] Email notifikace klientovi když je batch připraven
- [ ] Download ZIP — reálná implementace (stáhnout soubory z Drive, zazipit)
- [ ] Admin `/admin/rtg` — přehled všech batchů, statusů
- [ ] Analytika pro Plus plán — co fungovalo, engagement

### Web Analyzer
- [ ] Napojit Firecrawl screenshot do analyzéru (server-side)
- [ ] Uložení Brand DNA do Supabase po analýze
- [ ] Průvodce pro slabé weby (skóre < 60%) — otázky výběrem

### Klientský portál
- [ ] Media Library — nahrávání fotek pro AI
- [ ] Google Drive integrace — sync fotek ze složky
- [ ] Klientský agent — učení na schválených postech
- [ ] Visual Board — disabled sekce, připravit obsah

### Infrastruktura
- [ ] Zabezpečení API routes — rate limiting
- [ ] Error logging — Sentry nebo vlastní
- [ ] Testy pro klíčové API routes

---

## 📝 POZNÁMKY ze session
### 2026-03-30
- Pracovaly jsme na RTG dashboard prototypu a nasazení
- Sidebar měl duplikáty a chyběl RTG odkaz — opraveno
- `rtg/page.tsx` měl `alert` místo download — opraveno
- Inline edit textu se neukládal do DB — přidán `useAutoSave` hook
- Pricing stránka `/rtg/plans` je nová, neexistovala
- CLAUDE.md vytvořen pro Claude Code context
- Web Analyzer: Firecrawl API řeší CORS — musí běžet server-side
- Design: světlý (#f5f3ee krémová + #b7e94c limetka), NIKDY tmavý sidebar

### 2026-03-30 (session 2)
- RTG ceny zkontrolovány — jsou správně ve všech souborech
- `rtg/plans/page.tsx` vytvořen — pricing karty Start/Plus/Pro, CTA mailto
- `ready-to-go/page.tsx` nahrazen plnohodnotnou landing page (byl jen redirect na HTML)
- Post-commit hook pro čištění TASKS.md přidán do `.git/hooks/post-commit`
- CLAUDE.md rozšířen o pravidla pro TASKS.md

### Otevřené otázky
- Jak bude fungovat download? ZIP nebo Drive URL?
- Kdy napojit Stripe pro upgrade plánů?
- Má mít `/admin/rtg` přehled pending schválení?

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
