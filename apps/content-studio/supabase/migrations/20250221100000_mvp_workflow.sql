-- MVP workflow: platba první, AI pouze manuálně.
-- Nové stavy: PAID, WAITING_BRIEF, WAITING_MANUAL_AI_COMMAND, AI_IN_PROGRESS, WAITING_APPROVAL, DONE, WAITING_PAYMENT, ERROR

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN (
  'WAITING_PAYMENT', 'PAID', 'WAITING_BRIEF', 'WAITING_MANUAL_AI_COMMAND', 'AI_IN_PROGRESS', 'WAITING_APPROVAL', 'DONE', 'ERROR',
  'AWAITING_INPUT', 'INPUT_RECEIVED', 'AWAITING_MANUAL_PROMPT', 'AI_PROCESSING', 'APPROVED_SCHEDULED',
  'PROCESSING_DATA', 'READY_FOR_AI', 'IN_PRODUCTION', 'DRAFT_READY', 'REVISION', 'FINAL_READY', 'CLOSED',
  'processing_data', 'ready_for_ai', 'in_production', 'draft_ready', 'revision', 'final_ready', 'closed'
));

ALTER TABLE projects ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text UNIQUE;

-- Log manuálních AI pokynů
CREATE TABLE IF NOT EXISTS project_ai_command_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  triggered_by text NOT NULL,
  instruction text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_ai_command_log_project_id ON project_ai_command_log (project_id);
