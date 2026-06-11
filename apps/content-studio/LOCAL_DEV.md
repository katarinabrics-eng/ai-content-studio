# Lokální vývoj (localhost)

## Uvolnění portů 3000, 3001, 3002

Když Next.js píše „Port 3000 is in use, trying 3001 instead“, na těch portech běží staré instance. V terminálu (z `apps/content-studio`) spusťte:

```bash
./scripts/kill-dev-ports.sh
```

Nebo ručně: `lsof -ti :3000 | xargs kill -9` (pro 3001, 3002 stejně s jiným číslem). Pak znovu `npm run dev` – měl by naběhnout na **http://localhost:3000**.

## Spuštění (vždy na portu 3000)

**Doporučený způsob (uvolní porty a spustí na 3000):**

- V Cursoru: **Cmd+Shift+P** → **Run Task** → **Start dev server (content-studio)**  
  nebo z této složky v terminálu: **`npm run dev:clean`**

Server pak vždy běží na **http://localhost:3000** – otevřete **http://localhost:3000/start**.

**Klasické spuštění** (pokud jsou porty volné):

```bash
cd apps/content-studio
npm run dev
```

Počkejte na hlášku **"✔ Ready"** a pak otevřete v prohlížeči:

- **http://localhost:3000/start**  
  nebo  
- **http://127.0.0.1:3000/start**

## Pokud se objeví 404 na /start (This page could not be found)

Často to způsobuje chyba **EMFILE (too many open files)** – watcher Next.js pak nenačte všechny routy.

**Řešení A – dev s vyšším limitem (doporučeno):**  
Spusťte úlohu **Run Task → Start dev server (content-studio)** – ta volá `dev:safe` (nastaví `ulimit` a spustí server).  
Nebo v terminálu: `npm run dev:safe` z `apps/content-studio`.

**Řešení B – production režim (vždy funguje):**  
V terminálu z `apps/content-studio`:
```bash
npm run start:prod
```
(Provede build a spustí server na http://localhost:3000. Otevřete **http://localhost:3000/start**.)

**Řešení C – ruční úklid:**  
1. Zastavte dev server (Ctrl+C).  
2. `rm -rf .next` a pak `ulimit -n 10240` a v tom samém terminálu `npm run dev`.  
3. Po „✔ Ready“ otevřete **http://localhost:3000/start** v externím prohlížeči.

## Pokud se objeví "Connection Refused" (ERR_CONNECTION_REFUSED)

1. **Server možná restartoval** (např. po změně `next.config.js`). Počkejte znovu na "✔ Ready" a **obnovte stránku** (F5 nebo Cmd+R).
2. **Používejte externí prohlížeč** (Chrome, Safari, Firefox) místo vestavěného náhledu v editoru – ten někdy na localhost nesprávně reaguje.
3. **Spouštějte z příkazové řádky** v kořeni projektu:
   ```bash
   cd "AI Content Studio/apps/content-studio"
   npm run dev
   ```

## Chyba "EMFILE: too many open files"

Na macOS může watcher Next.js narazit na limit otevřených souborů. V **novém terminálu** před spuštěním `npm run dev` zadejte:

```bash
ulimit -n 10240
```

Pak v tom samém terminálu:

```bash
cd apps/content-studio
npm run dev
```

## Env proměnné

Pro analýzu webu a další funkce potřebujete v `.env.local`:

- `OPENAI_API_KEY`
- `FIRECRAWL_API_KEY`

Viz `.env.example` pro další volitelné proměnné.
