import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, Maximize2, Move, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'react-qr-code';

interface CardConfig {
  cardWidth: number;
  cardHeight: number;
  avatarSize: number;
  avatarPosition: 'left' | 'center' | 'right';
  showQRCode: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showCompany: boolean;
  showJobTitle: boolean;
  fontSize: number;
  borderRadius: number;
}

export const CardEditor: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cardData, setCardData] = useState<any>(null);
  const [cardConfig, setCardConfig] = useState<CardConfig>({
    cardWidth: 400,
    cardHeight: 250,
    avatarSize: 96,
    avatarPosition: 'left',
    showQRCode: true,
    showEmail: true,
    showPhone: true,
    showCompany: true,
    showJobTitle: true,
    fontSize: 16,
    borderRadius: 12,
  });

  useEffect(() => {
    if (user) {
      fetchCardData();
    }
  }, [user]);

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
        const content = data.content_json as any;
        
        // Load saved card config if exists
        if (content.cardConfig) {
          setCardConfig(content.cardConfig);
        }
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

  const handleSaveConfig = async () => {
    if (!cardData) return;
    
    setSaving(true);
    try {
      const currentContent = cardData.content_json || {};
      
      const { error } = await supabase
        .from('digital_cards')
        .update({
          content_json: {
            ...currentContent,
            cardConfig,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardData.id);

      if (error) throw error;

      toast({
        title: 'Saved!',
        description: 'Card configuration saved successfully.',
      });
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save configuration.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderCardPreview = () => {
    if (!cardData) return null;
    
    const content = cardData.content_json as any;
    const cardUrl = `${window.location.origin}/${cardData.vanity_url}?card`;
    
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg p-8">
        <div 
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-2xl overflow-hidden"
          style={{
            width: `${cardConfig.cardWidth}px`,
            height: `${cardConfig.cardHeight}px`,
            borderRadius: `${cardConfig.borderRadius}px`,
          }}
        >
          {/* Card Content */}
          <div className="relative h-full p-6 flex items-center gap-5">
            {/* Avatar */}
            <div 
              className={`flex-shrink-0 ${
                cardConfig.avatarPosition === 'center' ? 'mx-auto' : 
                cardConfig.avatarPosition === 'right' ? 'ml-auto' : ''
              }`}
            >
              {content.avatarUrl ? (
                <img 
                  src={content.avatarUrl} 
                  alt={content.fullName} 
                  className="rounded-lg object-cover border-2 border-white/20 shadow-xl"
                  style={{
                    width: `${cardConfig.avatarSize}px`,
                    height: `${cardConfig.avatarSize}px`,
                  }}
                />
              ) : (
                <div 
                  className="rounded-lg bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-xl"
                  style={{
                    width: `${cardConfig.avatarSize}px`,
                    height: `${cardConfig.avatarSize}px`,
                  }}
                >
                  {content.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 
                className="font-bold text-white mb-1 truncate"
                style={{ fontSize: `${cardConfig.fontSize + 4}px` }}
              >
                {content.fullName || 'Your Name'}
              </h2>
              
              {cardConfig.showJobTitle && content.jobTitle && (
                <p 
                  className="text-white/80 mb-0.5 truncate"
                  style={{ fontSize: `${cardConfig.fontSize - 2}px` }}
                >
                  {content.jobTitle}
                </p>
              )}
              
              {cardConfig.showCompany && content.company && (
                <p 
                  className="text-white/60 mb-3 truncate"
                  style={{ fontSize: `${cardConfig.fontSize - 4}px` }}
                >
                  {content.company}
                </p>
              )}
              
              <div className="space-y-1.5">
                {cardConfig.showEmail && content.email && (
                  <div 
                    className="flex items-center gap-2 text-white/90"
                    style={{ fontSize: `${cardConfig.fontSize - 4}px` }}
                  >
                    <span className="truncate">{content.email}</span>
                  </div>
                )}
                
                {cardConfig.showPhone && content.phone && (
                  <div 
                    className="flex items-center gap-2 text-white/90"
                    style={{ fontSize: `${cardConfig.fontSize - 4}px` }}
                  >
                    <span className="truncate">{content.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            {cardConfig.showQRCode && (
              <div className="flex-shrink-0">
                <div className="bg-white p-2 rounded-lg">
                  <QRCode 
                    value={cardUrl} 
                    size={60} 
                    level="M"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading card editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 overflow-x-auto">
        <div className="container mx-auto px-4 py-4 min-w-max">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Card Editor</h1>
                <p className="text-sm text-muted-foreground">
                  Customize your business card layout and appearance
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/${cardData?.vanity_url}?card`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleSaveConfig}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            {renderCardPreview()}
          </div>

          {/* Settings */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Card Settings</h2>
            
            <Tabs defaultValue="layout" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="layout">
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="content">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="style">
                  <Move className="w-4 h-4 mr-2" />
                  Style
                </TabsTrigger>
              </TabsList>

              <TabsContent value="layout" className="space-y-6">
                <Card className="p-6 space-y-6">
                  <div>
                    <Label>Card Width: {cardConfig.cardWidth}px</Label>
                    <Slider
                      value={[cardConfig.cardWidth]}
                      onValueChange={([value]) => setCardConfig({ ...cardConfig, cardWidth: value })}
                      min={300}
                      max={500}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Card Height: {cardConfig.cardHeight}px</Label>
                    <Slider
                      value={[cardConfig.cardHeight]}
                      onValueChange={([value]) => setCardConfig({ ...cardConfig, cardHeight: value })}
                      min={200}
                      max={350}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Avatar Size: {cardConfig.avatarSize}px</Label>
                    <Slider
                      value={[cardConfig.avatarSize]}
                      onValueChange={([value]) => setCardConfig({ ...cardConfig, avatarSize: value })}
                      min={60}
                      max={150}
                      step={6}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Avatar Position</Label>
                    <div className="flex gap-2 mt-2">
                      {(['left', 'center', 'right'] as const).map((pos) => (
                        <Button
                          key={pos}
                          variant={cardConfig.avatarPosition === pos ? 'default' : 'outline'}
                          onClick={() => setCardConfig({ ...cardConfig, avatarPosition: pos })}
                          className="flex-1 capitalize"
                        >
                          {pos}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Show QR Code</Label>
                    <Switch
                      checked={cardConfig.showQRCode}
                      onCheckedChange={(checked) => setCardConfig({ ...cardConfig, showQRCode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Email</Label>
                    <Switch
                      checked={cardConfig.showEmail}
                      onCheckedChange={(checked) => setCardConfig({ ...cardConfig, showEmail: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Phone</Label>
                    <Switch
                      checked={cardConfig.showPhone}
                      onCheckedChange={(checked) => setCardConfig({ ...cardConfig, showPhone: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Company</Label>
                    <Switch
                      checked={cardConfig.showCompany}
                      onCheckedChange={(checked) => setCardConfig({ ...cardConfig, showCompany: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Job Title</Label>
                    <Switch
                      checked={cardConfig.showJobTitle}
                      onCheckedChange={(checked) => setCardConfig({ ...cardConfig, showJobTitle: checked })}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="style" className="space-y-6">
                <Card className="p-6 space-y-6">
                  <div>
                    <Label>Font Size: {cardConfig.fontSize}px</Label>
                    <Slider
                      value={[cardConfig.fontSize]}
                      onValueChange={([value]) => setCardConfig({ ...cardConfig, fontSize: value })}
                      min={12}
                      max={24}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Border Radius: {cardConfig.borderRadius}px</Label>
                    <Slider
                      value={[cardConfig.borderRadius]}
                      onValueChange={([value]) => setCardConfig({ ...cardConfig, borderRadius: value })}
                      min={0}
                      max={24}
                      step={2}
                      className="mt-2"
                    />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
