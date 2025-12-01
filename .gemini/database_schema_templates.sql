-- ============================================
-- PATRA TEMPLATE MANAGEMENT DATABASE SCHEMA
-- ============================================
-- This file contains the complete database schema for the template management system
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE/UPDATE BACKGROUND_IMAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS background_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  category TEXT,
  preview_url TEXT,
  downloads_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- GIN index for array search on tags
CREATE INDEX IF NOT EXISTS idx_background_images_tags 
  ON background_images USING GIN(tags);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_background_images_category 
  ON background_images(category) 
  WHERE category IS NOT NULL;

-- Index for active templates
CREATE INDEX IF NOT EXISTS idx_background_images_active 
  ON background_images(is_active) 
  WHERE is_active = true;

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_background_images_created_at 
  ON background_images(created_at DESC);

-- Index for sorting by usage
CREATE INDEX IF NOT EXISTS idx_background_images_usage 
  ON background_images(usage_count DESC);

-- ============================================
-- 3. CREATE TEMPLATE USAGE TRACKING TABLE (OPTIONAL)
-- ============================================

CREATE TABLE IF NOT EXISTS template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES background_images(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  applied_to TEXT CHECK (applied_to IN ('card', 'profile', 'both')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id, applied_to)
);

-- Indexes for template usage
CREATE INDEX IF NOT EXISTS idx_template_usage_template 
  ON template_usage(template_id);

CREATE INDEX IF NOT EXISTS idx_template_usage_user 
  ON template_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_template_usage_applied_at 
  ON template_usage(applied_at DESC);

-- ============================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for background_images
DROP TRIGGER IF EXISTS update_background_images_updated_at ON background_images;
CREATE TRIGGER update_background_images_updated_at
  BEFORE UPDATE ON background_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE background_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES FOR BACKGROUND_IMAGES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active templates" ON background_images;
DROP POLICY IF EXISTS "Admins can view all templates" ON background_images;
DROP POLICY IF EXISTS "Admins can insert templates" ON background_images;
DROP POLICY IF EXISTS "Admins can update templates" ON background_images;
DROP POLICY IF EXISTS "Admins can delete templates" ON background_images;

-- Allow everyone to view active templates
CREATE POLICY "Anyone can view active templates"
  ON background_images
  FOR SELECT
  USING (is_active = true);

-- Allow admins to view all templates (including inactive)
CREATE POLICY "Admins can view all templates"
  ON background_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow admins to insert templates
CREATE POLICY "Admins can insert templates"
  ON background_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow admins to update templates
CREATE POLICY "Admins can update templates"
  ON background_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow admins to delete templates
CREATE POLICY "Admins can delete templates"
  ON background_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- 7. CREATE RLS POLICIES FOR TEMPLATE_USAGE
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own usage" ON template_usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON template_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON template_usage;

-- Allow users to view their own template usage
CREATE POLICY "Users can view their own usage"
  ON template_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own template usage
CREATE POLICY "Users can insert their own usage"
  ON template_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all template usage
CREATE POLICY "Admins can view all usage"
  ON template_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- 8. CREATE FUNCTION TO INCREMENT USAGE COUNT
-- ============================================

CREATE OR REPLACE FUNCTION increment_template_usage(template_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE background_images
  SET usage_count = usage_count + 1
  WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_template_usage(UUID) TO authenticated;

-- ============================================
-- 9. CREATE FUNCTION TO GET POPULAR TEMPLATES
-- ============================================

CREATE OR REPLACE FUNCTION get_popular_templates(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  tags TEXT[],
  category TEXT,
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bg.id,
    bg.name,
    bg.description,
    bg.image_url,
    bg.tags,
    bg.category,
    bg.usage_count
  FROM background_images bg
  WHERE bg.is_active = true
  ORDER BY bg.usage_count DESC, bg.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_popular_templates(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_templates(INTEGER) TO anon;

-- ============================================
-- 10. CREATE FUNCTION TO SEARCH TEMPLATES
-- ============================================

CREATE OR REPLACE FUNCTION search_templates(search_query TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  tags TEXT[],
  category TEXT,
  usage_count INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bg.id,
    bg.name,
    bg.description,
    bg.image_url,
    bg.tags,
    bg.category,
    bg.usage_count,
    (
      CASE 
        WHEN LOWER(bg.name) = LOWER(search_query) THEN 1.0
        WHEN LOWER(bg.name) LIKE LOWER(search_query || '%') THEN 0.9
        WHEN LOWER(bg.name) LIKE LOWER('%' || search_query || '%') THEN 0.7
        WHEN bg.tags @> ARRAY[LOWER(search_query)] THEN 0.8
        WHEN LOWER(bg.description) LIKE LOWER('%' || search_query || '%') THEN 0.5
        WHEN LOWER(bg.category) = LOWER(search_query) THEN 0.6
        ELSE 0.3
      END
    )::REAL AS relevance
  FROM background_images bg
  WHERE 
    bg.is_active = true
    AND (
      LOWER(bg.name) LIKE LOWER('%' || search_query || '%')
      OR LOWER(bg.description) LIKE LOWER('%' || search_query || '%')
      OR bg.tags && ARRAY[LOWER(search_query)]
      OR LOWER(bg.category) LIKE LOWER('%' || search_query || '%')
    )
  ORDER BY relevance DESC, bg.usage_count DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_templates(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_templates(TEXT) TO anon;

-- ============================================
-- 11. INSERT SAMPLE/SEED DATA (OPTIONAL)
-- ============================================

-- Uncomment the following to insert sample templates
-- Note: Replace 'YOUR_ADMIN_USER_ID' with an actual admin user ID

/*
INSERT INTO background_images (name, description, image_url, tags, category, is_active) VALUES
  ('Abstract Purple Gradient', 'Modern purple gradient background', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop', ARRAY['abstract', 'purple', 'gradient', 'modern'], 'abstract', true),
  ('Blue Wave Pattern', 'Flowing blue wave pattern', 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=500&fit=crop', ARRAY['abstract', 'blue', 'waves', 'pattern'], 'abstract', true),
  ('Golden Liquid', 'Luxurious golden liquid texture', 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&h=500&fit=crop', ARRAY['abstract', 'gold', 'luxury', 'elegant'], 'luxury', true),
  ('Ocean Blue', 'Calm ocean blue background', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop', ARRAY['nature', 'ocean', 'blue', 'calm'], 'nature', true),
  ('Forest Green', 'Peaceful forest scenery', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop', ARRAY['nature', 'forest', 'green', 'peaceful'], 'nature', true),
  ('Sunset Gradient', 'Beautiful sunset gradient', 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=500&fit=crop', ARRAY['gradient', 'sunset', 'orange', 'pink'], 'gradient', true),
  ('Neon Lights', 'Vibrant neon light effects', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=500&fit=crop', ARRAY['gradient', 'neon', 'colorful', 'modern'], 'creative', true),
  ('Circuit Board', 'Modern circuit board pattern', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop', ARRAY['tech', 'modern', 'professional', 'blue'], 'tech', true),
  ('Digital Matrix', 'Digital matrix background', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=500&fit=crop', ARRAY['tech', 'digital', 'modern', 'green'], 'tech', true),
  ('White Marble', 'Elegant white marble texture', 'https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=800&h=500&fit=crop', ARRAY['minimal', 'marble', 'elegant', 'white'], 'minimal', true),
  ('Black Concrete', 'Professional black concrete', 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&h=500&fit=crop', ARRAY['minimal', 'concrete', 'professional', 'dark'], 'minimal', true),
  ('Corporate Blue', 'Clean corporate blue background', 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=500&fit=crop', ARRAY['professional', 'corporate', 'blue', 'clean'], 'professional', true),
  ('Business Gray', 'Modern business gray theme', 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&h=500&fit=crop', ARRAY['professional', 'business', 'gray', 'modern'], 'professional', true),
  ('Colorful Paint', 'Artistic colorful paint splash', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=500&fit=crop', ARRAY['creative', 'colorful', 'artistic', 'vibrant'], 'creative', true),
  ('Watercolor Art', 'Soft watercolor art background', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop', ARRAY['creative', 'watercolor', 'artistic', 'soft'], 'creative', true),
  ('Dark Space', 'Mysterious dark space background', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop', ARRAY['dark', 'space', 'elegant', 'mysterious'], 'dark', true),
  ('Rose Gold', 'Premium rose gold texture', 'https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=800&h=500&fit=crop', ARRAY['luxury', 'rose-gold', 'elegant', 'premium'], 'luxury', true)
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- 12. VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify the setup:

-- Check if table exists and has correct structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'background_images';

-- Check if indexes were created
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'background_images';

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename IN ('background_images', 'template_usage');

-- Check if policies were created
-- SELECT policyname, tablename, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('background_images', 'template_usage');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Verify all tables and policies are created
-- 2. Insert sample data if needed
-- 3. Test RLS policies with different user roles
-- 4. Update your application code to use these tables
-- ============================================
