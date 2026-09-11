ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS audit_report jsonb,
  ADD COLUMN IF NOT EXISTS audited_at timestamptz;