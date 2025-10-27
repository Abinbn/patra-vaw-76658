import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Edit, Share2, Printer, FlipHorizontal, ArrowLeft, Nfc, Mail, Phone, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import { updateOGMetaTags, generateShareText, shareProfile } from '@/lib/og-utils';

interface CardContent {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  avatarUrl: string;
  cardConfig?: any;
}

interface CardData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  avatarUrl: string;
  vanityUrl: string;
  cardConfig?: any;
}
export const MyCard: React.FC = () => {
  const {
    username
  } = useParams<{
    username: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [ogDescription, setOgDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    if (username) {
      document.title = `${username} | Patra`;
    }
    const fetchProfile = async () => {
      if (!username) return;
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        const { data: card, error } = await supabase
          .from('digital_cards')
          .select('*')
          .eq('vanity_url', username)
          .eq('is_active', true)
          .maybeSingle();

        if (error || !card) {
          setLoading(false);
          return;
        }

        const isOwner = currentUser && card.owner_user_id === currentUser.id;
        if (!card.is_approved && !isOwner) {
          setLoading(false);
          return;
        }
        setOgDescription(card.og_description);

        // Generate OG description if it doesn't exist or is older than 30 days
        const needsNewDescription = !card.og_description || 
          !card.og_description_generated_at ||
          (new Date().getTime() - new Date(card.og_description_generated_at).getTime()) > 30 * 24 * 60 * 60 * 1000;

        if (needsNewDescription) {
          supabase.functions.invoke('generate-og-description', {
            body: { cardId: card.id }
          }).then(({ data, error }) => {
            if (!error && data?.description) {
              setOgDescription(data.description);
            }
          }).catch(err => console.error('Failed to generate OG description:', err));
        }

        const content = card.content_json as any;
        setCardData({
          fullName: content.fullName || card.title || '',
          jobTitle: content.jobTitle || '',
          company: content.company || '',
          email: content.email || '',
          phone: content.phone || '',
          avatarUrl: content.avatarUrl || '',
          vanityUrl: card.vanity_url || '',
          cardConfig: content.cardConfig || null,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  // Update Open Graph meta tags when card data is loaded
  useEffect(() => {
    if (cardData && username) {
      const cardUrl = `${window.location.origin}/${username}?card`;
      
      updateOGMetaTags({
        title: `${cardData.fullName}'s Business Card | Patra`,
        description: ogDescription || `Check out ${cardData.fullName}'s digital business card on Patra`,
        image: cardUrl,
        url: window.location.href,
        type: 'profile',
      });
    }
  }, [cardData, username, ogDescription]);

  // Scroll detection for profile preview
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show profile preview when scrolling up and past 100px
      if (currentScrollY < lastScrollY && currentScrollY > 100) {
        setShowProfilePreview(true);
      } else if (currentScrollY > lastScrollY || currentScrollY <= 100) {
        setShowProfilePreview(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleShare = async () => {
    const url = `${window.location.origin}/${username}?card`;
    const shareText = generateShareText(
      cardData?.fullName || 'Patra Card',
      ogDescription,
      url
    );

    const result = await shareProfile(
      `${cardData?.fullName}'s Card`,
      shareText,
      url
    );

    if (result.success && result.method === 'clipboard') {
      toast({
        title: 'Link copied!',
        description: 'Card link and share text copied to clipboard.'
      });
    }
  };
  const handlePrint = () => {
    toast({
      title: 'Print Card',
      description: 'Physical card printing feature coming soon!'
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading card...</p>
          </div>
        </div>
      </div>;
  }
  if (!cardData) {
    return <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold mb-4 text-slate-900">404</h1>
            <p className="text-xl text-slate-600 mb-6">Card not found</p>
            <Button onClick={() => navigate('/')} variant="default" className="bg-slate-900 hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </div>
      </div>;
  }
  const cardUrl = `${window.location.origin}/${username}`;
  return <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {/* Micro-dotted canvas background */}
      <div className="absolute inset-0 opacity-30" style={{
      backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}></div>

      {/* Profile Preview - appears on scroll up */}
      <div 
        className={`fixed top-0 left-0 right-0 z-[60] bg-white border-b border-slate-200 shadow-lg transform transition-transform duration-500 ease-out ${
          showProfilePreview ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            {cardData?.avatarUrl && (
              <img 
                src={cardData.avatarUrl} 
                alt={cardData.fullName} 
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
              />
            )}
            <div>
              <h3 className="font-semibold text-slate-900">{cardData?.fullName}</h3>
              <p className="text-sm text-slate-500">{cardData?.jobTitle}</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate(`/${username}`)}
            className="bg-slate-900 hover:bg-slate-800"
          >
            View Full Profile
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-5 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-slate-900">
            <span className="text-slate-600">P</span>atra
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setFlipped(!flipped)} className="hover:bg-slate-100" title="Flip Card">
            <FlipHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/editor')} className="hover:bg-slate-100" title="Edit Card">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} className="hover:bg-slate-100" title="Share Card">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrint} className="hover:bg-slate-100" title="Print Card">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex flex-col items-center justify-center min-h-[calc(100vh-73px)] p-8">
        {/* Greeting Text */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
            Preview of {cardData.fullName}'s Card
          </h1>
          
        </div>

        {/* 3D Card Container */}
        <div className="perspective-card">
          <div className={`card-container ${flipped ? 'flipped' : ''}`} 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)} 
            onClick={() => setFlipped(!flipped)} 
            style={{
              width: `${cardData.cardConfig?.cardWidth || 400}px`,
              height: `${cardData.cardConfig?.cardHeight || 250}px`,
              transform: isHovered && !flipped ? 'translateY(-8px) rotateX(2deg) rotateY(-2deg)' : isHovered && flipped ? 'translateY(-8px) rotateX(2deg) rotateY(182deg)' : flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}>
            {/* Front Side */}
            <div className="card-face card-front">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-xl overflow-hidden">
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
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
                    const content = cardData as any;
                    const config = (content as any).cardConfig || {};
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
                          <div style={{ position: 'absolute', left: `${positions.avatar?.x || 20}px`, top: `${positions.avatar?.y || 60}px` }}>
                            <img 
                              src={cardData.avatarUrl} 
                              alt={cardData.fullName} 
                              className="rounded-lg object-cover border-2 border-white/20 shadow-xl"
                              style={{ width: `${config.avatarSize || 96}px`, height: `${config.avatarSize || 96}px` }}
                            />
                          </div>
                        )}

                        {/* Name */}
                        <div style={{ position: 'absolute', left: `${positions.name?.x || 140}px`, top: `${positions.name?.y || 60}px` }}>
                          <h2 className="font-bold text-white" style={{ fontSize: `${(config.fontSize || 16) + 4}px` }}>
                            {cardData.fullName}
                          </h2>
                        </div>

                        {/* Job Title */}
                        {cardData.jobTitle && (config.showJobTitle !== false) && (
                          <div style={{ position: 'absolute', left: `${positions.jobTitle?.x || 140}px`, top: `${positions.jobTitle?.y || 90}px` }}>
                            <p className="text-white/80" style={{ fontSize: `${(config.fontSize || 16) - 2}px` }}>
                              {cardData.jobTitle}
                            </p>
                          </div>
                        )}

                        {/* Company */}
                        {cardData.company && (config.showCompany !== false) && (
                          <div style={{ position: 'absolute', left: `${positions.company?.x || 140}px`, top: `${positions.company?.y || 115}px` }}>
                            <p className="text-white/60" style={{ fontSize: `${(config.fontSize || 16) - 4}px` }}>
                              {cardData.company}
                            </p>
                          </div>
                        )}

                        {/* Email */}
                        {cardData.email && (config.showEmail !== false) && (
                          <div style={{ position: 'absolute', left: `${positions.email?.x || 140}px`, top: `${positions.email?.y || 150}px` }} className="flex items-center gap-2">
                            <Mail className="w-3 h-3 flex-shrink-0 text-white/90" />
                            <span className="text-white/90" style={{ fontSize: `${(config.fontSize || 16) - 4}px` }}>{cardData.email}</span>
                          </div>
                        )}

                        {/* Phone */}
                        {cardData.phone && (config.showPhone !== false) && (
                          <div style={{ position: 'absolute', left: `${positions.phone?.x || 140}px`, top: `${positions.phone?.y || 175}px` }} className="flex items-center gap-2">
                            <Phone className="w-3 h-3 flex-shrink-0 text-white/90" />
                            <span className="text-white/90" style={{ fontSize: `${(config.fontSize || 16) - 4}px` }}>{cardData.phone}</span>
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
              borderRadius: `${cardData.cardConfig?.borderRadius || 12}px`,
            }}>
              <div className="absolute inset-0 rounded-xl overflow-hidden" style={{
                backgroundColor: cardData.cardConfig?.backBackgroundColor || cardData.cardConfig?.backgroundColor || '#1e293b',
                backgroundImage: cardData.cardConfig?.backBackgroundImage ? `url(${cardData.cardConfig.backBackgroundImage})` : 
                  cardData.cardConfig?.backBackgroundPattern === 'dots' ? 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)' :
                  cardData.cardConfig?.backBackgroundPattern === 'grid' ? 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)' :
                  cardData.cardConfig?.backBackgroundPattern === 'waves' ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' :
                  'linear-gradient(135deg, #1e293b, #0f172a)',
                backgroundSize: cardData.cardConfig?.backBackgroundPattern === 'grid' ? '20px 20px' : 'cover',
                borderRadius: `${cardData.cardConfig?.borderRadius || 12}px`,
              }}>
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulance type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
              }}></div>

                {/* Logo top left */}
                <div className="absolute top-4 left-4 text-white/90 text-xs font-semibold tracking-wide">
                  Patra
                </div>

                {/* QR Code with saved position */}
                <div className="relative h-full flex flex-col items-center justify-center p-6">
                  {(() => {
                    const qrPos = cardData.cardConfig?.backPositions?.qrCode || { x: 0, y: 0 };
                    const qrSize = cardData.cardConfig?.qrCodeSize || 110;
                    const qrStyle = cardData.cardConfig?.qrCodeStyle || 'square';
                    
                    return (
                      <div style={{ 
                        position: qrPos.x !== 0 || qrPos.y !== 0 ? 'absolute' : 'relative',
                        left: qrPos.x !== 0 ? `${qrPos.x}px` : undefined,
                        top: qrPos.y !== 0 ? `${qrPos.y}px` : undefined,
                      }}>
                        <div className={`bg-white p-4 shadow-2xl ${qrStyle === 'rounded' ? 'rounded-2xl' : 'rounded-lg'}`}>
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

                  {/* Thermochromic ink effect username */}
                  <p className="mt-4 text-xs text-white/30 font-mono tracking-wider" style={{
                  textShadow: '0 0 10px rgba(255,255,255,0.1)',
                  letterSpacing: '0.15em'
                }}>
                    {username}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle instruction hint */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400">
            Click the flip button or tap the card to see both sides
          </p>
        </div>

        {/* Buttons below the Card */}
        <div className="flex gap-3 mt-4 justify-center">
          <button  
            onClick={() => navigate('/editor')}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform duration-150 ease-in-out"
          >
            <Edit className="w-4 h-4" />
            Editor
          </button>
          
          <button  
            onClick={() => navigate(`/${username}`)}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform duration-150 ease-in-out"
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          
          <button  
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform duration-150 ease-in-out"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        
      </main>

      <style>{`
        .perspective-card {
          perspective: 2000px;
          cursor: pointer;
        }

        .card-container {
          position: relative;
          width: 400px;
          height: 250px;
          transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 
                      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        .card-front {
          transform: rotateY(0deg);
        }

        .card-back {
          transform: rotateY(180deg);
        }

        .card-container.flipped {
          transform: rotateY(180deg);
        }

        /* Matte finish effect */
        .card-face::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 0, 0, 0.05) 100%
          );
          pointer-events: none;
        }

        /* Responsive scaling - maintaining 8cm x 5.5cm ratio */
        @media (max-width: 640px) {
          .card-container {
            width: 320px;
            height: 200px;
            
          }
        }

        @media (min-width: 1024px) {
          .card-container {
            width: 400px;
            height: 250px;
          }
        }
      `}</style>
    </div>;
};
