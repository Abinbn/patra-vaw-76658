import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, Phone, Globe, Calendar, MessageCircle, 
  Check, ExternalLink, Award, Heart, ImageIcon, MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface CardData {
  fullName: string;
  email: string;
  phone: string;
  contactForm: string;
  calendar: string;
  aiEnabled?: boolean;
  vanityUrl: string;
  socialLinks: Array<{ platform: string; url: string }>;
  customLinks: Array<{ title: string; url: string; description?: string; previewImage?: string; groupId?: string }>;
  linkGroups?: Array<{ id: string; name: string }>;
  achievements?: Array<{ title: string; issuer: string; date: string; url?: string }>;
  testimonials?: Array<{ name: string; role: string; content: string; avatar?: string; socialUrl?: string }>;
  interests: string[];
  photos?: Array<{ url: string; caption?: string }>;
  videoIntro?: string;
  languages: string[];
  address?: string;
  showAddressMap?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface SectionProps {
  cardData: CardData;
  showAIButton?: boolean;
  getSocialIcon: (platform: string) => React.ReactNode;
}

export const ContactSection: React.FC<SectionProps> = ({ cardData, showAIButton, getSocialIcon }) => {
  if (!cardData.email && !cardData.phone && !cardData.contactForm && !cardData.calendar && !(showAIButton && cardData.aiEnabled)) {
    return null;
  }

  return (
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
              Chat with me - AI
            </span>
          </Button>
        )}
      </div>
    </Card>
  );
};

export const VerifiedSection: React.FC<SectionProps> = ({ cardData, getSocialIcon }) => {
  if (!cardData.socialLinks.length) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-base mb-4">Verified Accounts</h3>
      <div className="space-y-4">
        {cardData.socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group hover:bg-accent/50 p-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="mt-0.5">
              {getSocialIcon(link.platform)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm">{link.platform}</span>
                <Check className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-primary truncate">{link.url}</p>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
};

export const LinksSection: React.FC<SectionProps> = ({ cardData }) => {
  if (!cardData.customLinks.length) return null;

  const linkGroups = cardData.linkGroups || [];
  const groupedLinks = cardData.customLinks.filter(link => link.groupId);
  const ungroupedLinks = cardData.customLinks.filter(link => !link.groupId);

  const renderLinkCard = (link: any, index: number) => (
    <a
      key={index}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
    >
      {link.previewImage && (
        <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
          <img 
            src={link.previewImage} 
            alt={link.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{link.title}</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
        {link.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{link.description}</p>
        )}
      </div>
    </a>
  );

  return (
    <>
      {ungroupedLinks.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-base mb-4">Links</h3>
          <div className="space-y-3">
            {ungroupedLinks.map(renderLinkCard)}
          </div>
        </Card>
      )}

      {linkGroups.map(group => {
        const groupLinks = cardData.customLinks.filter(link => link.groupId === group.id);
        if (!groupLinks.length) return null;

        return (
          <Card key={group.id} className="p-6">
            <h3 className="font-semibold text-base mb-4">{group.name}</h3>
            <div className="space-y-3">
              {groupLinks.map((link, index) => renderLinkCard(link, index))}
            </div>
          </Card>
        );
      })}
    </>
  );
};

export const AchievementsSection: React.FC<SectionProps> = ({ cardData }) => {
  if (!cardData.achievements || !cardData.achievements.length) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-primary" />
        Achievements
      </h3>
      <div className="space-y-4">
        {cardData.achievements.map((achievement, index) => (
          <div key={index} className="flex items-start gap-3">
            <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{achievement.title}</h4>
              <p className="text-xs text-muted-foreground">
                {achievement.issuer} • {achievement.date}
              </p>
              {achievement.url && (
                <a 
                  href={achievement.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  View credential <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const TestimonialsSection: React.FC<SectionProps> = ({ cardData }) => {
  if (!cardData.testimonials || !cardData.testimonials.length) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        Testimonials
      </h3>
      <div className="space-y-4">
        {cardData.testimonials.map((testimonial, index) => (
          <div key={index} className="p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={testimonial.avatar} />
                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{testimonial.name}</h4>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-2">"{testimonial.content}"</p>
            {testimonial.socialUrl && (
              <a 
                href={testimonial.socialUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View profile <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export const InterestsSection: React.FC<SectionProps> = ({ cardData }) => {
  if (!cardData.interests.length) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
        <Heart className="w-4 h-4 text-primary" />
        Interests
      </h3>
      <div className="flex flex-wrap gap-2">
        {cardData.interests.map((interest, index) => (
          <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
            {interest}
          </Badge>
        ))}
      </div>
    </Card>
  );
};

export const GallerySection: React.FC<SectionProps> = ({ cardData }) => {
  if (!cardData.photos?.length && !cardData.videoIntro) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        Gallery
      </h3>
      <div className="space-y-4">
        {cardData.videoIntro && (
          <div className="rounded-lg overflow-hidden bg-black aspect-video">
            <video 
              src={cardData.videoIntro} 
              controls 
              className="w-full h-full"
              preload="metadata"
            />
          </div>
        )}
        
        {cardData.photos && cardData.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {cardData.photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                <img 
                  src={photo.url} 
                  alt={photo.caption || `Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 text-xs text-white">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export const LanguagesSection: React.FC<SectionProps> = ({ cardData }) => {
  if (!cardData.languages.length) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-base mb-4">Languages</h3>
      <div className="flex flex-wrap gap-2">
        {cardData.languages.map((language, index) => (
          <Badge key={index} variant="outline" className="text-sm py-1 px-3">
            {language}
          </Badge>
        ))}
      </div>
    </Card>
  );
};

export const LocationSection: React.FC<SectionProps> = ({ cardData }) => {
  if (!cardData.address && !cardData.latitude && !cardData.longitude) return null;

  // Use coordinates if available, otherwise encode address
  const hasCoordinates = cardData.latitude !== null && cardData.latitude !== undefined && 
                       cardData.longitude !== null && cardData.longitude !== undefined;
  
  const mapEmbedUrl = hasCoordinates
    ? `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${cardData.latitude},${cardData.longitude}&zoom=15`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(cardData.address || '')}`;
  
  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${cardData.latitude},${cardData.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cardData.address || '')}`;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        Location
      </h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {cardData.address && <p className="text-sm text-muted-foreground break-words mb-2">{cardData.address}</p>}
            {hasCoordinates && (
              <p className="text-xs text-muted-foreground mb-2">
                Coordinates: {cardData.latitude}, {cardData.longitude}
              </p>
            )}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-block"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>

        {cardData.showAddressMap && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border/50">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          </div>
        )}
      </div>
    </Card>
  );
};
