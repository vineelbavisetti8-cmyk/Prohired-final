-- ==========================================
-- PROHIRED SUPABASE COMPLETE SQL FIX
-- Copy & Run this in Supabase SQL Editor
-- ==========================================

-- 1. DROP RESTRICTIVE FOREIGN KEY CONSTRAINTS IF PRESENT
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. ADD PHONE COLUMNS AND PLAN CHECK TO PROFILES TABLE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (lower(plan) IN ('free', 'pro'));

-- 3. PROFILES TABLE RLS POLICIES (FULL SELECT, INSERT, UPDATE, DELETE)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can view own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles public select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles public insert" ON public.profiles;
DROP POLICY IF EXISTS "Profiles public update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles public delete" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;

CREATE POLICY "Profiles public select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles public insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles public update" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Profiles public delete" ON public.profiles FOR DELETE USING (true);

-- 4. RESUMES TABLE RLS POLICIES
ALTER TABLE public.resumes DROP CONSTRAINT IF EXISTS resumes_user_id_fkey;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Resumes select own" ON public.resumes;
DROP POLICY IF EXISTS "Resumes: owner select" ON public.resumes;
DROP POLICY IF EXISTS "Resumes public select" ON public.resumes;
DROP POLICY IF EXISTS "Resumes public insert" ON public.resumes;
DROP POLICY IF EXISTS "Resumes public update" ON public.resumes;
DROP POLICY IF EXISTS "Resumes public delete" ON public.resumes;
DROP POLICY IF EXISTS "Resumes owner update" ON public.resumes;
DROP POLICY IF EXISTS "Resumes owner delete" ON public.resumes;

CREATE POLICY "Resumes public select" ON public.resumes FOR SELECT USING (true);
CREATE POLICY "Resumes public insert" ON public.resumes FOR INSERT WITH CHECK (true);
CREATE POLICY "Resumes public update" ON public.resumes FOR UPDATE USING (true);
CREATE POLICY "Resumes public delete" ON public.resumes FOR DELETE USING (true);

-- 5. AUTO PROFILE TRIGGER WITH PHONE & PLAN POPULATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  extracted_phone text;
BEGIN
  extracted_phone := COALESCE(
    new.phone,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'phone_number',
    CASE WHEN new.email LIKE 'phone_%@%' THEN substring(new.email from 'phone_([0-9]+)@') ELSE NULL END
  );

  INSERT INTO public.profiles (id, full_name, email, phone, phone_number, plan, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    extracted_phone,
    extracted_phone,
    'free',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(profiles.phone, EXCLUDED.phone),
    phone_number = COALESCE(profiles.phone_number, EXCLUDED.phone_number),
    updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. BACKFILL EXISTING PROFILES WITH PHONE NUMBERS
UPDATE public.profiles
SET 
  phone = COALESCE(phone, substring(email from 'phone_([0-9]+)@')),
  phone_number = COALESCE(phone_number, substring(email from 'phone_([0-9]+)@'))
WHERE phone IS NULL AND email LIKE 'phone_%@%';
