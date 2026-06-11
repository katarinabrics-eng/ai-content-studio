# Diagnostika · VIBE checklist

*Kontrola podle: LUCIFERA VIBE CODE – Strategic Brand Analyzer*

---

## ✅ CO JE HOTOVÉ

| Bod | Popis | Stav |
|-----|--------|------|
| 1 | **Stránka /diagnostika** – klient zadá URL nebo řekne, že web nemá | ✅ `diagnostika/page.tsx` → StartAnalyzer (diagnostika=true), režim web vs. manual |
| 2 | **Agent analyzuje web** – screenshot + text | ✅ Firecrawl: screenshot + markdown. Analýza běží přes **OpenAI** (gpt-4.1), ne Claude |
| 3 | **Zobrazí skóre + co zjistil** | ✅ brandScore (total 0–100), brandDna, summary, pillarAnalysis (SVĚTLO, ENERGIE, …) |
| 4 | **Doplňující otázky s klikacími volbami** | ✅ GUIDANCE_QUESTIONS – volby, žádné textové inputy |
| 5 | **Klient klikne (nebo nic) → pokračuje** | ✅ „Všechny volby dobrovolné“, tlačítko Zobrazit Brand DNA vždy aktivní |
| 6 | **Uložení do adminu** | ✅ save-scan → **client_projects** (Klienti diagnostika). scan_result = brandScore + brandDna + summary (+ pillarAnalysis) |

---

## ⚠️ LADĚNÍ / ROZDÍLY

### Počet otázek: „max 4–5“

- VIBE: *„max 4–5 doplňujících otázek“*
- **Ladění:** V diagnostice se zobrazuje **5 otázek** (positioning, audience, goals, style, differentiation). Celá sada 8 je v kódu (GUIDANCE_QUESTIONS_FULL) pro případné rozšíření.

### Vision (screenshot do modelu)

- VIBE: *„screenshot + text + claude vision“*
- Teď: screenshot se **stáhne** (Firecrawl), ale do AI se posílá jen **text** (markdown). Obrázek webu model nevidí.

**Ladění:** Pokud má analýza zohledňovat i vizuál stránky, je potřeba v `/api/analyze` při `format === "diagnostika"` a existujícím `scraped.screenshot` poslat do OpenAI i `image_url` (base64 screenshot) vedle textu.

### Výstup = „8dílný strategický plán uložený do projektu“

- **V adminu:** 8dílný plán (4.1–4.7 + transparentnost) vzniká, když na **projektu** (projects) zvolíte stratega **Lucifera** a kliknete „Spustit stratega“. Výstup jde do Storage (`ai/strategist/out.json`) a zobrazí se na detailu projektu.
- **V diagnostice:** Ukládá se **scan** (brandScore, brandDna, summary) do **client_projects**, ne do `projects`. Takže „projekt v adminu“ = záznam v **Klienti (diagnostika)**; samotný 8dílný dokument se generuje až při vytvoření/otevření projektu a spuštění stratega.

**Ladění (volitelné):** Po kroku 5 v diagnostice zavolat API, které z kontextu (scan + odpovědi) vygeneruje celý 8dílný plán (stejný prompt jako Lucifera) a uloží ho do `client_projects` (např. `scan_result.strategic_plan` nebo nové pole). Pak bude 8dílný plán k dispozici hned po diagnostice i bez projektu.

---

## Stack

- **Next.js** ✅  
- **Vercel deploy** ✅  
- **Analýza:** nyní **OpenAI** (gpt-4.1) + Firecrawl. Claude v popisu – aktuálně nepoužit; případná integrace Claude by byla v `/api/analyze` nebo novém endpointu.

---

*Poslední kontrola: březen 2026*
