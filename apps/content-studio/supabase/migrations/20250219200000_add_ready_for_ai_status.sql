-- Přidat status READY_FOR_AI do workflow.
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN (
  'PROCESSING_DATA', 'READY_FOR_AI', 'IN_PRODUCTION', 'DRAFT_READY', 'REVISION', 'FINAL_READY', 'CLOSED',
  'processing_data', 'ready_for_ai', 'in_production', 'draft_ready', 'revision', 'final_ready', 'closed'
));
