DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_jobs_user_external_uniq'
  ) THEN
    ALTER TABLE public.saved_jobs
      ADD CONSTRAINT saved_jobs_user_external_uniq UNIQUE (user_id, external_job_id);
  END IF;
END $$;