-- Create app_config table for feature flags and settings
CREATE TABLE IF NOT EXISTS public.app_config (
    id TEXT PRIMARY KEY,
    config JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default feature flags
INSERT INTO public.app_config (id, config) VALUES ('featureFlags', '{
  "free": {
    "resumeRewrite": false,
    "resumeLimit": 1,
    "atsAnalysis": true,
    "jobMatchesView": false,
    "jobApplyLinks": false,
    "interviewPrep": false,
    "pdfDownload": true,
    "docxDownload": false
  },
  "pro": {
    "resumeRewrite": true,
    "resumeLimit": 999,
    "atsAnalysis": true,
    "jobMatchesView": true,
    "jobApplyLinks": true,
    "interviewPrep": true,
    "pdfDownload": true,
    "docxDownload": true
  }
}') ON CONFLICT (id) DO NOTHING;

-- Insert default settings
INSERT INTO public.app_config (id, config) VALUES ('settings', '{
  "appName": "ProHired",
  "supportEmail": "prohired@gmail.com",
  "appTagline": "Your AI-Powered Career Assistant",
  "maintenanceMode": false,
  "maintenanceMessage": "We''re improving ProHired. Back soon!",
  "proPrice": 199,
  "showLaunchBanner": true
}') ON CONFLICT (id) DO NOTHING;

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target TEXT NOT NULL, 
    type TEXT NOT NULL, 
    status TEXT NOT NULL DEFAULT 'sent', 
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT DEFAULT 'admin'
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL, 
    discount_value NUMERIC NOT NULL,
    max_uses INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'active', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    type TEXT NOT NULL, 
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    target_email TEXT,
    admin_email TEXT DEFAULT 'prohired@gmail.com',
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id UUID,
    user_email TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create ai_usage table
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE DEFAULT CURRENT_DATE,
    feature TEXT NOT NULL,
    call_count INTEGER DEFAULT 1,
    avg_response_time NUMERIC,
    error_count INTEGER DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    UNIQUE(date, feature)
);

-- Enable RLS for all
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Allow all to read app_config
DROP POLICY IF EXISTS "Allow all to read app_config" ON public.app_config;
CREATE POLICY "Allow all to read app_config" ON public.app_config FOR SELECT USING (true);
