-- Workflow stavy pro diagnostiku (kurátor: kdo je na tahu, label, Právě teď).

alter table client_projects
  add column if not exists workflow_status text not null default 'DIAG_AWAITING_CURATOR'
  check (workflow_status in (
    'DIAG_AI_PROCESSING',
    'DIAG_AWAITING_CURATOR',
    'DIAG_READY_FOR_CLIENT',
    'DIAG_CLIENT_FEEDBACK',
    'DIAG_SENT_TO_CLIENT',
    'DIAG_DELIVERED'
  ));

comment on column client_projects.workflow_status is 'Stav workflow diagnostiky: AI zpracovává → kurátor → pro klienta → připomínky → zasláno → odevzdáno.';
