-- Zapne Row Level Security (RLS) na tabulkách vystavených přes PostgREST.
-- Aplikace používá SUPABASE_SERVICE_ROLE_KEY na serveru, takže RLS obchází a vše dál funguje.
-- Přímý přístup s anon klíčem (API bez auth) pak neuvidí žádná data, dokud nepřidáš politiky.

-- Tabulky z codebase / Security Advisor
alter table if exists public.projects enable row level security;
alter table if exists public.project_brief enable row level security;
alter table if exists public.project_files enable row level security;
alter table if exists public.project_proposals enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.content_posts enable row level security;
alter table if exists public.content_notification_log enable row level security;
alter table if exists public.client_projects enable row level security;
alter table if exists public.analysis_leads enable row level security;
alter table if exists public.clients enable row level security;
alter table if exists public.client_access_links enable row level security;
alter table if exists public.client_jobs enable row level security;
alter table if exists public.client_notifications enable row level security;
alter table if exists public.project_access_tokens enable row level security;
alter table if exists public.project_admin_meta enable row level security;
alter table if exists public.app_config enable row level security;

-- Volitelně další tabulky, pokud je máš v DB (názvy mohou být jiné)
alter table if exists public.post_drafts enable row level security;
alter table if exists public.project_drafts enable row level security;
alter table if exists public.intake_submissions enable row level security;
alter table if exists public.project_sessions enable row level security;
alter table if exists public.project_ai_command_log enable row level security;
