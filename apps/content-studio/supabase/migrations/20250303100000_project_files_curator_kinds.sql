-- Kurátor může nahrát materiály: strategie, checklist, vizuály, prezentace, PDF.

ALTER TABLE project_files DROP CONSTRAINT IF EXISTS project_files_kind_check;
ALTER TABLE project_files ADD CONSTRAINT project_files_kind_check CHECK (kind IN (
  'logo', 'photo', 'manual',
  'strategy', 'checklist', 'visual', 'presentation', 'pdf'
));

COMMENT ON TABLE project_files IS 'Soubory projektu: intake (logo, photo, manual) + materiály od kurátora (strategy, checklist, visual, presentation, pdf).';
