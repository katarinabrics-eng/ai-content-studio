-- Přidat nové workflow stavy pro admin přehled.
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN (
  'AWAITING_INPUT', 'INPUT_RECEIVED', 'AWAITING_MANUAL_PROMPT', 'AI_PROCESSING',
  'AWAITING_APPROVAL', 'APPROVED_SCHEDULED', 'DONE', 'ERROR',
  'PROCESSING_DATA', 'READY_FOR_AI', 'IN_PRODUCTION', 'DRAFT_READY', 'REVISION', 'FINAL_READY', 'CLOSED',
  'processing_data', 'ready_for_ai', 'in_production', 'draft_ready', 'revision', 'final_ready', 'closed'
));
