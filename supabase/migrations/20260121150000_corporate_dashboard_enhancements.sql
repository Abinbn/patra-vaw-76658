-- Corporate Dashboard Enhancements Migration

-- Add vanity_url to profiles for companies
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vanity_url TEXT UNIQUE;

-- Enhance invited_employees table
ALTER TABLE public.invited_employees 
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS collected_data JSONB DEFAULT '{}'::jsonb;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_vanity_url ON public.profiles(vanity_url);
CREATE INDEX IF NOT EXISTS idx_invited_employees_company_profile_id ON public.invited_employees(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_invited_employees_employee_user_id ON public.invited_employees(employee_user_id);

-- Policy for anyone to view company info by invite code (needed for invite page)
CREATE POLICY "Anyone can view company info by invite code"
ON public.profiles
FOR SELECT
USING (invite_code IS NOT NULL);

-- Policy for users to insert into invited_employees when joining
CREATE POLICY "Users can join a company via invite"
ON public.invited_employees
FOR INSERT
WITH CHECK (auth.uid() = employee_user_id);

-- Policy for users to view their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.invited_employees
FOR SELECT
USING (auth.uid() = employee_user_id);
