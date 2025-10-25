-- Create documentation_pages table for admin-managed documentation
CREATE TABLE IF NOT EXISTS public.documentation_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documentation_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view published documentation
CREATE POLICY "Published documentation is viewable by everyone"
ON public.documentation_pages
FOR SELECT
USING (is_published = true);

-- Policy: Admins can manage all documentation
CREATE POLICY "Admins can manage documentation"
ON public.documentation_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_documentation_pages_page_id ON public.documentation_pages(page_id);
CREATE INDEX idx_documentation_pages_parent_id ON public.documentation_pages(parent_id);

-- Trigger for updated_at
CREATE TRIGGER update_documentation_pages_updated_at
BEFORE UPDATE ON public.documentation_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();