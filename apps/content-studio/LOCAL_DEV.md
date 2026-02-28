# Lokální vývoj (localhost)

## Uvolnění portů 3000, 3001, 3002

Když Next.js píše „Port 3000 is in use, trying 3001 instead“, na těch portech běží staré instance. V terminálu (z `apps/content-studio`) spusťte:

```bash
./scripts/kill-dev-ports.sh
```

Nebo ručně: `lsof -ti :3000 | xargs kill -9` (pro 3001, 3002 stejně s jiným číslem). Pak znovu `npm run dev` – měl by naběhnout na **http://localhost:3000**.

## Spuštění

Vždy spouštějte z této složky (`apps/content-studio`):

```bash
cd apps/content-studio
npm run dev
```

Počkejte na hlášku **"✔ Ready"** a pak otevřete v prohlížeči:

- **http://localhost:3000/start**  
  nebo  
- **http://127.0.0.1:3000/start**

## Pokud se objeví 404 na /start (This page could not be found)

1. **Zastavte dev server** (v terminálu Ctrl+C).
2. **Smažte cache a znovu spusťte:**
   ```bash
   cd apps/content-studio
   rm -rf .next
   npm run dev
   ```
3. Po „✔ Ready“ otevřete **http://localhost:3000/start** v **externím prohlížeči** (Chrome, Safari, Firefox), ne v náhledu v Cursoru.

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
