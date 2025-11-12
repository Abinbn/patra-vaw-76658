import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface ImageTemplate {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
}

const imageTemplates: ImageTemplate[] = [
  {
    id: 'abstract-1',
    name: 'Abstract Purple Gradient',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
    tags: ['abstract', 'purple', 'gradient', 'modern'],
  },
  {
    id: 'abstract-2',
    name: 'Blue Wave Pattern',
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=500&fit=crop',
    tags: ['abstract', 'blue', 'waves', 'pattern'],
  },
  {
    id: 'abstract-3',
    name: 'Golden Liquid',
    imageUrl: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&h=500&fit=crop',
    tags: ['abstract', 'gold', 'luxury', 'elegant'],
  },
  {
    id: 'nature-1',
    name: 'Ocean Blue',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop',
    tags: ['nature', 'ocean', 'blue', 'calm'],
  },
  {
    id: 'nature-2',
    name: 'Forest Green',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop',
    tags: ['nature', 'forest', 'green', 'peaceful'],
  },
  {
    id: 'gradient-1',
    name: 'Sunset Gradient',
    imageUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=500&fit=crop',
    tags: ['gradient', 'sunset', 'orange', 'pink'],
  },
  {
    id: 'gradient-2',
    name: 'Neon Lights',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=500&fit=crop',
    tags: ['gradient', 'neon', 'colorful', 'modern'],
  },
  {
    id: 'tech-1',
    name: 'Circuit Board',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
    tags: ['tech', 'modern', 'professional', 'blue'],
  },
  {
    id: 'tech-2',
    name: 'Digital Matrix',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=500&fit=crop',
    tags: ['tech', 'digital', 'modern', 'green'],
  },
  {
    id: 'minimal-1',
    name: 'White Marble',
    imageUrl: 'https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=800&h=500&fit=crop',
    tags: ['minimal', 'marble', 'elegant', 'white'],
  },
  {
    id: 'minimal-2',
    name: 'Black Concrete',
    imageUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&h=500&fit=crop',
    tags: ['minimal', 'concrete', 'professional', 'dark'],
  },
  {
    id: 'professional-1',
    name: 'Corporate Blue',
    imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=500&fit=crop',
    tags: ['professional', 'corporate', 'blue', 'clean'],
  },
  {
    id: 'professional-2',
    name: 'Business Gray',
    imageUrl: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&h=500&fit=crop',
    tags: ['professional', 'business', 'gray', 'modern'],
  },
  {
    id: 'creative-1',
    name: 'Colorful Paint',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=500&fit=crop',
    tags: ['creative', 'colorful', 'artistic', 'vibrant'],
  },
  {
    id: 'creative-2',
    name: 'Watercolor Art',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop',
    tags: ['creative', 'watercolor', 'artistic', 'soft'],
  },
  {
    id: 'dark-1',
    name: 'Dark Space',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop',
    tags: ['dark', 'space', 'elegant', 'mysterious'],
  },
];

export const CardTemplates: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [cardData, setCardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState(imageTemplates);

  useEffect(() => {
    if (user) {
      fetchCardData();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = imageTemplates.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(imageTemplates);
    }
  }, [searchQuery]);

  const fetchCardData = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_cards')
        .select('*')
        .eq('owner_user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setCardData(data);
      }
    } catch (error) {
      console.error('Error fetching card:', error);
      toast({
        title: 'Error',
        description: 'Failed to load card data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (template: ImageTemplate) => {
    if (!cardData) return;
    
    setSaving(true);
    setSelectedTemplate(template.id);
    
    try {
      const currentContent = cardData.content_json || {};
      const currentConfig = currentContent.cardConfig || {};
      
      const { error } = await supabase
        .from('digital_cards')
        .update({
          content_json: {
            ...currentContent,
            cardConfig: {
              ...currentConfig,
              backgroundImage: template.imageUrl,
              backBackgroundImage: template.imageUrl, // Apply to both front and back
              backgroundColor: '#1e293b', // Fallback if image fails to load
              backgroundPattern: 'none',
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardData.id);

      if (error) throw error;

      toast({
        title: 'Template Applied!',
        description: `"${template.name}" has been applied to your card (front & back).`,
      });

      // Refresh card data
      await fetchCardData();
    } catch (error: any) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply template.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      setSelectedTemplate(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Card Background Images</h1>
                <p className="text-sm text-muted-foreground">
                  Choose a background image for your card
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            Select an image template to instantly update your card's background on both front and back sides.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or tags (e.g., 'blue', 'professional')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => handleApplyTemplate(template)}
              >
                {/* Template Preview */}
                <div
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${template.imageUrl})` }}
                >
                  {saving && selectedTemplate === template.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4 bg-card">
                  <h3 className="font-semibold text-base mb-2">{template.name}</h3>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyTemplate(template);
                    }}
                    disabled={saving && selectedTemplate === template.id}
                  >
                    {saving && selectedTemplate === template.id ? (
                      'Applying...'
                    ) : (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Apply to Card
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 p-6 bg-muted">
          <h3 className="font-semibold mb-3">Need to upload your own image?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use the Advanced Card Editor to upload your own background image or customize other aspects of your card design.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/card-editor')}
            >
              Go to Basic Editor
            </Button>
            <Button
              onClick={() => navigate('/card-editor-new')}
            >
              Go to Advanced Editor
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
