import React, { useState } from 'react';
import { CardData } from './types';
import { socialPlatforms } from './constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLinksEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ cardData, setCardData }) => {
    // Helper to update a specific link
    const updateLink = (platformName: string, url: string) => {
        const newLinks = cardData.socialLinks.filter(l => l.platform !== platformName);
        if (url) {
            newLinks.push({
                platform: platformName,
                url: url,
                icon: platformName
            });
        }
        setCardData({ ...cardData, socialLinks: newLinks });
    };

    // Helper to remove a link
    const removeLink = (platformName: string) => {
        const newLinks = cardData.socialLinks.filter(l => l.platform !== platformName);
        setCardData({ ...cardData, socialLinks: newLinks });
    };

    // Get currently active platforms
    const activePlatforms = socialPlatforms.filter(p =>
        cardData.socialLinks.some(l => l.platform === p.name)
    );

    // Get available (inactive) platforms
    const availablePlatforms = socialPlatforms.filter(p =>
        !cardData.socialLinks.some(l => l.platform === p.name)
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-2">Social Accounts</h2>
                <p className="text-muted-foreground text-sm">
                    Connect your social media profiles to build trust and grow your audience.
                </p>
            </div>

            {/* Active Links Section */}
            <div className="space-y-4">
                {activePlatforms.length > 0 && (
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Connected Accounts
                    </h3>
                )}

                <div className="space-y-3">
                    {activePlatforms.map((platform) => {
                        const link = cardData.socialLinks.find(l => l.platform === platform.name);
                        return (
                            <div
                                key={platform.name}
                                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-muted rounded-lg text-xl">
                                    {platform.icon}
                                </div>
                                <div className="flex-1">
                                    <Label className="text-xs text-muted-foreground mb-1 block">
                                        {platform.name} URL
                                    </Label>
                                    <Input
                                        value={link?.url || ''}
                                        onChange={(e) => updateLink(platform.name, e.target.value)}
                                        placeholder={`https://${platform.name.toLowerCase()}.com/...`}
                                        className="h-9"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLink(platform.name)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Available Platforms Grid */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Add More Profiles
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availablePlatforms.map((platform) => (
                        <button
                            key={platform.name}
                            onClick={() => updateLink(platform.name, 'https://')}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all duration-200 group"
                        >
                            <div className="text-2xl text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110 duration-200">
                                {platform.icon}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                                {platform.name}
                            </span>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-3 h-3 text-primary" />
                            </div>
                        </button>
                    ))}
                </div>
                {availablePlatforms.length === 0 && (
                    <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground text-sm">
                        🎉 You've connected all available platforms!
                    </div>
                )}
            </div>
        </div>
    );
};
