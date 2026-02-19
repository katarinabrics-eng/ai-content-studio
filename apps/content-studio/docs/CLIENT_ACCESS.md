# Klientský přístup (magic link, onboarding, status)

## Data model (Supabase)

Spusťte migraci v Supabase SQL Editoru:

- `supabase/migrations/20250218000000_client_tables.sql`

Tabulky: `clients`, `client_access_links`, `client_jobs`, `client_notifications`. Stávající `intake_submissions` a `post_drafts` zůstávají beze změny.

## Magic link flow

1. **Požádat o odkaz:**  
   `POST /api/client/access/request`  
   Body: `{ "email": "client@example.com", "name": "Optional" }`  
   → vytvoří klienta (pokud neexistuje), vygeneruje token, uloží hash do DB, zapíše notifikaci „onboarding_link_sent“, vrátí `magicLinkUrl` v dev režimu.

2. **Otevření odkazu z emailu:**  
   Odkaz vede na `/client/verify?token=...`  
   → stránka zavolá `GET /api/client/access/verify?token=...`  
   → API token ověří, označí jako použitý, vytvoří nový token (rotace), vrátí `client`, `token`, `redirectTo`  
   → stránka přesměruje na `/client/onboarding?token=NOVÝ_TOKEN`.

3. **Ověření tokenu (bez rotace):**  
   `GET /api/client/access/validate?token=...`  
   → vrací `client` pro načtení klientských stránek.

4. **Obnovení tokenu:**  
   `POST /api/client/access/refresh`  
   Body: `{ "token": "..." }` nebo query `?token=...`  
   → vrací nový token (krátká platnost).

## Klientské stránky (vše s `?token=...`)

- `/client/verify` – vstup z emailu, rotace tokenu, redirect na onboarding.
- `/client/onboarding` – uvítání, odkaz na intake formulář.
- `/client/status` – přehled zakázek (client_jobs) a timeline stavů.
- `/client/approval` – schválení / úpravy / stáhnutí (popis, odkaz na stav).
- `/client/assets` – placeholder pro nahrání fotek/loga (odkaz na intake).

Navigace v hlavičce zachovává `token` v URL.

## Status engine

Stavy: `paid`, `onboarding_pending`, `onboarding_submitted`, `ai_processing`, `curator_review`, `ready_for_approval`, `approved`, `delivered`, `scheduled`, `client_changes_requested`.

- Definice a labely: `src/lib/client-status-engine.ts`.
- Timeline na `/client/status` zobrazuje stavy zakázky.
- Kurátor: `/curator` – přehled jobů podle stavu (bez auth, pouze server).

## Notifikace (email hooks)

V `src/lib/supabase-client-notifications.ts`:

- `notifyOnboardingLinkSent` – odeslání magic linku.
- `notifyStatusChanged` – změna stavu jobu.
- `notifyReadyForApproval` – připraveno ke schválení.
- `notifyFinalDelivered` – finální dodání.

Notifikace se zapisují do `client_notifications`. Pro skutečné emaily doplňte integraci (Resend, SendGrid apod.).

## Bezpečnost

- Tokeny se ukládají jako SHA-256 hash, nikdy v čistém tvaru v DB.
- Service role klíč pouze na serveru (API routes, lib).
- Platnost linku 24 h; po použití (verify) se token označí jako used a vydá se nový.

## Testovací kroky

1. **Migrace**  
   V Supabase SQL Editoru spusťte `supabase/migrations/20250218000000_client_tables.sql`.

2. **Požadavek na magic link**  
   ```bash
   curl -X POST http://localhost:3000/api/client/access/request \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test Client"}'
   ```  
   V odpovědi (v dev) zkopírujte `magicLinkUrl`.

3. **Otevření magic linku**  
   V prohlížeči otevřete `magicLinkUrl` (nebo `/client/verify?token=...`).  
   Ověřte přesměrování na `/client/onboarding?token=...`.

4. **Klientské stránky**  
   S tokenem v URL otevřete:  
   `/client/onboarding`, `/client/status`, `/client/approval`, `/client/assets`.  
   Ověřte, že navigace zachovává token.

5. **Stav zakázek**  
   V Supabase vložte záznam do `client_jobs` (client_id z tabulky `clients`, week_key např. `2025-W08`, status např. `onboarding_pending`).  
   Na `/client/status?token=...` zkontrolujte zobrazení a timeline.

6. **Kurátor**  
   Otevřete `/curator`. Ověřte přehled jobů podle stavů (pokud máte záznamy v `client_jobs`).

7. **Refresh tokenu**  
   ```bash
   curl -X POST "http://localhost:3000/api/client/access/refresh" \
     -H "Content-Type: application/json" \
     -d '{"token":"VÁŠ_TOKEN"}'
   ```  
   Ověřte, že odpověď obsahuje nový `token`.
