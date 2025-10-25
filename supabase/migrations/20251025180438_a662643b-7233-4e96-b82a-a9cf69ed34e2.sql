-- Add company-specific fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_domain text,
ADD COLUMN IF NOT EXISTS company_logo_url text,
ADD COLUMN IF NOT EXISTS invite_code text UNIQUE,
ADD COLUMN IF NOT EXISTS invite_parameters jsonb DEFAULT '["display_name", "phone", "email", "job_title"]'::jsonb,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS board_member_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS employee_invite_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_due_date timestamp with time zone;

-- Create company_payments table
CREATE TABLE IF NOT EXISTS public.company_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('verification', 'invite_fee')),
  amount numeric NOT NULL,
  currency text DEFAULT 'INR' NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'overdue')),
  paid_at timestamp with time zone,
  due_date timestamp with time zone,
  employee_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on company_payments
ALTER TABLE public.company_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_payments
CREATE POLICY "Company admins can view their payments"
ON public.company_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = company_payments.company_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "System can create payment records"
ON public.company_payments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all payments"
ON public.company_payments
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create invited_employees table
CREATE TABLE IF NOT EXISTS public.invited_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  employee_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code text NOT NULL,
  status text DEFAULT 'invited' NOT NULL CHECK (status IN ('invited', 'joined', 'rejected')),
  invited_at timestamp with time zone DEFAULT now() NOT NULL,
  joined_at timestamp with time zone,
  data_submitted jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on invited_employees
ALTER TABLE public.invited_employees ENABLE ROW LEVEL SECURITY;

-- RLS policies for invited_employees
CREATE POLICY "Company admins can manage their invites"
ON public.invited_employees
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = invited_employees.company_profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Employees can view their own invite"
ON public.invited_employees
FOR SELECT
USING (employee_user_id = auth.uid());

-- Add trigger for updated_at on company_payments
CREATE TRIGGER update_company_payments_updated_at
BEFORE UPDATE ON public.company_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE invite_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;