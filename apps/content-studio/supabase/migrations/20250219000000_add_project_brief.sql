-- Add project_brief JSONB for full intake (quick + advanced) in one payload.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS project_brief jsonb DEFAULT '{}';

COMMENT ON COLUMN projects.project_brief IS 'Full brief: quick fields + advanced (cilova_skupina, nabidky_produkty, zakazana_slova, preferovany_styl, preferovana_cta, brand_assets, url_pdf_autofill).';
