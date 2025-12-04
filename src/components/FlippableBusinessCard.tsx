import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Globe, Briefcase } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CardData {
    fullName: string;
    jobTitle: string;
    company: string;
    email: string;
    phone: string;
    location: string;
    avatarUrl: string;
    vanityUrl: string;
    socialLinks?: Array<{ platform: string; url: string }>;
    theme?: string;
    bannerType?: 'gradient' | 'color' | 'image' | 'blurred' | 'pattern';
    bannerValue?: string;
}

interface FlippableBusinessCardProps {
    cardData: CardData;
}

export const FlippableBusinessCard: React.FC<FlippableBusinessCardProps> = ({ cardData }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const displayName = cardData.fullName || 'Your Name';
    const displayTitle = cardData.jobTitle || 'Your Title';
    const displayCompany = cardData.company || 'Your Company';
    const profileUrl = `patra.me/${cardData.vanityUrl || 'username'}`;

    return (
        <div
            className="w-full max-w-md mx-auto mb-6 cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div
                className={`relative w-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                    }`}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front of Card */}
                <Card
                    className="absolute w-full backface-hidden overflow-hidden shadow-xl"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Banner */}
                    <div
                        className="relative h-24"
                        style={{
                            ...(cardData.bannerType === 'color' && cardData.bannerValue
                                ? { backgroundColor: cardData.bannerValue }
                                : cardData.bannerType === 'image' && cardData.bannerValue
                                    ? {
                                        backgroundImage: `url(${cardData.bannerValue})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }
                                    : cardData.bannerType === 'blurred' && cardData.avatarUrl
                                        ? {
                                            backgroundImage: `url(${cardData.avatarUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            filter: 'blur(20px)',
                                            transform: 'scale(1.1)'
                                        }
                                        : cardData.bannerType === 'gradient' && cardData.bannerValue
                                            ? (() => {
                                                const [direction, colorsStr] = cardData.bannerValue.includes('|')
                                                    ? cardData.bannerValue.split('|')
                                                    : ['to bottom right', cardData.bannerValue];
                                                const colors = (colorsStr || '').split(',').filter(Boolean);
                                                const validColors = colors.length > 0 ? colors : ['#3b82f6', '#8b5cf6'];
                                                return {
                                                    background: `linear-gradient(${direction}, ${validColors.join(', ')})`
                                                };
                                            })()
                                            : { background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))' })
                        }}
                    />

                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="-mt-12 mb-4">
                            <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
                                <AvatarImage src={cardData.avatarUrl} />
                                <AvatarFallback className="text-2xl bg-secondary">
                                    {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Name and Title */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-card-foreground mb-1">{displayName}</h3>
                            {cardData.jobTitle && (
                                <p className="text-sm text-muted-foreground">
                                    {displayTitle}
                                    {cardData.company && <span className="font-medium"> at {displayCompany}</span>}
                                </p>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm">
                            {cardData.email && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{cardData.email}</span>
                                </div>
                            )}
                            {cardData.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span>{cardData.phone}</span>
                                </div>
                            )}
                            {cardData.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{cardData.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Click to flip hint */}
                        <div className="mt-4 pt-4 border-t text-center">
                            <p className="text-xs text-muted-foreground">Click to see QR code</p>
                        </div>
                    </div>
                </Card>

                {/* Back of Card */}
                <Card
                    className="absolute w-full backface-hidden overflow-hidden shadow-xl rotate-y-180"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                        <h3 className="text-lg font-semibold mb-4 text-center">Scan to View Profile</h3>

                        {/* QR Code */}
                        <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                            <QRCodeSVG
                                value={`https://${profileUrl}`}
                                size={180}
                                level="M"
                                includeMargin={true}
                            />
                        </div>

                        {/* Profile URL */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Profile URL</p>
                            <p className="text-sm font-mono font-semibold text-primary">{profileUrl}</p>
                        </div>

                        {/* Click to flip hint */}
                        <div className="mt-4 pt-4 border-t w-full text-center">
                            <p className="text-xs text-muted-foreground">Click to flip back</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
