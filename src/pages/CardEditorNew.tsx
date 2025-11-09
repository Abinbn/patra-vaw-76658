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
  fontFamily: string;
  textColor: string;
  borderRadius: number;
  backgroundColor: string;
  backgroundPattern: 'none' | 'dots' | 'grid' | 'waves';
  backgroundImage: string;
  useGradient: boolean;
  gradientColors: string[];
  gradientDirection: 'to-r' | 'to-br' | 'to-b' | 'to-bl';
  backBackgroundColor: string;
  backBackgroundPattern: 'none' | 'dots' | 'grid' | 'waves';
  backBackgroundImage: string;
  backUseGradient: boolean;
  backGradientColors: string[];
  backGradientDirection: 'to-r' | 'to-br' | 'to-b' | 'to-bl';
  bannerImage: string;
  bannerHeight: number;
  qrCodeSize: number;
  qrCodeStyle: 'square' | 'rounded';
  positions: {
    avatar: ElementPosition;
    name: ElementPosition;
    jobTitle: ElementPosition;
    company: ElementPosition;
    email: ElementPosition;
    phone: ElementPosition;
    qrCode: ElementPosition;
  };
  backPositions: {
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

const defaultBackPositions = {
  qrCode: { x: 140, y: 70 },
};

export const CardEditorNew: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cardData, setCardData] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [isLocked, setIsLocked] = useState(false);
  const [cardConfig, setCardConfig] = useState<CardConfig>({
    cardWidth: 400,
    cardHeight: 250,
    avatarSize: 96,
    showQRCode: false,
    showEmail: true,
    showPhone: true,
    showCompany: true,
    showJobTitle: true,
    fontSize: 16,
    fontFamily: 'Inter',
    textColor: '#ffffff',
    borderRadius: 12,
    backgroundColor: '#1e293b',
    backgroundPattern: 'none',
    backgroundImage: '',
    useGradient: false,
    gradientColors: ['#1e293b', '#334155'],
    gradientDirection: 'to-br',
    backBackgroundColor: '#1e293b',
    backBackgroundPattern: 'none',
    backBackgroundImage: '',
    backUseGradient: false,
    backGradientColors: ['#1e293b', '#334155'],
    backGradientDirection: 'to-br',
    bannerImage: '',
    bannerHeight: 120,
    qrCodeSize: 110,
    qrCodeStyle: 'square',
    positions: defaultPositions,
    backPositions: defaultBackPositions,
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
            backPositions: content.cardConfig.backPositions || defaultBackPositions,
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
      
      // Preserve all existing content and update cardConfig
      const updatedContent = {
        ...currentContent,
        cardConfig: {
          ...currentContent.cardConfig,
          ...cardConfig,
        },
      };
      
      const { error } = await supabase
        .from('digital_cards')
        .update({
          content_json: updatedContent,
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
    if (isLocked) return;
    
    const { active, delta } = event;
    const elementId = active.id as string;
    
    if (cardSide === 'front') {
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
    } else {
      setCardConfig((prev) => ({
        ...prev,
        backPositions: {
          ...prev.backPositions,
          [elementId]: {
            x: prev.backPositions[elementId as keyof typeof prev.backPositions].x + delta.x,
            y: prev.backPositions[elementId as keyof typeof prev.backPositions].y + delta.y,
          },
        },
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-card-bg-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

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

  const getBackgroundStyle = (isBack = false) => {
    const base: React.CSSProperties = {
      width: `${cardConfig.cardWidth}px`,
      height: `${cardConfig.cardHeight}px`,
      borderRadius: `${cardConfig.borderRadius}px`,
      position: 'relative',
      overflow: 'hidden',
    };

    const bgImage = isBack ? cardConfig.backBackgroundImage : cardConfig.backgroundImage;
    const bgColor = isBack ? cardConfig.backBackgroundColor : cardConfig.backgroundColor;
    const bgPattern = isBack ? cardConfig.backBackgroundPattern : cardConfig.backgroundPattern;
    const useGrad = isBack ? cardConfig.backUseGradient : cardConfig.useGradient;
    const gradColors = isBack ? cardConfig.backGradientColors : cardConfig.gradientColors;
    const gradDir = isBack ? cardConfig.backGradientDirection : cardConfig.gradientDirection;

    // Background image takes priority
    if (bgImage) {
      return {
        ...base,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    // Gradient
    if (useGrad && gradColors.length >= 2) {
      const direction = {
        'to-r': 'to right',
        'to-br': 'to bottom right',
        'to-b': 'to bottom',
        'to-bl': 'to bottom left'
      }[gradDir];
      
      return {
        ...base,
        backgroundImage: `linear-gradient(${direction}, ${gradColors.join(', ')})`,
      };
    }

    // Pattern overlay
    const patterns = {
      none: '',
      dots: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      grid: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      waves: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
    };

    return {
      ...base,
      backgroundColor: bgColor,
      backgroundImage: bgPattern !== 'none' ? patterns[bgPattern] : undefined,
      backgroundSize: bgPattern === 'dots' || bgPattern === 'grid' ? '20px 20px' : undefined,
    };
  };

  const renderCardPreview = () => {
    if (!cardData) return null;
    
    const content = cardData.content_json as any;

    if (cardSide === 'back') {
      return (
        <div className="flex items-center justify-center min-h-[500px] bg-muted rounded-lg p-8">
          <DndContext onDragEnd={handleDragEnd}>
            <div style={getBackgroundStyle(true)} className="shadow-2xl">
              {/* QR Code */}
              {cardConfig.showQRCode && (
                <DraggableElement
                  id="qrCode"
                  position={cardConfig.backPositions.qrCode}
                  isSelected={selectedElement === 'qrCode'}
                  onSelect={() => setSelectedElement('qrCode')}
                >
                  <div className={`bg-white p-2 shadow-2xl ${cardConfig.qrCodeStyle === 'rounded' ? 'rounded-2xl' : 'rounded-lg'}`}>
                    <QRCode 
                      value={`${window.location.origin}/${cardData.vanity_url}`} 
                      size={cardConfig.qrCodeSize} 
                      level="M"
                    />
                  </div>
                </DraggableElement>
              )}
            </div>
          </DndContext>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[500px] bg-muted rounded-lg p-8">
        <DndContext onDragEnd={handleDragEnd}>
          <div style={getBackgroundStyle(false)} className="shadow-2xl">
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
                className="font-bold truncate max-w-[200px]"
                style={{ 
                  fontSize: `${cardConfig.fontSize + 4}px`, 
                  fontFamily: cardConfig.fontFamily,
                  color: cardConfig.textColor
                }}
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
                  className="truncate max-w-[200px]"
                  style={{ 
                    fontSize: `${cardConfig.fontSize - 2}px`, 
                    fontFamily: cardConfig.fontFamily,
                    color: cardConfig.textColor,
                    opacity: 0.8
                  }}
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
                  className="truncate max-w-[200px]"
                  style={{ 
                    fontSize: `${cardConfig.fontSize - 4}px`, 
                    fontFamily: cardConfig.fontFamily,
                    color: cardConfig.textColor,
                    opacity: 0.6
                  }}
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
                  className="truncate max-w-[200px]"
                  style={{ 
                    fontSize: `${cardConfig.fontSize - 4}px`, 
                    fontFamily: cardConfig.fontFamily,
                    color: cardConfig.textColor,
                    opacity: 0.9
                  }}
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
                  className="truncate max-w-[200px]"
                  style={{ 
                    fontSize: `${cardConfig.fontSize - 4}px`, 
                    fontFamily: cardConfig.fontFamily,
                    color: cardConfig.textColor,
                    opacity: 0.9
                  }}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Interactive Canvas</h2>
              <div className="flex gap-2">
                <Button
                  variant={cardSide === 'front' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCardSide('front')}
                >
                  Front
                </Button>
                <Button
                  variant={cardSide === 'back' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCardSide('back')}
                >
                  Back
                </Button>
              </div>
            </div>
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
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <Label className="font-medium">Lock Elements</Label>
                    <Switch
                      checked={isLocked}
                      onCheckedChange={setIsLocked}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLocked ? 'Elements are locked and cannot be moved' : 'Elements can be dragged to reposition'}
                  </p>

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Show QR Code {cardSide === 'front' && '(Front)'}</Label>
                      <Switch
                        checked={cardConfig.showQRCode}
                        onCheckedChange={(checked) => setCardConfig({ ...cardConfig, showQRCode: checked })}
                      />
                    </div>

                    {cardSide === 'front' && (
                      <>
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
                      </>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <Card className="p-6 space-y-6">
                  <h3 className="font-semibold text-base border-b pb-2">
                    {cardSide === 'front' ? 'Front Design' : 'Back Design'}
                  </h3>

                  {cardSide === 'front' ? (
                    <>
                      {/* Background Type Selection */}
                      <div>
                        <Label className="mb-3 block">Background Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant={!cardConfig.useGradient && !cardConfig.backgroundImage ? 'default' : 'outline'}
                            onClick={() => setCardConfig({ ...cardConfig, useGradient: false, backgroundImage: '' })}
                            size="sm"
                          >
                            Solid Color
                          </Button>
                          <Button
                            variant={cardConfig.useGradient ? 'default' : 'outline'}
                            onClick={() => setCardConfig({ ...cardConfig, useGradient: true, backgroundImage: '' })}
                            size="sm"
                          >
                            Gradient
                          </Button>
                          <Button
                            variant={cardConfig.backgroundImage ? 'default' : 'outline'}
                            onClick={() => setCardConfig({ ...cardConfig, useGradient: false })}
                            size="sm"
                          >
                            Image
                          </Button>
                        </div>
                      </div>

                      {/* Solid Color */}
                      {!cardConfig.useGradient && !cardConfig.backgroundImage && (
                        <div>
                          <Label>Background Color</Label>
                          <Input
                            type="color"
                            value={cardConfig.backgroundColor}
                            onChange={(e) => setCardConfig({ ...cardConfig, backgroundColor: e.target.value })}
                            className="mt-2 h-12 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Gradient */}
                      {cardConfig.useGradient && !cardConfig.backgroundImage && (
                        <>
                          <div>
                            <Label>Number of Gradient Colors</Label>
                            <div className="flex gap-2 mt-2">
                              {[2, 3, 4].map((num) => (
                                <Button
                                  key={num}
                                  variant={cardConfig.gradientColors.length === num ? 'default' : 'outline'}
                                  onClick={() => {
                                    const newColors = Array(num).fill(0).map((_, i) => 
                                      cardConfig.gradientColors[i] || '#1e293b'
                                    );
                                    setCardConfig({ ...cardConfig, gradientColors: newColors });
                                  }}
                                  size="sm"
                                >
                                  {num} Colors
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {cardConfig.gradientColors.map((color, index) => (
                              <div key={index}>
                                <Label>Color {index + 1}</Label>
                                <Input
                                  type="color"
                                  value={color}
                                  onChange={(e) => {
                                    const newColors = [...cardConfig.gradientColors];
                                    newColors[index] = e.target.value;
                                    setCardConfig({ ...cardConfig, gradientColors: newColors });
                                  }}
                                  className="mt-1 h-12 cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>

                          <div>
                            <Label>Gradient Direction</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {[
                                { value: 'to-r', label: 'Left to Right' },
                                { value: 'to-br', label: 'Diagonal ↘' },
                                { value: 'to-b', label: 'Top to Bottom' },
                                { value: 'to-bl', label: 'Diagonal ↙' }
                              ].map((dir) => (
                                <Button
                                  key={dir.value}
                                  variant={cardConfig.gradientDirection === dir.value ? 'default' : 'outline'}
                                  onClick={() => setCardConfig({ ...cardConfig, gradientDirection: dir.value as any })}
                                  size="sm"
                                >
                                  {dir.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Background Image */}
                      {cardConfig.backgroundImage && (
                        <div>
                          <Label>Background Image</Label>
                          <div className="mt-2 space-y-2">
                            <div className="w-full h-32 rounded-lg border overflow-hidden">
                              <img src={cardConfig.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCardConfig({ ...cardConfig, backgroundImage: '' })}
                            >
                              Remove Image
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {!cardConfig.backgroundImage && (
                        <div>
                          <Label>Upload Background Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="mt-2 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Background Pattern Overlay */}
                      {!cardConfig.backgroundImage && (
                        <div>
                          <Label>Pattern Overlay (Optional)</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {(['none', 'dots', 'grid', 'waves'] as const).map((pattern) => (
                              <Button
                                key={pattern}
                                variant={cardConfig.backgroundPattern === pattern ? 'default' : 'outline'}
                                onClick={() => setCardConfig({ ...cardConfig, backgroundPattern: pattern })}
                                size="sm"
                                className="capitalize"
                              >
                                {pattern}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Back Side Design */}
                      <div>
                        <Label className="mb-3 block">Background Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant={!cardConfig.backUseGradient && !cardConfig.backBackgroundImage ? 'default' : 'outline'}
                            onClick={() => setCardConfig({ ...cardConfig, backUseGradient: false, backBackgroundImage: '' })}
                            size="sm"
                          >
                            Solid Color
                          </Button>
                          <Button
                            variant={cardConfig.backUseGradient ? 'default' : 'outline'}
                            onClick={() => setCardConfig({ ...cardConfig, backUseGradient: true, backBackgroundImage: '' })}
                            size="sm"
                          >
                            Gradient
                          </Button>
                          <Button
                            variant={cardConfig.backBackgroundImage ? 'default' : 'outline'}
                            onClick={() => setCardConfig({ ...cardConfig, backUseGradient: false })}
                            size="sm"
                          >
                            Image
                          </Button>
                        </div>
                      </div>

                      {!cardConfig.backUseGradient && !cardConfig.backBackgroundImage && (
                        <div>
                          <Label>Background Color</Label>
                          <Input
                            type="color"
                            value={cardConfig.backBackgroundColor}
                            onChange={(e) => setCardConfig({ ...cardConfig, backBackgroundColor: e.target.value })}
                            className="mt-2 h-12 cursor-pointer"
                          />
                        </div>
                      )}

                      {cardConfig.backUseGradient && !cardConfig.backBackgroundImage && (
                        <>
                          <div>
                            <Label>Number of Gradient Colors</Label>
                            <div className="flex gap-2 mt-2">
                              {[2, 3, 4].map((num) => (
                                <Button
                                  key={num}
                                  variant={cardConfig.backGradientColors.length === num ? 'default' : 'outline'}
                                  onClick={() => {
                                    const newColors = Array(num).fill(0).map((_, i) => 
                                      cardConfig.backGradientColors[i] || '#1e293b'
                                    );
                                    setCardConfig({ ...cardConfig, backGradientColors: newColors });
                                  }}
                                  size="sm"
                                >
                                  {num} Colors
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {cardConfig.backGradientColors.map((color, index) => (
                              <div key={index}>
                                <Label>Color {index + 1}</Label>
                                <Input
                                  type="color"
                                  value={color}
                                  onChange={(e) => {
                                    const newColors = [...cardConfig.backGradientColors];
                                    newColors[index] = e.target.value;
                                    setCardConfig({ ...cardConfig, backGradientColors: newColors });
                                  }}
                                  className="mt-1 h-12 cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>

                          <div>
                            <Label>Gradient Direction</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {[
                                { value: 'to-r', label: 'Left to Right' },
                                { value: 'to-br', label: 'Diagonal ↘' },
                                { value: 'to-b', label: 'Top to Bottom' },
                                { value: 'to-bl', label: 'Diagonal ↙' }
                              ].map((dir) => (
                                <Button
                                  key={dir.value}
                                  variant={cardConfig.backGradientDirection === dir.value ? 'default' : 'outline'}
                                  onClick={() => setCardConfig({ ...cardConfig, backGradientDirection: dir.value as any })}
                                  size="sm"
                                >
                                  {dir.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {cardConfig.backBackgroundImage && (
                        <div>
                          <Label>Background Image</Label>
                          <div className="mt-2 space-y-2">
                            <div className="w-full h-32 rounded-lg border overflow-hidden">
                              <img src={cardConfig.backBackgroundImage} alt="Background" className="w-full h-full object-cover" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCardConfig({ ...cardConfig, backBackgroundImage: '' })}
                            >
                              Remove Image
                            </Button>
                          </div>
                        </div>
                      )}

                      {!cardConfig.backBackgroundImage && (
                        <div>
                          <Label>Upload Background Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `${user?.id}-card-back-bg-${Date.now()}.${fileExt}`;
                                const filePath = `${user?.id}/${fileName}`;

                                const { error: uploadError } = await supabase.storage
                                  .from('avatars')
                                  .upload(filePath, file);

                                if (uploadError) throw uploadError;

                                const { data: { publicUrl } } = supabase.storage
                                  .from('avatars')
                                  .getPublicUrl(filePath);

                                setCardConfig({ ...cardConfig, backBackgroundImage: publicUrl });
                                
                                toast({
                                  title: 'Success',
                                  description: 'Back background image uploaded!',
                                });
                              } catch (error: any) {
                                toast({
                                  title: 'Error',
                                  description: error.message,
                                  variant: 'destructive',
                                });
                              }
                            }}
                            className="mt-2 cursor-pointer"
                          />
                        </div>
                      )}

                      {!cardConfig.backBackgroundImage && (
                        <div>
                          <Label>Pattern Overlay (Optional)</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {(['none', 'dots', 'grid', 'waves'] as const).map((pattern) => (
                              <Button
                                key={pattern}
                                variant={cardConfig.backBackgroundPattern === pattern ? 'default' : 'outline'}
                                onClick={() => setCardConfig({ ...cardConfig, backBackgroundPattern: pattern })}
                                size="sm"
                                className="capitalize"
                              >
                                {pattern}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>QR Code Size: {cardConfig.qrCodeSize}px</Label>
                        <Slider
                          value={[cardConfig.qrCodeSize]}
                          onValueChange={([value]) => setCardConfig({ ...cardConfig, qrCodeSize: value })}
                          min={80}
                          max={200}
                          step={10}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>QR Code Style</Label>
                        <div className="flex gap-2 mt-2">
                          {(['square', 'rounded'] as const).map((style) => (
                            <Button
                              key={style}
                              variant={cardConfig.qrCodeStyle === style ? 'default' : 'outline'}
                              onClick={() => setCardConfig({ ...cardConfig, qrCodeStyle: style })}
                              className="flex-1 capitalize"
                            >
                              {style}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Common Typography Settings */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-4">Typography</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={cardConfig.textColor}
                          onChange={(e) => setCardConfig({ ...cardConfig, textColor: e.target.value })}
                          className="mt-2 h-12 cursor-pointer"
                        />
                      </div>

                      <div>
                        <Label>Font Family</Label>
                        <select
                          value={cardConfig.fontFamily}
                          onChange={(e) => setCardConfig({ ...cardConfig, fontFamily: e.target.value })}
                          className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Montserrat">Montserrat</option>
                        </select>
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
                    </div>
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
