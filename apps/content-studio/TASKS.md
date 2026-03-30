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
