# Diagnostika · Vibe dokument

*Implementační body podle LUCIFERA VIBE – Strategic Brand Analyzer a návrat klienta.*

---

## Bod 1: Chyba při ukládání scanu

**Požadavek:** Když volání `/api/diagnostika/save-scan` selže, nezahazovat chybu v `catch`. Zobrazit uživateli hlášku (toast/banner).

**Kde:** `apps/content-studio/src/app/start/StartAnalyzer.tsx` (blok po `fetch("/api/diagnostika/save-scan", ...)`).

**Implementace:** Stav `saveError`; při neúspěchu (nebo výjimce) nastavit text a zobrazit banner nad fází „teaser“. Např. *„Výsledek se nepodařilo uložit do projektu. Zkuste to znovu nebo nás kontaktujte.“*

---

## Bod 2: Admin – detail klienta – celý výstup scanu

**Požadavek:** V Admin – detail klienta (`/admin/clients/[id]`) zobrazit celý výstup scanu z `project.scan_result`:

- **pillarAnalysis** – pilíře (light, energy, architecture, identity, trust): skóre, interpretation, observed, notObserved, reasoning (příp. strategicOpportunity).
- **missingElements** – zobrazené jako **3 rizika**.
- **summary** – jako **doporučený posun**.

**Kde:** `apps/content-studio/src/app/admin/clients/[id]/page.tsx`.

**Implementace:** Sekce „Výstup scanu“ rozšířena o pillarAnalysis (bloky po pilířích), missingElements (seznam rizik), summary (doporučený posun). Brand DNA zůstává jako surová data.

---

## Bod 3: Seznam diagnostiky – identifikace bez e-mailu

**Požadavek:** V seznamu diagnostiky (Redakce a/nebo Admin – diagnostika / klienti) u záznamů **bez e-mailu** zobrazit náhradní identifikaci (např. `web_url` nebo začátek `manual_input`), ne jen „—“.

**Kde:**  
- `apps/content-studio/src/app/redakce/page.tsx` (tabulka Diagnostika),  
- `apps/content-studio/src/app/admin/clients/page.tsx`.

**Implementace:** Sloupec „E-mail“ / „Jméno / e-mail“: fallback `email ?? web_url ?? (začátek manual_input) ?? "—"`.

---

## Bod 4: Návrat klienta + platba + 7denní limit (poslední návrh)

**Požadavek:**

1. **Návrat klienta**
   - **Magický odkaz e-mailem:** odkaz `/diagnostika/view?token=...` (token uložen v `client_projects`).
   - Po odeslání e-mailu v diagnostice: API `update-email` vrací `accessUrl`; na nástěnce se zobrazí odkaz „Váš odkaz pro návrat k výsledkům (platný 7 dní)“.
   - (Volitelně: stránka „Přístup k projektu“ `/diagnostika/pristup` – e-mail → seznam projektů → nástěnka; lze doplnit později.)

2. **Token a platnost**
   - V `client_projects`: sloupce `access_token` (unikátní), `access_expires_at` (created + 7 dní).
   - Při vytvoření záznamu (save-scan) se vygeneruje token a nastaví se `access_expires_at`.

3. **Stránka `/diagnostika/view?token=...`**
   - Načte projekt přes API `GET /api/diagnostika/access?token=...`.
   - Pokud token neplatný → „Odkaz je neplatný“.
   - Pokud **vypršel** (po 7 dnech) → stránka **„Přístup vypršel“** + text, že data zůstávají (nerealizované projekty) + CTA na platbu/rezervaci.

4. **Na nástěnce klienta**
   - Akce k platbě: štítek/tlačítko **„Chci – Prémiovou vizuální identitu“** (odkaz na platbu za Visual Board a konzultaci, např. `/rezervace?from=premiova`).
   - CTA je zobrazeno jak v průběhu diagnostiky (ScanResultScrollExperience), tak na view stránce při návratu přes token.

5. **7denní limit**
   - Bezplatný přístup jen **7 dní**; po té je přístup zrušen (odkaz neplatný / stránka „Přístup vypršel“).
   - **Data se zachovají** – záznam zůstává v „nerealizovaných projektech“.

**Kde (technicky):**

- Migrace: `access_token`, `access_expires_at` na `client_projects` (např. `supabase/migrations/20250601120000_client_projects_access_token.sql`).
- `createClientProject`: generování tokenu a `access_expires_at`.
- `getClientProjectByAccessToken`: načtení projektu při platném tokenu a nevypršené lhůtě.
- API: `GET /api/diagnostika/access?token=...`; `POST /api/diagnostika/update-email` vrací `accessUrl`.
- Stránka: `apps/content-studio/src/app/diagnostika/view/page.tsx` – view podle tokenu, stavy: loading, not_found, expired, ok (ScanResultScrollExperience).
- CTA v `ScanResultScrollExperience` („Chci – Prémiovou vizuální identitu“) + na stránce „Přístup vypršel“.

---

## Shrnutí

| Bod | Popis | Stav |
|-----|--------|------|
| 1 | Save-scan chyba → banner uživateli | ✅ |
| 2 | Admin detail: pillarAnalysis, 3 rizika, summary | ✅ |
| 3 | Seznam diagnostiky: web_url / manual_input když chybí e-mail | ✅ |
| 4 | Návrat klienta (token + view), CTA platby, 7denní limit, „Přístup vypršel“ | ✅ |

---

*Poslední úprava: únor 2026*
