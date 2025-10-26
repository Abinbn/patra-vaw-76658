import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Eye, Maximize2, Palette, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'react-qr-code';
import { DraggableElement } from '@/components/editor/DraggableElement';

interface ElementPosition {
  x: number;
  y: number;
}

interface CardConfig {
  cardWidth: number;
  cardHeight: number;
  avatarSize: number;
  showQRCode: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showCompany: boolean;
  showJobTitle: boolean;
  fontSize: number;
  borderRadius: number;
  backgroundColor: string;
  backgroundPattern: 'none' | 'dots' | 'grid' | 'waves';
  backgroundImage: string;
  positions: {
    avatar: ElementPosition;
    name: ElementPosition;
    jobTitle: ElementPosition;
    company: ElementPosition;
    email: ElementPosition;
    phone: ElementPosition;
    qrCode: ElementPosition;
  };
}

const defaultPositions = {
  avatar: { x: 20, y: 60 },
  name: { x: 140, y: 60 },
  jobTitle: { x: 140, y: 90 },
  company: { x: 140, y: 115 },
  email: { x: 140, y: 150 },
  phone: { x: 140, y: 175 },
  qrCode: { x: 320, y: 80 },
};

export const CardEditorNew: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cardData, setCardData] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [cardConfig, setCardConfig] = useState<CardConfig>({
    cardWidth: 400,
    cardHeight: 250,
    avatarSize: 96,
    showQRCode: true,
    showEmail: true,
    showPhone: true,
    showCompany: true,
    showJobTitle: true,
    fontSize: 16,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    backgroundPattern: 'none',
    backgroundImage: '',
    positions: defaultPositions,
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
        
        if (content.cardConfig) {
          setCardConfig({
            ...cardConfig,
            ...content.cardConfig,
            positions: content.cardConfig.positions || defaultPositions,
          });
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as string;
    
    setCardConfig((prev) => ({
      ...prev,
      positions: {
        ...prev.positions,
        [elementId]: {
          x: prev.positions[elementId as keyof typeof prev.positions].x + delta.x,
          y: prev.positions[elementId as keyof typeof prev.positions].y + delta.y,
        },
      },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-card-bg-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setCardConfig({ ...cardConfig, backgroundImage: publicUrl });
      
      toast({
        title: 'Success',
        description: 'Background image uploaded!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getBackgroundStyle = () => {
    const base: React.CSSProperties = {
      width: `${cardConfig.cardWidth}px`,
      height: `${cardConfig.cardHeight}px`,
      borderRadius: `${cardConfig.borderRadius}px`,
      position: 'relative',
      overflow: 'hidden',
    };

    if (cardConfig.backgroundImage) {
      return {
        ...base,
        backgroundImage: `url(${cardConfig.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    const patterns = {
      none: cardConfig.backgroundColor,
      dots: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      grid: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      waves: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
    };

    return {
      ...base,
      backgroundColor: cardConfig.backgroundColor,
      backgroundImage: cardConfig.backgroundPattern !== 'none' ? patterns[cardConfig.backgroundPattern] : undefined,
      backgroundSize: cardConfig.backgroundPattern === 'grid' ? '20px 20px' : undefined,
    };
  };

  const renderCardPreview = () => {
    if (!cardData) return null;
    
    const content = cardData.content_json as any;

    return (
      <div className="flex items-center justify-center min-h-[500px] bg-muted rounded-lg p-8">
        <DndContext onDragEnd={handleDragEnd}>
          <div style={getBackgroundStyle()} className="shadow-2xl">
            {/* Avatar */}
            {cardConfig.showEmail && content.avatarUrl && (
              <DraggableElement
                id="avatar"
                position={cardConfig.positions.avatar}
                isSelected={selectedElement === 'avatar'}
                onSelect={() => setSelectedElement('avatar')}
              >
                <img 
                  src={content.avatarUrl} 
                  alt={content.fullName} 
                  className="rounded-lg object-cover border-2 border-white/20 shadow-xl"
                  style={{
                    width: `${cardConfig.avatarSize}px`,
                    height: `${cardConfig.avatarSize}px`,
                  }}
                />
              </DraggableElement>
            )}

            {/* Name */}
            <DraggableElement
              id="name"
              position={cardConfig.positions.name}
              isSelected={selectedElement === 'name'}
              onSelect={() => setSelectedElement('name')}
            >
              <h2 
                className="font-bold text-white truncate max-w-[200px]"
                style={{ fontSize: `${cardConfig.fontSize + 4}px` }}
              >
                {content.fullName || 'Your Name'}
              </h2>
            </DraggableElement>

            {/* Job Title */}
            {cardConfig.showJobTitle && content.jobTitle && (
              <DraggableElement
                id="jobTitle"
                position={cardConfig.positions.jobTitle}
                isSelected={selectedElement === 'jobTitle'}
                onSelect={() => setSelectedElement('jobTitle')}
              >
                <p 
                  className="text-white/80 truncate max-w-[200px]"
                  style={{ fontSize: `${cardConfig.fontSize - 2}px` }}
                >
                  {content.jobTitle}
                </p>
              </DraggableElement>
            )}

            {/* Company */}
            {cardConfig.showCompany && content.company && (
              <DraggableElement
                id="company"
                position={cardConfig.positions.company}
                isSelected={selectedElement === 'company'}
                onSelect={() => setSelectedElement('company')}
              >
                <p 
                  className="text-white/60 truncate max-w-[200px]"
                  style={{ fontSize: `${cardConfig.fontSize - 4}px` }}
                >
                  {content.company}
                </p>
              </DraggableElement>
            )}

            {/* Email */}
            {cardConfig.showEmail && content.email && (
              <DraggableElement
                id="email"
                position={cardConfig.positions.email}
                isSelected={selectedElement === 'email'}
                onSelect={() => setSelectedElement('email')}
              >
                <div 
                  className="text-white/90 truncate max-w-[200px]"
                  style={{ fontSize: `${cardConfig.fontSize - 4}px` }}
                >
                  {content.email}
                </div>
              </DraggableElement>
            )}

            {/* Phone */}
            {cardConfig.showPhone && content.phone && (
              <DraggableElement
                id="phone"
                position={cardConfig.positions.phone}
                isSelected={selectedElement === 'phone'}
                onSelect={() => setSelectedElement('phone')}
              >
                <div 
                  className="text-white/90 truncate max-w-[200px]"
                  style={{ fontSize: `${cardConfig.fontSize - 4}px` }}
                >
                  {content.phone}
                </div>
              </DraggableElement>
            )}

            {/* QR Code */}
            {cardConfig.showQRCode && (
              <DraggableElement
                id="qrCode"
                position={cardConfig.positions.qrCode}
                isSelected={selectedElement === 'qrCode'}
                onSelect={() => setSelectedElement('qrCode')}
              >
                <div className="bg-white p-2 rounded-lg">
                  <QRCode 
                    value={`${window.location.origin}/${cardData.vanity_url}`} 
                    size={60} 
                    level="M"
                  />
                </div>
              </DraggableElement>
            )}
          </div>
        </DndContext>
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
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Card Editor</h1>
                <p className="text-sm text-muted-foreground">
                  Drag elements to position them on your card
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
          {/* Interactive Canvas */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Interactive Canvas</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Click and drag elements to reposition them
            </p>
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
                  Content
                </TabsTrigger>
                <TabsTrigger value="style">
                  <Palette className="w-4 h-4 mr-2" />
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
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={cardConfig.backgroundColor}
                      onChange={(e) => setCardConfig({ ...cardConfig, backgroundColor: e.target.value })}
                      className="mt-2 h-12 cursor-pointer"
                    />
                  </div>

                  <div>
                    <Label>Background Pattern</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(['none', 'dots', 'grid', 'waves'] as const).map((pattern) => (
                        <Button
                          key={pattern}
                          variant={cardConfig.backgroundPattern === pattern ? 'default' : 'outline'}
                          onClick={() => setCardConfig({ ...cardConfig, backgroundPattern: pattern })}
                          className="capitalize"
                        >
                          {pattern}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Background Image</Label>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                      {cardConfig.backgroundImage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCardConfig({ ...cardConfig, backgroundImage: '' })}
                          className="mt-2"
                        >
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>

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
