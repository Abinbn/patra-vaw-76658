import React, { useState } from 'react';
import { Mail, Phone, Nfc } from 'lucide-react';
import QRCode from 'react-qr-code';

interface CardData {
    fullName: string;
    jobTitle: string;
    company: string;
    email: string;
    phone: string;
    avatarUrl: string;
    vanityUrl: string;
    cardConfig?: any;
    bannerType?: 'gradient' | 'color' | 'image' | 'blurred' | 'pattern';
    bannerValue?: string;
}

interface BusinessCard3DProps {
    cardData: CardData;
    autoFlip?: boolean;
    showControls?: boolean;
    scale?: number;
}

export const BusinessCard3D: React.FC<BusinessCard3DProps> = ({
    cardData,
    autoFlip = false,
    showControls = false,
    scale = 1
}) => {
    const [flipped, setFlipped] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Helper function to generate card background styles from cardConfig
    const getCardBackgroundStyle = (config: any, isBack = false) => {
        const base: React.CSSProperties = {
            borderRadius: `${config?.borderRadius || 12}px`,
        };

        const bgImage = isBack ? config?.backBackgroundImage : config?.backgroundImage;
        const bgColor = isBack ? config?.backBackgroundColor : config?.backgroundColor;
        const bgPattern = isBack ? config?.backBackgroundPattern : config?.backgroundPattern;
        const useGrad = isBack ? config?.backUseGradient : config?.useGradient;
        const gradColors = isBack ? config?.backGradientColors : config?.gradientColors;
        const gradDir = isBack ? config?.backGradientDirection : config?.gradientDirection;

        // Priority: Image > Gradient > Solid Color + Pattern
        if (bgImage) {
            return {
                ...base,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            };
        }

        if (useGrad && gradColors?.length >= 2) {
            const direction = {
                'to-r': 'to right',
                'to-br': 'to bottom right',
                'to-b': 'to bottom',
                'to-bl': 'to bottom left'
            }[gradDir] || 'to bottom right';

            return {
                ...base,
                backgroundImage: `linear-gradient(${direction}, ${gradColors.join(', ')})`,
            };
        }

        const patterns: Record<string, string> = {
            none: '',
            dots: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            grid: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            waves: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
        };

        return {
            ...base,
            backgroundColor: bgColor || '#1e293b',
            backgroundImage: bgPattern && bgPattern !== 'none' ? patterns[bgPattern] : undefined,
            backgroundSize: bgPattern === 'dots' || bgPattern === 'grid' ? '20px 20px' : undefined,
        };
    };

    const cardUrl = `${window.location.origin}/${cardData.vanityUrl}`;
    const cardWidth = (cardData.cardConfig?.cardWidth || 400) * scale;
    const cardHeight = (cardData.cardConfig?.cardHeight || 250) * scale;

    return (
        <div className="w-full flex justify-center">
            <div className="perspective-card" style={{ perspective: '2000px' }}>
                <div
                    className={`card-container ${flipped ? 'flipped' : ''}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setFlipped(!flipped)}
                    style={{
                        width: `${cardWidth}px`,
                        height: `${cardHeight}px`,
                        transform: isHovered && !flipped
                            ? 'translateY(-8px) rotateX(2deg) rotateY(-2deg)'
                            : isHovered && flipped
                                ? 'translateY(-8px) rotateX(2deg) rotateY(182deg)'
                                : flipped
                                    ? 'rotateY(180deg)'
                                    : 'rotateY(0deg)',
                        transition: 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        transformStyle: 'preserve-3d',
                        cursor: 'pointer',
                    }}
                >
                    {/* Front Side */}
                    <div className="card-face card-front" style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '12px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                        transform: 'rotateY(0deg)',
                    }}>
                        <div
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={getCardBackgroundStyle(cardData.cardConfig, false)}
                        >
                            {/* Subtle texture overlay */}
                            <div className="absolute inset-0 opacity-5" style={{
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")'
                            }}></div>

                            {/* Logo top left */}
                            <div className="absolute top-4 left-4 text-white/90 text-xs font-semibold tracking-wide">
                                Patra
                            </div>

                            {/* NFC Icon top right */}
                            <div className="absolute top-4 right-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <Nfc className="w-4 h-4 text-white/80" />
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="relative h-full p-6" style={{ position: 'relative' }}>
                                {(() => {
                                    const config = cardData.cardConfig || {};
                                    const positions = config.positions || {
                                        avatar: { x: 20, y: 60 },
                                        name: { x: 140, y: 60 },
                                        jobTitle: { x: 140, y: 90 },
                                        company: { x: 140, y: 115 },
                                        email: { x: 140, y: 150 },
                                        phone: { x: 140, y: 175 },
                                    };

                                    return (
                                        <>
                                            {/* Avatar */}
                                            {cardData.avatarUrl && (
                                                <div style={{ position: 'absolute', left: `${(positions.avatar?.x || 20) * scale}px`, top: `${(positions.avatar?.y || 60) * scale}px` }}>
                                                    <img
                                                        src={cardData.avatarUrl}
                                                        alt={cardData.fullName}
                                                        className="rounded-lg object-cover border-2 border-white/20 shadow-xl"
                                                        style={{ width: `${(config.avatarSize || 96) * scale}px`, height: `${(config.avatarSize || 96) * scale}px` }}
                                                    />
                                                </div>
                                            )}

                                            {/* Name */}
                                            <div style={{ position: 'absolute', left: `${(positions.name?.x || 140) * scale}px`, top: `${(positions.name?.y || 60) * scale}px` }}>
                                                <h2 className="font-bold" style={{
                                                    fontSize: `${((config.fontSize || 16) + 4) * scale}px`,
                                                    color: config.textColor || '#ffffff',
                                                    fontFamily: config.fontFamily || 'Inter'
                                                }}>
                                                    {cardData.fullName}
                                                </h2>
                                            </div>

                                            {/* Job Title */}
                                            {cardData.jobTitle && (config.showJobTitle !== false) && (
                                                <div style={{ position: 'absolute', left: `${(positions.jobTitle?.x || 140) * scale}px`, top: `${(positions.jobTitle?.y || 90) * scale}px` }}>
                                                    <p style={{
                                                        fontSize: `${((config.fontSize || 16) - 2) * scale}px`,
                                                        color: config.textColor || '#ffffff',
                                                        fontFamily: config.fontFamily || 'Inter',
                                                        opacity: 0.8
                                                    }}>
                                                        {cardData.jobTitle}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Company */}
                                            {cardData.company && (config.showCompany !== false) && (
                                                <div style={{ position: 'absolute', left: `${(positions.company?.x || 140) * scale}px`, top: `${(positions.company?.y || 115) * scale}px` }}>
                                                    <p style={{
                                                        fontSize: `${((config.fontSize || 16) - 4) * scale}px`,
                                                        color: config.textColor || '#ffffff',
                                                        fontFamily: config.fontFamily || 'Inter',
                                                        opacity: 0.6
                                                    }}>
                                                        {cardData.company}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Email */}
                                            {cardData.email && (config.showEmail !== false) && (
                                                <div style={{ position: 'absolute', left: `${(positions.email?.x || 140) * scale}px`, top: `${(positions.email?.y || 150) * scale}px` }} className="flex items-center gap-2">
                                                    <Mail className="flex-shrink-0" style={{ width: `${3 * scale}px`, height: `${3 * scale}px`, color: config.textColor || '#ffffff', opacity: 0.9 }} />
                                                    <span style={{
                                                        fontSize: `${((config.fontSize || 16) - 4) * scale}px`,
                                                        color: config.textColor || '#ffffff',
                                                        fontFamily: config.fontFamily || 'Inter',
                                                        opacity: 0.9
                                                    }}>{cardData.email}</span>
                                                </div>
                                            )}

                                            {/* Phone */}
                                            {cardData.phone && (config.showPhone !== false) && (
                                                <div style={{ position: 'absolute', left: `${(positions.phone?.x || 140) * scale}px`, top: `${(positions.phone?.y || 175) * scale}px` }} className="flex items-center gap-2">
                                                    <Phone className="flex-shrink-0" style={{ width: `${3 * scale}px`, height: `${3 * scale}px`, color: config.textColor || '#ffffff', opacity: 0.9 }} />
                                                    <span style={{
                                                        fontSize: `${((config.fontSize || 16) - 4) * scale}px`,
                                                        color: config.textColor || '#ffffff',
                                                        fontFamily: config.fontFamily || 'Inter',
                                                        opacity: 0.9
                                                    }}>{cardData.phone}</span>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Back Side */}
                    <div className="card-face card-back" style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '12px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                        transform: 'rotateY(180deg)',
                    }}>
                        <div
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={getCardBackgroundStyle(cardData.cardConfig, true)}
                        >
                            {/* Subtle texture overlay */}
                            <div className="absolute inset-0 opacity-5" style={{
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")'
                            }}></div>

                            {/* Logo top left */}
                            <div className="absolute top-4 left-4 text-white/90 text-xs font-semibold tracking-wide">
                                Patra
                            </div>

                            {/* QR Code with saved position */}
                            <div className="relative h-full flex flex-col items-center justify-center p-6">
                                {(() => {
                                    const qrPos = cardData.cardConfig?.backPositions?.qrCode || { x: 0, y: 0 };
                                    const qrSize = (cardData.cardConfig?.qrCodeSize || 110) * scale;
                                    const qrStyle = cardData.cardConfig?.qrCodeStyle || 'square';

                                    return (
                                        <div style={{
                                            position: qrPos.x !== 0 || qrPos.y !== 0 ? 'absolute' : 'relative',
                                            left: qrPos.x !== 0 ? `${qrPos.x * scale}px` : undefined,
                                            top: qrPos.y !== 0 ? `${qrPos.y * scale}px` : undefined,
                                        }}>
                                            <div className={`bg-white shadow-2xl ${qrStyle === 'rounded' ? 'rounded-2xl' : 'rounded-lg'}`} style={{ padding: `${4 * scale}px` }}>
                                                <QRCode
                                                    value={cardUrl}
                                                    size={qrSize}
                                                    level="M"
                                                    fgColor="#000000"
                                                    bgColor="#ffffff"
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Username */}
                                <p className="mt-4 text-white/30 font-mono tracking-wider" style={{
                                    fontSize: `${0.75 * scale}rem`,
                                    textShadow: '0 0 10px rgba(255,255,255,0.1)',
                                    letterSpacing: '0.15em'
                                }}>
                                    {cardData.vanityUrl}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Click hint */}
            {showControls && (
                <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        Click the card to flip
                    </p>
                </div>
            )}
        </div>
    );
};
