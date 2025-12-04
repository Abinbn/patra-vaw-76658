-- Create profile_access table
CREATE TABLE IF NOT EXISTS public.profile_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.digital_cards(id) ON DELETE SET NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),
  sharing_method VARCHAR(50) DEFAULT 'qr_scan',
  device_info JSONB,
  location_info JSONB,
  CONSTRAINT unique_access UNIQUE(owner_user_id, viewer_user_id, card_id),
  CONSTRAINT different_users CHECK (owner_user_id != viewer_user_id)
);

-- Create saved_profiles table
CREATE TABLE IF NOT EXISTS public.saved_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_name VARCHAR(100),
  tags TEXT[],
  notes TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  CONSTRAINT unique_saved_profile UNIQUE(user_id, saved_user_id)
);

-- Create card_drop_sessions table
CREATE TABLE IF NOT EXISTS public.card_drop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.digital_cards(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
  is_active BOOLEAN DEFAULT TRUE,
  scan_count INTEGER DEFAULT 0,
  max_scans INTEGER DEFAULT 10,
  device_info JSONB,
  ip_address INET
);

-- Create access_revocation_history table
CREATE TABLE IF NOT EXISTS public.access_revocation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_id UUID REFERENCES public.profile_access(id),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  viewer_user_id UUID NOT NULL REFERENCES auth.users(id),
  revoked_by UUID NOT NULL REFERENCES auth.users(id),
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  original_shared_at TIMESTAMP WITH TIME ZONE,
  total_views INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_access_owner ON public.profile_access(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_access_viewer ON public.profile_access(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_access_active ON public.profile_access(is_active);

CREATE INDEX IF NOT EXISTS idx_saved_profiles_user ON public.saved_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_profiles_saved_user ON public.saved_profiles(saved_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_profiles_favorite ON public.saved_profiles(is_favorite);

CREATE INDEX IF NOT EXISTS idx_card_drop_sessions_token ON public.card_drop_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_card_drop_sessions_active ON public.card_drop_sessions(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_revocation_history_owner ON public.access_revocation_history(owner_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profile_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_drop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_revocation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_access
CREATE POLICY "Users can view access records where they are owner or viewer"
  ON public.profile_access FOR SELECT
  USING (auth.uid() = owner_user_id OR auth.uid() = viewer_user_id);

CREATE POLICY "Users can insert access records"
  ON public.profile_access FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id OR auth.uid() = viewer_user_id);

CREATE POLICY "Users can update their own access records"
  ON public.profile_access FOR UPDATE
  USING (auth.uid() = owner_user_id OR auth.uid() = viewer_user_id);

-- RLS Policies for saved_profiles
CREATE POLICY "Users can view their saved profiles"
  ON public.saved_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert saved profiles"
  ON public.saved_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved profiles"
  ON public.saved_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved profiles"
  ON public.saved_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for card_drop_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.card_drop_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert sessions"
  ON public.card_drop_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.card_drop_sessions FOR UPDATE
  USING (auth.uid() = user_id);
