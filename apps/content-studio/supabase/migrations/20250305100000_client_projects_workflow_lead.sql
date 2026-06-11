-- Přidat workflow status pro leady (jen diagnostika, nerealizované – budeme kontaktovat).

alter table client_projects
  drop constraint if exists client_projects_workflow_status_check;

alter table client_projects
  add constraint client_projects_workflow_status_check
  check (workflow_status in (
    'DIAG_AI_PROCESSING',
    'DIAG_AWAITING_CURATOR',
    'DIAG_READY_FOR_CLIENT',
    'DIAG_CLIENT_FEEDBACK',
    'DIAG_SENT_TO_CLIENT',
    'DIAG_DELIVERED',
    'DIAG_LEAD_NEREALIZOVANY'
  ));

comment on column client_projects.workflow_status is 'Stav workflow: kurátor → klient → …; DIAG_LEAD_NEREALIZOVANY = jen diagnostika, budeme kontaktovat.';
