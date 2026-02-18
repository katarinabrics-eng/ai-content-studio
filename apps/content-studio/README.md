# AI Content Studio

MVP aplikace pro správu klientských vstupů (intake).

## Jak spustit

```bash
cd apps/content-studio
npm install
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

## Intake stránka

Formulář pro zadání údajů o značce a cílech obsahu:

- **URL:** [http://localhost:3000/intake](http://localhost:3000/intake)
- Pola: název značky, web, odvětví, cílová skupina, nabídky, tón hlasu, zakázaná slova, cíl obsahu (prodej / důvěra / edukace), platformy (Instagram, Facebook, LinkedIn), styl (humor / storytelling / edukace / prodejní), CTA preference.
- Sekce **Brand assets**: logo, barvy, fonty, fotky (placeholder pro budoucí upload).

## Kde se ukládají data

Odeslané intake se ukládají do souboru:

- **Cesta:** `apps/content-studio/data/intake-submissions.json`
- Formát: pole objektů (každý záznam má `id` a `createdAt`).

Soubor se vytvoří automaticky při prvním odeslání formuláře.

## Skripty

- `npm run dev` – vývojový server
- `npm run build` – produkční build
- `npm run start` – spuštění po buildu
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript kontrola
