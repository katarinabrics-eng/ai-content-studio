-- Oprava existujících project_code obsahujících en-dash / em-dash.

UPDATE public.projects
SET project_code = upper(
  replace(replace(replace(project_code, '–', '-'), '—', '-'), '‑', '-')
)
WHERE project_code ~ '[–—‑]';
