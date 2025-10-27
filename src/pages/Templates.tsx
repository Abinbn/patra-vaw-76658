import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Crown, Palette, Layout, Sparkles, ExternalLink } from 'lucide-react';
import { defaultCardTemplates, defaultProfileTemplates, CardTemplate } from '@/types/template';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';


export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userCard, setUserCard] = useState<any>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserCard();
    }
  }, [user]);

  const fetchUserCard = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_cards')
        .select('*')
        .eq('owner_user_id', user?.id)
        .single();

      if (error) throw error;
      setUserCard(data);
    } catch (error) {
      console.error('Error fetching card:', error);
    } finally {
      setLoadingCard(false);
    }
  };

  const handleSelectTemplate = (template: CardTemplate) => {
    if (template.isPremium) {
      toast({
        title: "Premium Template",
        description: "This template will be available in a future update.",
        variant: "default"
      });
      return;
    }
    
    setSelectedTemplate(template.id);
    toast({
      title: "Template Selected",
      description: `${template.name} template will be applied when you go to the editor.`,
    });
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template to apply.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply templates.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setApplying(true);
    
    try {
      // Find the selected template
      const allTemplates = [...defaultCardTemplates, ...defaultProfileTemplates];
      const template = allTemplates.find(t => t.id === selectedTemplate);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Wait 1 second for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Apply template to user's card - remove existing theme when template is applied
      if (userCard) {
        const currentContent = userCard.content_json || {};
        const { theme, ...contentWithoutTheme } = currentContent;
        
        const updatedContentJson = {
          ...contentWithoutTheme,
          customCSS: template.style.customCSS || '',
          bannerType: template.style.backgroundColor ? 'color' : template.style.backgroundPattern ? 'pattern' : undefined,
          bannerValue: template.style.backgroundColor || template.style.backgroundPattern || undefined,
        };

        const { error } = await supabase
          .from('digital_cards')
          .update({
            content_json: updatedContentJson,
            template_id: selectedTemplate,
            updated_at: new Date().toISOString()
          })
          .eq('id', userCard.id);

        if (error) throw error;

        toast({
          title: "Template Applied! ✨",
          description: `${template.name} template has been applied to your card.`,
        });

        // Clear selection and stay on templates page
        localStorage.removeItem('selectedTemplate');
        setSelectedTemplate(null);
        fetchUserCard(); // Refresh the preview
      }
    } catch (error: any) {
      console.error('Error applying template:', error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to apply template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const TemplateCard = ({ template }: { template: CardTemplate }) => {
    const isSelected = selectedTemplate === template.id;
    
    return (
      <Card 
        className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => handleSelectTemplate(template)}
      >
        <div className="relative aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
          {/* Template Thumbnail */}
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
          
          {isSelected && (
            <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          
          {template.isPremium && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <Badge variant="outline">{template.style.layout}</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {template.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    );
  };

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
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Palette className="w-6 h-6" />
                  Template Gallery
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a stunning design for your digital card
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/${userCard?.vanity_url || 'mycard'}`)}
                disabled={!userCard}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button 
                onClick={handleApplyTemplate}
                disabled={!selectedTemplate || applying}
                size="lg"
              >
                {applying ? 'Applying...' : 'Apply Template'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="card" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="card">
              <CreditCard className="w-4 h-4 mr-2" />
              Card Templates
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Layout className="w-4 h-4 mr-2" />
              Profile Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Card Templates</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                Templates change the visual design and layout of your digital card. Your content (name, contact info, links) stays the same - only the styling changes. Choose a template that matches your professional style.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto mb-6">
                <h3 className="font-semibold text-sm mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  What happens when you apply a template?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                  <li>✓ Your design updates instantly with new colors and layout</li>
                  <li>✓ All your content (contact info, links, photos) remains unchanged</li>
                  <li>✓ You can switch templates anytime without losing data</li>
                  <li>✓ Preview your card before making it public</li>
                </ul>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/card-editor')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Edit Card
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/editor')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Edit Content
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/${userCard?.vanity_url || 'mycard'}?card`)}
                  disabled={!userCard}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Card
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultCardTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Profile Templates</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                Profile templates offer comprehensive layouts for showcasing your full professional presence. These templates include advanced sections like galleries, testimonials, and achievements.
              </p>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 max-w-2xl mx-auto mb-6">
                <h3 className="font-semibold text-sm mb-2 flex items-center justify-center gap-2">
                  <Layout className="w-4 h-4 text-accent" />
                  Profile vs Card Templates
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                  <li><strong>Card Templates:</strong> Compact, business card-style layouts</li>
                  <li><strong>Profile Templates:</strong> Full-page layouts with advanced features</li>
                  <li>Both use your same content - just different presentations</li>
                </ul>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/editor')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/${userCard?.vanity_url || 'mycard'}`)}
                  disabled={!userCard}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultProfileTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Community Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Community Templates Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            In the future, you'll be able to create and share your own templates with the community!
          </p>
          <Button variant="outline" disabled>
            <Palette className="w-4 h-4 mr-2" />
            Create Your Own Template
          </Button>
        </div>
      </main>
    </div>
  );
};

import { CreditCard } from 'lucide-react';
