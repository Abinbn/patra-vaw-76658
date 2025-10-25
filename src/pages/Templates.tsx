import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Crown, Palette, Layout, Sparkles } from 'lucide-react';
import { defaultCardTemplates, defaultProfileTemplates, CardTemplate } from '@/types/template';
import { toast } from '@/hooks/use-toast';

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

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

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template to apply.",
        variant: "destructive"
      });
      return;
    }
    
    // Store selected template in localStorage
    localStorage.setItem('selectedTemplate', selectedTemplate);
    navigate('/editor');
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
          {/* Template Preview */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <Layout className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Preview</p>
            </div>
          </div>
          
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
            
            <Button 
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
              size="lg"
            >
              Apply Template
            </Button>
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
              <p className="text-muted-foreground">
                Perfect for business cards and quick sharing
              </p>
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
              <p className="text-muted-foreground">
                Comprehensive layouts for full profile pages
              </p>
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
