# Nasazení na Vercel

## 1. Repozitář na GitHubu

Pokud ještě není projekt na GitHubu:

```bash
cd "/Users/katarina/Documents/AI Content Studio"
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin https://github.com/TVOJE_UCTO/TVOJ_REPO.git
git push -u origin main
```

(Vytvoř si repozitář na [github.com](https://github.com) – prázdný, bez README – a nahraď `TVOJE_UCTO` / `TVOJ_REPO`.)

---

## 2. Nový projekt na Vercelu

1. Jdi na [vercel.com](https://vercel.com) a přihlas se (ideálně **Continue with GitHub**).
2. **Add New** → **Project**.
3. **Import** svůj repozitář (AI Content Studio).
4. **Důležité:** Nastav **Root Directory**:
   - Klikni **Edit** vedle „Root Directory”.
   - Zadej: `apps/content-studio`
   - Potvrď.
5. **Framework Preset** by měl být Next.js (Vercel ho pozná).
6. **Build Command:** `npm run build` (výchozí).
7. **Install Command:** `npm install` (výchozí).
8. Neklikej zatím na Deploy – nejdřív nastav env proměnné.

---

## 3. Environment Variables

V projektu na Vercelu: **Settings** → **Environment Variables**. Přidej pro **Production** (a volitelně i Preview):

| Proměnná | Povinné | Poznámka |
|----------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | ano | Po deployi: `https://xxx.vercel.app`, pak přepni na vlastní doménu |
| `NEXT_PUBLIC_SUPABASE_URL` | ano | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ano | Supabase → API (service_role) |
| `STRIPE_SECRET_KEY` | ano, pokud používáš platby | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | ano, u Stripe | Vytvoř webhook až po deployi (viz níže) |
| `OPENAI_API_KEY` | ano | OpenAI – pro analýzu značky i ostatní AI funkce |
| `FIRECRAWL_API_KEY` | ano | [firecrawl.dev](https://firecrawl.dev) – načtení webu (screenshot + text) |
| `ADMIN_PASSWORD` | ano | Heslo do admin rozhraní |

Volitelné: `ADMIN_SETUP_TOKEN`, `SUPABASE_EXPORTS_BUCKET`, `SUPABASE_VISUALS_BUCKET`, `NEXT_PUBLIC_ENABLE_CODE_PIN_ACCESS`, `OPENAI_DEFAULT_MODE`, `OPENAI_BATCH_ENABLED`, `VISUAL_FAST_MODE`.

Vzor máš v `.env.example`.

---

## 4. Deploy

1. Klikni **Deploy**.
2. Po dokončení buildu bude stránka na adrese typu `https://tvuj-projekt.vercel.app`.
3. Do **NEXT_PUBLIC_APP_URL** (v Environment Variables) nastav tuto URL a udělej **Redeploy**, aby se proměnná načetla.

---

## 5. Po deployi

### Vlastní doména

**Settings** → **Domains** → přidej doménu a podle návodu nastav DNS (A/CNAME záznamy).

### Stripe webhook

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**.
2. URL: `https://tvuj-projekt.vercel.app/api/webhooks/stripe` (nebo tvá produkční doména).
3. Vyber události (např. `checkout.session.completed`, `payment_intent.succeeded` – podle toho, co používáš).
4. **Signing secret** (`whsec_...`) zadej do proměnné **STRIPE_WEBHOOK_SECRET** na Vercelu a znovu nasaď (Redeploy).

### Supabase Storage

V Supabase Dashboard zkontroluj, že existují buckety např. `exports` a `generated-visuals` (nebo jak máš v `SUPABASE_EXPORTS_BUCKET` / `SUPABASE_VISUALS_BUCKET`), a že jsou nastavené podle README (veřejné u přístupu k obrázkům).

---

## 6. Další deploye

Při každém **push** do připojené větve (např. `main`) Vercel automaticky spustí nový build a nasadí. Logy a chyby uvidíš v **Deployments** u daného běhu.
