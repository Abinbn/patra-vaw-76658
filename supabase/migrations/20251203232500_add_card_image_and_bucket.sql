-- Add card_image_url to digital_cards
ALTER TABLE public.digital_cards ADD COLUMN IF NOT EXISTS card_image_url TEXT;

-- Create storage bucket for card images
INSERT INTO storage.buckets (id, name, public)
VALUES ('card_images', 'card_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for card_images bucket
CREATE POLICY "Card images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'card_images');

CREATE POLICY "Users can upload their own card images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'card_images' AND
  auth.uid() = owner
);

CREATE POLICY "Users can update their own card images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'card_images' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own card images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'card_images' AND
  auth.uid() = owner
);
