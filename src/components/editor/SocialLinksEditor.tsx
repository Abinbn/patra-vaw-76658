import React from 'react';
import { CardData } from './types';
import { socialPlatforms } from './constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SocialLinksEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ cardData, setCardData }) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Social Accounts</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Connect your social media profiles
                </p>
            </div>

            <div className="space-y-5">
                {socialPlatforms.map((platform) => {
                    const existingLink = cardData.socialLinks.find(
                        (l) => l.platform === platform.name
                    );
                    return (
                        <div
                            key={platform.name}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 hover:bg-gray-100 p-3 rounded-xl shadow-sm transition-all"
                        >
                            {/* Label with Icon */}
                            <Label className={`flex items-center gap-2 text-gray-700 font-medium transition-colors hover:text-${platform.name.toLowerCase()}`}>
                                <span className="text-xl">{platform.icon}</span>
                                <span>{platform.name}</span>
                            </Label>

                            {/* Input Box */}
                            <Input
                                value={existingLink?.url || ""}
                                onChange={(e) => {
                                    const newLinks = cardData.socialLinks.filter(
                                        (l) => l.platform !== platform.name
                                    );
                                    if (e.target.value) {
                                        newLinks.push({
                                            platform: platform.name,
                                            url: e.target.value,
                                            icon: platform.name, // Note: storing string name as icon for now, as in original code logic it seemed to be mixed or just name. 
                                            // In original code: icon: platform.name
                                        });
                                    }
                                    setCardData({ ...cardData, socialLinks: newLinks });
                                }}
                                placeholder={`Enter your ${platform.name} URL`}
                                className="w-full sm:w-2/3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 transition"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
