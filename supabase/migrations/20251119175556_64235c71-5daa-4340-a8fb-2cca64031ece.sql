-- Create background_images table for storing template backgrounds
CREATE TABLE IF NOT EXISTS public.background_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_public boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.background_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view public background images"
  ON public.background_images
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can manage background images"
  ON public.background_images
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_background_images_updated_at
  BEFORE UPDATE ON public.background_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();