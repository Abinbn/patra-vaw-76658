import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Search,
  Image as ImageIcon,
  CheckCircle2,
  LayoutTemplate,
  UserCircle,
  CreditCard,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundTemplate {
  id: string;
  name: string;
  image_url: string;
  tags: string[];
  description?: string;
}

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BackgroundTemplate | null>(null);
  const [cardData, setCardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<BackgroundTemplate[]>([]);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadTemplates();
    if (user) {
      fetchCardData();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('background_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCardData = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_cards')
        .select('*')
        .eq('owner_user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) setCardData(data);
    } catch (error) {
      console.error('Error fetching card:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  const handleSelectTemplate = (template: BackgroundTemplate) => {
    setSelectedTemplate(template);
    setShowApplyDialog(true);
  };

  const handleApplyTemplate = async (target: 'card' | 'profile' | 'both') => {
    if (!selectedTemplate || !cardData) return;

    setSaving(true);

    try {
      const currentContent = cardData.content_json || {};
      const currentConfig = currentContent.cardConfig || {};

      let updatedContent = { ...currentContent };

      // Apply to card background
      if (target === 'card' || target === 'both') {
        updatedContent.cardConfig = {
          ...currentConfig,
          backgroundImage: selectedTemplate.image_url,
          backBackgroundImage: selectedTemplate.image_url,
          backgroundColor: '#1e293b',
          backgroundPattern: 'none',
        };
      }

      // Apply to profile banner
      if (target === 'profile' || target === 'both') {
        updatedContent.bannerType = 'image';
        updatedContent.bannerValue = selectedTemplate.image_url;
      }

      const { error } = await supabase
        .from('digital_cards')
        .update({
          content_json: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardData.id);

      if (error) throw error;

      setShowApplyDialog(false);
      setShowSuccess(true);

      // Refresh card data
      await fetchCardData();

      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedTemplate(null);
      }, 2000);

    } catch (error: any) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply template.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading amazing templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-card border border-border p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Template Applied!</h2>
              <p className="text-muted-foreground">
                Your new design has been successfully applied.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <LayoutTemplate className="w-6 h-6 text-primary" />
                  Design Gallery
                </h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  Discover premium backgrounds for your digital presence
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search styles, colors, moods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any templates matching "{searchQuery}". Try searching for something else or browse all templates.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="group overflow-hidden cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-card h-full flex flex-col"
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                    <img
                      src={template.image_url}
                      alt={template.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Button variant="secondary" className="rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        Use Template
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {template.description}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {template.tags?.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs font-normal bg-muted/50 hover:bg-muted"
                        >
                          #{tag}
                        </Badge>
                      ))}
                      {template.tags?.length > 3 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Apply Design</DialogTitle>
            <DialogDescription className="text-center">
              Choose where you want to apply "{selectedTemplate?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
              onClick={() => handleApplyTemplate('card')}
              disabled={saving}
            >
              <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <CreditCard className="w-6 h-6 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <span className="font-semibold block">Card Only</span>
                <span className="text-xs text-muted-foreground group-hover:text-primary/80">Digital card background</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
              onClick={() => handleApplyTemplate('profile')}
              disabled={saving}
            >
              <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <UserCircle className="w-6 h-6 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <span className="font-semibold block">Profile Only</span>
                <span className="text-xs text-muted-foreground group-hover:text-primary/80">Profile banner image</span>
              </div>
            </Button>

            <Button
              variant="default"
              className="sm:col-span-2 h-auto p-4 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              onClick={() => handleApplyTemplate('both')}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <div className="text-left">
                <span className="font-semibold block">Apply to Everything</span>
                <span className="text-xs opacity-90 font-normal">Update both card and profile</span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
