import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CardPreviewNew } from '@/components/card-preview-new';
import { MyCard } from './mycard';
import NotFound from './NotFound';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, CreditCard, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateOGMetaTags, getCardImageUrl, generateShareText, shareProfile } from '@/lib/og-utils';
import { AddressMapDisplay } from '@/components/AddressMapDisplay';
import { downloadVCard } from '@/lib/vcard-utils';

interface CardData {
  fullName: string;
  about: string;
  location: string;
  pronunciation: string;
  pronoun: string;
  audioPronunciation?: string;
  languages: string[];
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  contactForm: string;
  calendar: string;
  socialLinks: any[];
  paymentLinks: any[];
  upiId?: string;
  customLinks: any[];
  linkGroups?: any[];
  interests: string[];
  achievements?: any[];
  testimonials?: any[];
  photos?: any[];
  videoIntro?: string;
  videoTestimonials?: any[];
  videoSnippets?: any[];
  avatarUrl: string;
  vanityUrl: string;
  aiEnabled?: boolean;
  theme?: string;
  customCSS?: string;
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
}

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [ogDescription, setOgDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const isCardView = searchParams.get('card') !== null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch card by vanity_url with profile info
        const { data: card, error } = await supabase
          .from('digital_cards')
          .select(`
            *,
            profiles:owner_user_id (
              ai_enabled,
              address,
              show_address_map,
              location_coordinates
            )
          `)
          .eq('vanity_url', username)
          .eq('is_active', true)
          .eq('is_approved', true)
          .single();

        if (error || !card) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCardId(card.id);
        setOgDescription(card.og_description);

        // Generate OG description if it doesn't exist or is older than 30 days
        const needsNewDescription = !card.og_description || 
          !card.og_description_generated_at ||
          (new Date().getTime() - new Date(card.og_description_generated_at).getTime()) > 30 * 24 * 60 * 60 * 1000;

        if (needsNewDescription) {
          // Generate in background, don't wait for it
          supabase.functions.invoke('generate-og-description', {
            body: { cardId: card.id }
          }).then(({ data, error }) => {
            if (!error && data?.description) {
              setOgDescription(data.description);
            }
          }).catch(err => console.error('Failed to generate OG description:', err));
        }

        // Parse content_json
        const content = card.content_json as any;
        const profile = Array.isArray(card.profiles) ? card.profiles[0] : card.profiles;
        
        // Parse location coordinates if available
        let lat = null;
        let lng = null;
        if (profile?.location_coordinates) {
          const coords = String(profile.location_coordinates).replace(/[()]/g, '').split(',');
          if (coords.length === 2) {
            lat = parseFloat(coords[0].trim());
            lng = parseFloat(coords[1].trim());
          }
        }
        
        setCardData({
          fullName: content.fullName || card.title || '',
          about: content.about || '',
          location: content.location || '',
          pronunciation: content.pronunciation || '',
          pronoun: content.pronoun || '',
          audioPronunciation: content.audioPronunciation || '',
          languages: content.languages || [],
          jobTitle: content.jobTitle || '',
          company: content.company || '',
          email: content.email || '',
          phone: content.phone || '',
          contactForm: content.contactForm || '',
          calendar: content.calendar || '',
          socialLinks: content.socialLinks || [],
          paymentLinks: content.paymentLinks || [],
          upiId: content.upiId || '',
          customLinks: content.customLinks || [],
          linkGroups: content.linkGroups || [],
          interests: content.interests || [],
          achievements: content.achievements || [],
          testimonials: content.testimonials || [],
          photos: content.photos || [],
          videoIntro: content.videoIntro || '',
          videoTestimonials: content.videoTestimonials || card.video_testimonials || [],
          videoSnippets: content.videoSnippets || card.video_snippets || [],
          avatarUrl: content.avatarUrl || '',
          vanityUrl: card.vanity_url || '',
          aiEnabled: profile?.ai_enabled ?? false,
          theme: content.theme || 'default',
          customCSS: content.customCSS || '',
          cardOrder: content.cardOrder || ['contact', 'verified', 'links', 'achievements', 'testimonials', 'interests', 'gallery', 'languages'],
          cardVisibility: content.cardVisibility || {
            contact: true,
            verified: true,
            links: true,
            achievements: true,
            testimonials: true,
            interests: true,
            gallery: true,
            languages: true,
          },
          address: profile?.address || '',
          showAddressMap: profile?.show_address_map || false,
          latitude: lat,
          longitude: lng,
        });

        // Track analytics with device and IP info
        await supabase.from('card_analytics').insert({
          card_id: card.id,
          event_type: 'view',
          user_agent: navigator.userAgent,
          device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Update Open Graph meta tags when card data is loaded
  useEffect(() => {
    if (cardData && username) {
      const cardImageUrl = getCardImageUrl(username);
      const pageUrl = window.location.href;
      
      updateOGMetaTags({
        title: `${cardData.fullName}${cardData.jobTitle ? ` - ${cardData.jobTitle}` : ''} | Patra`,
        description: ogDescription || `Check out ${cardData.fullName}'s digital business card on Patra`,
        image: cardImageUrl,
        url: pageUrl,
        type: 'profile',
      });
    }
  }, [cardData, username, ogDescription]);

  // If card view is requested, render the 3D card page
  if (isCardView) {
    return <MyCard />;
  }

  const handleShare = async () => {
    const url = window.location.href;
    const shareText = generateShareText(
      cardData?.fullName || 'Patra Profile',
      ogDescription,
      url
    );

    const result = await shareProfile(
      cardData?.fullName || 'Patra Profile',
      shareText,
      url
    );

    if (result.success && result.method === 'clipboard') {
      toast({
        title: 'Link copied!',
        description: 'Profile link and share text copied to clipboard.',
      });
    }
  };

  const handleDownloadVCard = () => {
    if (!cardData) return;

    downloadVCard({
      name: cardData.fullName,
      title: cardData.jobTitle,
      company: cardData.company,
      phone: cardData.phone,
      email: cardData.email,
      website: window.location.origin + '/' + cardData.vanityUrl,
      address: cardData.address,
      photo: cardData.avatarUrl,
      socialLinks: cardData.socialLinks,
    });

    toast({
      title: 'vCard Downloaded',
      description: 'Contact information saved to your device.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Render NotFound component if profile doesn't exist
  if (notFound || !cardData) {
    return <NotFound />;
  }

  return (
    <div className={`min-h-screen ${
      cardData.theme === 'modern' ? 'bg-gradient-to-br from-gray-900 to-gray-800' :
      cardData.theme === 'vibrant' ? 'bg-gradient-to-br from-purple-400 to-pink-600' :
      cardData.theme === 'professional' ? 'bg-gradient-to-br from-slate-100 to-gray-200' :
      cardData.theme === 'minimal' ? 'bg-background' :
      'bg-background'
    }`}>
      {/* Custom CSS Injection */}
      {cardData.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: cardData.customCSS }} />
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/${username}?card`)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Card
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/card-editor')}>
              <CreditCard className="mr-2 h-4 w-4" />
              Edit Card
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadVCard}>
              <Download className="mr-2 h-4 w-4" />
              Save Contact
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <CardPreviewNew cardData={cardData} showAIButton={true} />
      </main>
    </div>
  );
};
