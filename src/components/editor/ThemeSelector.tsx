import React from 'react';
import { CardData } from './types';
import { cardThemes } from './constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Palette, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ThemeSelectorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ cardData, setCardData }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Design</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Customize your card appearance with templates and themes
                </p>
            </div>

            {/* Template Browse Button */}
            <div className="p-4 border border-border rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold">Choose a Template</h3>
                        <p className="text-sm text-muted-foreground">
                            Browse our gallery of professional templates
                        </p>
                    </div>
                    <Palette className="w-8 h-8 text-primary" />
                </div>
                <Button
                    onClick={() => navigate('/templates')}
                    className="w-full"
                    variant="outline"
                >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Browse Templates
                </Button>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4">
                <h3 className="font-semibold text-sm">Card Theme</h3>
                <div className="grid grid-cols-2 gap-3">
                    {cardThemes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setCardData({ ...cardData, theme: theme.id })}
                            className={`p-4 rounded-lg border-2 transition-all ${cardData.theme === theme.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                        >
                            <div className={`w-full h-20 rounded-md mb-2 ${theme.preview}`}></div>
                            <p className="text-sm font-medium">{theme.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Banner Customization */}
            <div className="space-y-4 p-4 border border-border rounded-lg">
                <h3 className="font-semibold text-sm">Banner Customization</h3>
                <p className="text-xs text-muted-foreground">
                    Customize your card header background
                </p>

                <div className="space-y-3">
                    <Label>Banner Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant={cardData.bannerType === 'gradient' || !cardData.bannerType ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCardData({ ...cardData, bannerType: 'gradient' })}
                        >
                            Gradient
                        </Button>
                        <Button
                            variant={cardData.bannerType === 'color' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCardData({ ...cardData, bannerType: 'color' })}
                        >
                            Color
                        </Button>
                        <Button
                            variant={cardData.bannerType === 'image' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCardData({ ...cardData, bannerType: 'image' })}
                        >
                            Image
                        </Button>
                        <Button
                            variant={cardData.bannerType === 'blurred' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCardData({ ...cardData, bannerType: 'blurred' })}
                        >
                            Blurred
                        </Button>
                        <Button
                            variant={cardData.bannerType === 'pattern' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCardData({ ...cardData, bannerType: 'pattern' })}
                        >
                            Pattern
                        </Button>
                    </div>

                    {cardData.bannerType === 'color' && (
                        <div className="space-y-2">
                            <Label>Pick a Color</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setCardData({ ...cardData, bannerValue: color })}
                                        className={`w-full aspect-square rounded-lg border-2 transition-all ${cardData.bannerValue === color ? 'border-foreground scale-110' : 'border-border'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <Input
                                type="color"
                                value={cardData.bannerValue || '#3b82f6'}
                                onChange={(e) => setCardData({ ...cardData, bannerValue: e.target.value })}
                                className="w-full h-10"
                            />
                        </div>
                    )}

                    {cardData.bannerType === 'image' && (
                        <div className="space-y-2">
                            {cardData.bannerValue && (
                                <div className="relative w-full h-32 rounded-lg border overflow-hidden mb-2">
                                    <img src={cardData.bannerValue} alt="Banner" className="w-full h-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => setCardData({ ...cardData, bannerValue: '' })}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                            <Label>Upload Banner Image</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    try {
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `${user?.id}-banner-${Date.now()}.${fileExt}`;
                                        const filePath = `${user?.id}/${fileName}`;

                                        const { error: uploadError } = await supabase.storage
                                            .from('avatars')
                                            .upload(filePath, file);

                                        if (uploadError) throw uploadError;

                                        const { data: { publicUrl } } = supabase.storage
                                            .from('avatars')
                                            .getPublicUrl(filePath);

                                        setCardData({ ...cardData, bannerValue: publicUrl });

                                        toast({
                                            title: 'Success',
                                            description: 'Banner image uploaded!',
                                        });
                                    } catch (error: any) {
                                        toast({
                                            title: 'Error',
                                            description: error.message,
                                            variant: 'destructive',
                                        });
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload an image for your profile banner
                            </p>
                        </div>
                    )}

                    {cardData.bannerType === 'gradient' && (
                        <div className="space-y-3">
                            <Label>Gradient Colors (2-4 colors)</Label>
                            <div className="flex gap-2 mb-2">
                                {[2, 3, 4].map((num) => (
                                    <Button
                                        key={num}
                                        variant={(cardData.bannerValue?.split(',').length || 2) === num ? 'default' : 'outline'}
                                        onClick={() => {
                                            const colors = Array(num).fill('#3b82f6').map((c, i) => {
                                                const existing = cardData.bannerValue?.split(',')[i];
                                                return existing || c;
                                            });
                                            setCardData({ ...cardData, bannerValue: colors.join(',') });
                                        }}
                                        size="sm"
                                    >
                                        {num} Colors
                                    </Button>
                                ))}
                            </div>
                            {(cardData.bannerValue?.split(',') || ['#3b82f6', '#8b5cf6']).map((color, index) => (
                                <div key={index}>
                                    <Label>Color {index + 1}</Label>
                                    <Input
                                        type="color"
                                        value={color}
                                        onChange={(e) => {
                                            const colors = cardData.bannerValue?.split(',') || ['#3b82f6', '#8b5cf6'];
                                            colors[index] = e.target.value;
                                            setCardData({ ...cardData, bannerValue: colors.join(',') });
                                        }}
                                        className="h-12 cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {cardData.bannerType === 'blurred' && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Your profile photo will be used as a blurred background
                            </p>
                        </div>
                    )}

                    {cardData.bannerType === 'pattern' && (
                        <div className="space-y-2">
                            <Label>Pattern Type</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['dots', 'lines', 'waves', 'grid'].map((pattern) => (
                                    <Button
                                        key={pattern}
                                        variant={cardData.bannerValue === pattern ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCardData({ ...cardData, bannerValue: pattern })}
                                        className="capitalize"
                                    >
                                        {pattern}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom CSS - Hidden for now, can be enabled from developer settings */}
            {false && (
                <div className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Custom CSS (Advanced)</h3>
                        <Badge variant="secondary">Pro</Badge>
                    </div>
                    <div>
                        <Label htmlFor="custom-css">Custom CSS Code</Label>
                        <Textarea
                            id="custom-css"
                            value={cardData.customCSS}
                            onChange={(e) => setCardData({ ...cardData, customCSS: e.target.value })}
                            placeholder=".card { background: linear-gradient(...); }"
                            className="min-h-[120px] font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Add custom CSS to style your card (for advanced users)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
