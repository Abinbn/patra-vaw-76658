import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone, 
  Calendar, 
  ExternalLink,
  Heart,
  Globe,
  MessageCircle,
  Check,
  Wallet,
  QrCode,
  Smartphone,
  Award,
  ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaInstagram, 
  FaFacebook, 
  FaYoutube,
  FaTiktok,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaSpotify,
  FaTwitch,
  FaDiscord,
  FaSlack,
  FaTelegram,
  FaWhatsapp
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Icon } from '@iconify/react';
import { AddressMapDisplay } from '@/components/AddressMapDisplay';

interface CardData {
  fullName: string;
  about: string;
  location: string;
  pronunciation: string;
  pronoun: string;
  languages: string[];
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  contactForm: string;
  calendar: string;
  socialLinks: Array<{ platform: string; url: string; icon: string | React.ReactElement }>;
  paymentLinks: Array<{ platform: string; url: string; icon: string | React.ReactElement }>;
  customLinks: Array<{ title: string; url: string; description?: string; previewImage?: string; groupId?: string }>;
  linkGroups?: Array<{ id: string; name: string }>;
  interests: string[];
  avatarUrl: string;
  vanityUrl: string;
  upiId?: string;
  aiEnabled?: boolean;
  achievements?: Array<{ title: string; issuer: string; date: string; url?: string }>;
  testimonials?: Array<{ name: string; role: string; content: string; avatar?: string; socialUrl?: string }>;
  photos?: Array<{ url: string; caption?: string }>;
  videoIntro?: string;
  cardOrder?: string[];
  cardVisibility?: {
    contact: boolean;
    verified: boolean;
    links: boolean;
    achievements: boolean;
    testimonials: boolean;
    interests: boolean;
    gallery: boolean;
    languages: boolean;
    location: boolean;
  };
  address?: string;
  showAddressMap?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  theme?: string;
  customCSS?: string;
  bannerType?: 'gradient' | 'color' | 'image' | 'blurred' | 'pattern';
  bannerValue?: string;
}

interface CardPreviewNewProps {
  cardData: CardData;
  onOpenPayment?: () => void;
  showAIButton?: boolean;
}

// Social icon mapping
const getSocialIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  const iconProps = { className: "w-5 h-5" };
  
  if (platformLower.includes('github')) return <FaGithub {...iconProps} />;
  if (platformLower.includes('linkedin')) return <FaLinkedin {...iconProps} />;
  if (platformLower.includes('twitter') || platformLower.includes('x.com')) return <FaXTwitter {...iconProps} />;
  if (platformLower.includes('instagram')) return <FaInstagram {...iconProps} />;
  if (platformLower.includes('facebook')) return <FaFacebook {...iconProps} />;
  if (platformLower.includes('youtube')) return <FaYoutube {...iconProps} />;
  if (platformLower.includes('tiktok')) return <FaTiktok {...iconProps} />;
  if (platformLower.includes('dribbble')) return <FaDribbble {...iconProps} />;
  if (platformLower.includes('behance')) return <FaBehance {...iconProps} />;
  if (platformLower.includes('medium')) return <FaMedium {...iconProps} />;
  if (platformLower.includes('spotify')) return <FaSpotify {...iconProps} />;
  if (platformLower.includes('twitch')) return <FaTwitch {...iconProps} />;
  if (platformLower.includes('discord')) return <FaDiscord {...iconProps} />;
  if (platformLower.includes('slack')) return <FaSlack {...iconProps} />;
  if (platformLower.includes('telegram')) return <FaTelegram {...iconProps} />;
  if (platformLower.includes('whatsapp')) return <FaWhatsapp {...iconProps} />;
  
  return <Globe {...iconProps} />;
};

import {
  ContactSection,
  VerifiedSection,
  LinksSection,
  AchievementsSection,
  TestimonialsSection,
  InterestsSection,
  GallerySection,
  LanguagesSection,
  LocationSection
} from './card-sections';

export const CardPreviewNew: React.FC<CardPreviewNewProps> = ({ cardData, onOpenPayment, showAIButton = false }) => {
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showUPIQR, setShowUPIQR] = useState(false);
  const { toast } = useToast();

  // Generate UPI payment link
  const generateUPILink = (upiId: string, name: string) => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: name,
      cu: 'INR',
      tn: 'Payment via Patra'
    });
    return `upi://pay?${params.toString()}`;
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(cardData.upiId!);
    toast({
      title: "UPI ID Copied",
      description: "UPI ID has been copied to clipboard",
    });
  };

  const handlePayNow = () => {
    if (cardData.upiId) {
      window.location.href = generateUPILink(cardData.upiId, cardData.fullName || 'User');
    }
  };

  const displayName = cardData.fullName || 'Your Name';
  const displayTitle = cardData.jobTitle || 'Your Title';
  const displayCompany = cardData.company || 'Your Company';

  // Truncate about text
  const aboutText = cardData.about || '';
  const shouldTruncate = aboutText.length > 250;
  const displayAbout = showFullAbout || !shouldTruncate 
    ? aboutText 
    : aboutText.slice(0, 250) + '...';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
      {/* Custom CSS Injection */}
      {cardData.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: cardData.customCSS }} />
      )}
      
      {/* Main Profile Card */}
      <Card className="overflow-hidden card-container">
        {/* Header Banner - Dynamic based on banner settings */}
        <div 
          className="relative h-32"
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
              : cardData.bannerType === 'pattern' && cardData.bannerValue === 'dots'
              ? {
                  background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }
              : cardData.bannerType === 'pattern' && cardData.bannerValue === 'lines'
              ? {
                  background: 'repeating-linear-gradient(45deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.1) 10px, transparent 10px, transparent 20px)'
                }
              : cardData.bannerType === 'pattern' && cardData.bannerValue === 'waves'
              ? {
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2) 25%, transparent 25%), linear-gradient(225deg, hsl(var(--primary) / 0.2) 25%, transparent 25%)',
                  backgroundSize: '40px 40px'
                }
              : cardData.bannerType === 'pattern' && cardData.bannerValue === 'grid'
              ? {
                  background: 'linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }
              : cardData.bannerType === 'gradient' && cardData.bannerValue
              ? { 
                  background: `linear-gradient(to bottom right, ${(cardData.bannerValue.split(',') || ['#3b82f6', '#8b5cf6']).join(', ')})` 
                }
              : cardData.bannerType === 'gradient'
              ? { background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))' }
              : { backgroundColor: 'hsl(var(--muted))' })
          }}
        ></div>
        
        <div className="px-6 pb-6">
          {/* Avatar overlapping header - with QR flip */}
          <div className="-mt-16 mb-4">
            <div 
              className="relative w-28 h-28 cursor-pointer perspective-1000"
              onClick={() => setShowQR(!showQR)}
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${showQR ? 'rotate-y-180' : ''}`}>
                {/* Front - Avatar */}
                <Avatar className="absolute w-full h-full border-4 border-card shadow-lg backface-hidden">
                  <AvatarImage src={cardData.avatarUrl} />
                  <AvatarFallback className="text-3xl bg-secondary">
                    {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Back - QR Code */}
                <div className="absolute w-full h-full border-4 border-card shadow-lg rounded-full bg-white flex items-center justify-center backface-hidden rotate-y-180 p-2">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs text-center">QR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name and basic info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-1">{displayName}</h2>
            
            {cardData.jobTitle && (
              <p className="text-base text-muted-foreground mb-2">
                {displayTitle}
                {cardData.company && <span className="font-medium"> at {displayCompany}</span>}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {cardData.pronoun && (
                <span className="text-foreground/70">{cardData.pronoun}</span>
              )}
            </div>
          </div>

          {/* Social Links - Inline icons */}
          {cardData.socialLinks.length > 0 && (
            <div className="flex items-center gap-2 mb-6 pb-6 border-b">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground mr-2">—</span>
              <div className="flex gap-3">
                {cardData.socialLinks.slice(0, 6).map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {aboutText && (
            <div className="mb-6">
              <p className="text-sm text-card-foreground leading-relaxed">
                {displayAbout}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setShowFullAbout(!showFullAbout)}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  {showFullAbout ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="h-9"
              onClick={() => setShowPaymentDialog(true)}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Send money
            </Button>
          </div>
        </div>
      </Card>

      {/* Dynamic Card Sections Based on Order and Visibility */}
      {(() => {
        const defaultOrder = ['contact', 'verified', 'links', 'achievements', 'testimonials', 'interests', 'gallery', 'languages'];
        const defaultVisibility = {
          contact: true,
          verified: true,
          links: true,
          achievements: true,
          testimonials: true,
          interests: true,
          gallery: true,
          languages: true,
          location: true,
        };
        
        const order = cardData.cardOrder || defaultOrder;
        const visibility = cardData.cardVisibility || defaultVisibility;

        // Check if sections have content
        const hasContent = (sectionId: string) => {
          switch (sectionId) {
            case 'contact':
              return cardData.email || cardData.phone || cardData.contactForm || cardData.calendar;
            case 'verified':
              return cardData.socialLinks && cardData.socialLinks.length > 0;
            case 'links':
              return cardData.customLinks && cardData.customLinks.length > 0;
            case 'achievements':
              return cardData.achievements && cardData.achievements.length > 0;
            case 'testimonials':
              return cardData.testimonials && cardData.testimonials.length > 0;
            case 'interests':
              return cardData.interests && cardData.interests.length > 0;
            case 'gallery':
              return cardData.photos && cardData.photos.length > 0;
            case 'languages':
              return cardData.languages && cardData.languages.length > 0;
            case 'location':
              return cardData.address || (cardData.latitude && cardData.longitude);
            default:
              return false;
          }
        };

        const sectionMap: Record<string, React.ReactNode> = {
          contact: visibility.contact && <ContactSection key="contact" cardData={cardData} showAIButton={showAIButton} getSocialIcon={getSocialIcon} />,
          verified: visibility.verified && <VerifiedSection key="verified" cardData={cardData} getSocialIcon={getSocialIcon} />,
          links: visibility.links && <LinksSection key="links" cardData={cardData} getSocialIcon={getSocialIcon} />,
          achievements: visibility.achievements && <AchievementsSection key="achievements" cardData={cardData} getSocialIcon={getSocialIcon} />,
          testimonials: visibility.testimonials && <TestimonialsSection key="testimonials" cardData={cardData} getSocialIcon={getSocialIcon} />,
          interests: visibility.interests && <InterestsSection key="interests" cardData={cardData} getSocialIcon={getSocialIcon} />,
          gallery: visibility.gallery && <GallerySection key="gallery" cardData={cardData} getSocialIcon={getSocialIcon} />,
          languages: visibility.languages && <LanguagesSection key="languages" cardData={cardData} getSocialIcon={getSocialIcon} />,
          location: visibility.location && <LocationSection key="location" cardData={cardData} getSocialIcon={getSocialIcon} />,
        };

        // Separate filled and empty sections
        const filledSections = order.filter(sectionId => hasContent(sectionId) && sectionMap[sectionId]);
        const emptySections = order.filter(sectionId => !hasContent(sectionId) && visibility[sectionId as keyof typeof visibility]);

        return (
          <>
            {/* Render filled sections */}
            {filledSections.map(sectionId => sectionMap[sectionId])}
            
            {/* Note: Empty sections "Add More Information" removed - only show in editor */}
          </>
        );
      })()}


      {/* Fallback for old structure - Contact Information Card (only show if cardOrder is not set) */}
      {(!cardData.cardOrder || !Array.isArray(cardData.cardOrder) || cardData.cardOrder.length === 0) && (cardData.email || cardData.phone || cardData.contactForm || cardData.calendar || (showAIButton && cardData.aiEnabled)) && (
        <Card className="p-6">
          <h3 className="font-semibold text-base mb-4">Contact Information</h3>
          <div className="space-y-3">
            {cardData.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${cardData.email}`} className="text-sm text-primary hover:underline">
                  {cardData.email}
                </a>
              </div>
            )}
            {cardData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${cardData.phone}`} className="text-sm text-primary hover:underline">
                  {cardData.phone}
                </a>
              </div>
            )}
            {cardData.contactForm && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a href={cardData.contactForm} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                  {cardData.contactForm}
                </a>
              </div>
            )}
            {cardData.calendar && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <a href={cardData.calendar} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  Book a meeting
                </a>
              </div>
            )}
            {showAIButton && cardData.aiEnabled && cardData.vanityUrl && (
              

<Button 
  variant="outline" 
  size="sm" 
  className="w-full mt-3 relative group border border-violet-400/40 bg-transparent hover:bg-blue-600 hover:border-blue-500 transition-all duration-300"
  onClick={() => window.location.href = `/${cardData.vanityUrl}/ai`}
>
  {/* Simple fading sparkles */}
  <Icon 
    icon="proicons:sparkle-2" 
    className="absolute top-1.5 left-6 w-2.5 h-2.5 text-violet-400 animate-sparkle-fade-1"
  />
  <Icon 
    icon="proicons:sparkle-2" 
    className="absolute top-1.5 right-6 w-3 h-3 text-fuchsia-400 animate-sparkle-fade-2"
  />
  <Icon 
    icon="proicons:sparkle-2" 
    className="absolute bottom-1.5 left-1/3 w-2.5 h-2.5 text-purple-400 animate-sparkle-fade-3"
  />
  <MessageCircle className="w-4 h-4 mr-2 relative z-10 group-hover:text-white transition-colors duration-300" />
  <span className="relative z-10 font-medium group-hover:text-white transition-colors duration-300">
    Chat with mini me - AI
  </span>
</Button>

          
            )}
          </div>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Send Money to {cardData.fullName || 'User'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* UPI ID Section */}
            {cardData.upiId && (
              <div className="space-y-3">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Label className="text-xs text-muted-foreground mb-2 block">UPI ID</Label>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono font-semibold">{cardData.upiId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyUPI}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* QR and Pay Now Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUPIQR(!showUPIQR)}
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {showUPIQR ? 'Hide QR' : 'Show QR'}
                  </Button>
                  
                  <Button 
                    variant="default"
                    onClick={handlePayNow}
                    className="w-full"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Pay Now
                  </Button>
                </div>

                {/* UPI QR Code Display */}
                {showUPIQR && (
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <QRCodeSVG 
                      value={generateUPILink(cardData.upiId, cardData.fullName || 'User')}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Other Payment Links */}
            {cardData.paymentLinks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Other Payment Links</h4>
                <div className="space-y-2">
                  {cardData.paymentLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        {getSocialIcon(link.platform)}
                        <span className="text-sm font-medium">{link.platform}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!cardData.upiId && cardData.paymentLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No payment methods available
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
