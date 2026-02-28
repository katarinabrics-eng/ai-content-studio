# Lokální vývoj (localhost)

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
