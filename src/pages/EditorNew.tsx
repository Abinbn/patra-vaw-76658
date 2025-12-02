import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTour } from '@/hooks/useTour';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Save,
  User,
  Verified,
  Wallet,
  Link2,
  Heart,
  ImageIcon,
  Palette,
  X,
  ExternalLink,
  CreditCard,
  Menu,
  Smartphone,
  Copy,
  Check,
  ArrowLeft,
  Eye,
  Award,
  MessageSquare,
  UserCircle,
  Code,
  LayoutGrid,
  MapPin,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardPreviewNew } from '@/components/card-preview-new';
import { useIsMobile } from '@/hooks/use-mobile';
import { VideoIntro } from '@/components/VideoIntro';
import { ProfileInfoEditor } from '@/components/editor/ProfileInfoEditor';
import { SocialLinksEditor } from '@/components/editor/SocialLinksEditor';
import { PaymentLinksEditor } from '@/components/editor/PaymentLinksEditor';
import { PhotoGalleryEditor } from '@/components/editor/PhotoGalleryEditor';
import { ThemeSelector } from '@/components/editor/ThemeSelector';
import { SortableSectionList } from '@/components/editor/SortableSectionList';
import { AchievementsEditor } from '@/components/editor/AchievementsEditor';
import { TestimonialsEditor } from '@/components/editor/TestimonialsEditor';
import { InterestsEditor } from '@/components/editor/InterestsEditor';
import { LocationEditor } from '@/components/editor/LocationEditor';
import { AiProfileEditor } from '@/components/editor/AiProfileEditor';
import { BasicInfoEditor } from '@/components/editor/BasicInfoEditor';
import { CustomLinksEditor } from '@/components/editor/CustomLinksEditor';
import { CardData } from '@/components/editor/types';

const navItems = [
  { id: 'avatar', label: 'Avatar', icon: UserCircle },
  { id: 'about', label: 'About', icon: User },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'verified', label: 'Social accounts', icon: Verified },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'interests', label: 'Interests', icon: Heart },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'cardlayout', label: 'Card Layout', icon: LayoutGrid },
  { id: 'aiprofile', label: 'AI Profile', icon: Code },
];

export const EditorNew: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(searchParams.get('tab') || 'avatar');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    fullName: '',
    about: '',
    location: '',
    pronunciation: '',
    pronoun: '',
    audioPronunciation: '',
    languages: [],
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
    contactForm: '',
    calendar: '',
    socialLinks: [],
    paymentLinks: [],
    customLinks: [],
    linkGroups: [],
    interests: [],
    avatarUrl: '',
    vanityUrl: '',
    upiId: '',
    videoIntro: '',
    achievements: [],
    testimonials: [],
    theme: 'default',
    customCSS: '',
    photos: [],
    cardOrder: ['contact', 'verified', 'links', 'achievements', 'testimonials', 'interests', 'gallery', 'languages', 'location'],
    cardVisibility: {
      contact: true,
      verified: true,
      links: true,
      achievements: true,
      testimonials: true,
      interests: true,
      gallery: true,
      languages: true,
      location: true,
    },
    address: '',
    showAddressMap: false,
    latitude: null,
    longitude: null,
    mapUrl: '',
  });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAIConsent, setShowAIConsent] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiProfileExpanded, setAiProfileExpanded] = useState(false);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [shouldStartTour, setShouldStartTour] = useState(false);

  // Video intro state
  const [showVideoIntro, setShowVideoIntro] = useState(false);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!user) return;
    const autoSaveInterval = setInterval(() => {
      handleSave(true); // pass true for silent save
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [cardData, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (user) {
      fetchExistingCard();
      fetchAIStatus();

      // Check for selected template and apply it
      const selectedTemplate = localStorage.getItem('selectedTemplate');
      if (selectedTemplate) {
        // Import template and apply its styles
        import('@/types/template').then((module) => {
          const allTemplates = [...module.defaultCardTemplates, ...module.defaultProfileTemplates];
          const template = allTemplates.find(t => t.id === selectedTemplate);
          if (template) {
            setCardData(prev => ({
              ...prev,
              customCSS: template.style.customCSS || prev.customCSS,
            }));
          }
        });
        // Clear the selection after applying
        localStorage.removeItem('selectedTemplate');
      }

      // Show video intro on first visit
      const hasSeenIntro = localStorage.getItem('patra_video_intro_seen');
      const hasCompletedTour = localStorage.getItem('patra-tour-completed') === 'true';

      if (!hasSeenIntro) {
        // Delay to allow editor to load first
        setTimeout(() => setShowVideoIntro(true), 1000);
      } else if (!hasCompletedTour) {
        // If video already seen but tour not completed, start tour immediately
        setShouldStartTour(true);
      }
    }
  }, [user]);

  // Initialize guided tour - will start only when shouldStartTour is true
  useTour(shouldStartTour);

  const fetchAIStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('ai_enabled')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setAiEnabled(data.ai_enabled || false);
    }
  };

  const handleAIToggle = async (enabled: boolean) => {
    if (enabled && !aiEnabled) {
      setShowAIConsent(true);
    } else {
      await updateAIStatus(enabled);
    }
  };

  const handleAIConsentAccept = async () => {
    await updateAIStatus(true);
    setShowAIConsent(false);
  };

  const updateAIStatus = async (enabled: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        ai_enabled: enabled,
        ai_consent_given_at: enabled ? new Date().toISOString() : null
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update AI settings',
        variant: 'destructive',
      });
    } else {
      setAiEnabled(enabled);
      toast({
        title: enabled ? 'AI Enabled' : 'AI Disabled',
        description: enabled
          ? 'Your AI assistant is now active!'
          : 'Your AI assistant has been disabled.',
      });
    }
  };

  const fetchExistingCard = async () => {
    if (!user) return;

    try {
      // Fetch both digital card and profile data
      const [cardResult, profileResult] = await Promise.all([
        supabase
          .from('digital_cards')
          .select('*')
          .eq('owner_user_id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('address, show_address_map, location_coordinates')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      if (cardResult.error && cardResult.error.code !== 'PGRST116') throw cardResult.error;

      if (cardResult.data && cardResult.data.content_json) {
        const incoming = cardResult.data.content_json as Partial<CardData>;
        const profileData = profileResult.data;

        // Parse location coordinates if available
        let lat = null;
        let lng = null;
        if (profileData?.location_coordinates) {
          const coords = String(profileData.location_coordinates).replace(/[()]/g, '').split(',');
          if (coords.length === 2) {
            lat = parseFloat(coords[0].trim());
            lng = parseFloat(coords[1].trim());
          }
        }
        // Ensure new Location section exists in order/visibility
        const defaultOrder = ['contact', 'verified', 'links', 'achievements', 'testimonials', 'interests', 'gallery', 'languages', 'location'];
        const computedOrder = Array.isArray(incoming.cardOrder) && incoming.cardOrder.length
          ? (incoming.cardOrder.includes('location') ? incoming.cardOrder : [...incoming.cardOrder, 'location'])
          : defaultOrder;

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

        const computedVisibility = incoming.cardVisibility
          ? { ...defaultVisibility, ...incoming.cardVisibility }
          : defaultVisibility;

        setCardData((prev) => ({
          ...prev,
          ...incoming,
          languages: Array.isArray(incoming.languages) ? incoming.languages : [],
          socialLinks: Array.isArray(incoming.socialLinks) ? incoming.socialLinks : [],
          paymentLinks: Array.isArray(incoming.paymentLinks) ? incoming.paymentLinks : [],
          customLinks: Array.isArray(incoming.customLinks) ? incoming.customLinks : [],
          linkGroups: Array.isArray(incoming.linkGroups) ? incoming.linkGroups : [],
          interests: Array.isArray(incoming.interests) ? incoming.interests : [],
          achievements: Array.isArray(incoming.achievements) ? incoming.achievements : [],
          testimonials: Array.isArray(incoming.testimonials) ? incoming.testimonials : [],
          photos: Array.isArray(incoming.photos) ? incoming.photos : [],
          fullName: incoming.fullName ?? '',
          about: incoming.about ?? '',
          location: incoming.location ?? '',
          pronunciation: incoming.pronunciation ?? '',
          pronoun: incoming.pronoun ?? '',
          audioPronunciation: incoming.audioPronunciation ?? '',
          jobTitle: incoming.jobTitle ?? '',
          company: incoming.company ?? '',
          email: incoming.email ?? '',
          phone: incoming.phone ?? '',
          contactForm: incoming.contactForm ?? '',
          calendar: incoming.calendar ?? '',
          avatarUrl: incoming.avatarUrl ?? '',
          vanityUrl: incoming.vanityUrl ?? '',
          upiId: incoming.upiId ?? '',
          videoIntro: incoming.videoIntro ?? '',
          theme: incoming.theme ?? 'default',
          customCSS: incoming.customCSS ?? '',
          bannerType: incoming.bannerType ?? 'gradient',
          bannerValue: incoming.bannerValue ?? '',
          cardOrder: computedOrder,
          cardVisibility: computedVisibility,
          address: profileData?.address ?? incoming.address ?? '',
          showAddressMap: profileData?.show_address_map ?? incoming.showAddressMap ?? false,
          latitude: lat ?? incoming.latitude ?? null,
          longitude: lng ?? incoming.longitude ?? null,
          mapUrl: incoming.mapUrl ?? '',
        }));
      }
    } catch (error) {
      console.error('Error fetching card:', error);
    }
  };

  const toggleMobilePreview = () => {
    setShowMobilePreview(!showMobilePreview);
  };

  const handleSave = async (silent = false) => {
    if (!user) return;

    setSaving(true);
    try {
      // First, fetch existing card with vanity_url to check
      const { data: existing } = await supabase
        .from('digital_cards')
        .select('id, vanity_url')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      // Ensure banner settings and custom CSS are included
      const contentToSave = {
        ...cardData,
        bannerType: cardData.bannerType || 'gradient',
        bannerValue: cardData.bannerValue || '',
        customCSS: cardData.customCSS || '',
        theme: cardData.theme || 'default',
      };

      const payload: any = {
        title: cardData.fullName || 'My Card',
        content_json: contentToSave,
        is_active: true,
        is_approved: true,
      };

      let error;
      if (existing?.id) {
        // Only include vanity_url in update if it has changed
        if (existing.vanity_url !== cardData.vanityUrl) {
          payload.vanity_url = cardData.vanityUrl;
        }

        ({ error } = await supabase
          .from('digital_cards')
          .update(payload)
          .eq('id', existing.id));
      } else {
        // For new cards, always include vanity_url and owner_user_id
        ({ error } = await supabase
          .from('digital_cards')
          .insert({
            ...payload,
            vanity_url: cardData.vanityUrl,
            owner_user_id: user.id
          }));
      }

      if (error) throw error;

      if (!silent) {
        toast({
          title: "Success!",
          description: "Your card has been saved and published!",
        });
      }
    } catch (error: any) {
      console.error('Error saving card:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your card. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = () => {
    const url = `patra.me/${cardData.vanityUrl}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast({
      title: "Copied!",
      description: "Card URL copied to clipboard",
    });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'avatar':
        return <BasicInfoEditor cardData={cardData} setCardData={setCardData} user={user} />;

      case 'about':
        return <ProfileInfoEditor cardData={cardData} setCardData={setCardData} />;

      case 'wallet':
        return <PaymentLinksEditor cardData={cardData} setCardData={setCardData} />;

      case 'location':
        return <LocationEditor cardData={cardData} setCardData={setCardData} />;

      case 'links':
        return <CustomLinksEditor cardData={cardData} setCardData={setCardData} user={user} />;

      case 'interests':
        return <InterestsEditor cardData={cardData} setCardData={setCardData} />;

      case 'achievements':
        return <AchievementsEditor cardData={cardData} setCardData={setCardData} />;

      case 'testimonials':
        return <TestimonialsEditor cardData={cardData} setCardData={setCardData} />;

      case 'verified':
        return <SocialLinksEditor cardData={cardData} setCardData={setCardData} />;

      case 'gallery':
        return <PhotoGalleryEditor cardData={cardData} setCardData={setCardData} />;

      case 'design':
        return <ThemeSelector cardData={cardData} setCardData={setCardData} />;

      case 'cardlayout':
        return <SortableSectionList cardData={cardData} setCardData={setCardData} />;

      case 'aiprofile':
        return <AiProfileEditor cardData={cardData} setCardData={setCardData} aiEnabled={aiEnabled} handleAIToggle={handleAIToggle} />;

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Video Intro Dialog */}
      {showVideoIntro && <VideoIntro onClose={() => {
        setShowVideoIntro(false);
        // Start tour after video closes
        const hasCompletedTour = localStorage.getItem('patra-tour-completed') === 'true';
        if (!hasCompletedTour) {
          setShouldStartTour(true);
        }
      }} />}

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 overflow-x-auto">
        <div className="px-4 h-16 flex items-center justify-between min-w-max">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold hidden sm:block">Patra</h1>
          </div>

          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMobilePreview}
                className="gap-2"
              >
                <Smartphone className="w-4 h-4" />
                {showMobilePreview ? 'Edit' : 'Preview'}
              </Button>
            )}

            {!isMobile && (
              <Button data-tour="save" onClick={() => handleSave()} disabled={loading} size="sm">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save'}
              </Button>
            )}

            <Avatar
              className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
              onClick={() => navigate('/settings')}
            >
              <AvatarImage src={cardData.avatarUrl} alt={cardData.fullName} />
              <AvatarFallback>{cardData.fullName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Editor */}
        <div className={`flex flex-col border-r border-border bg-card overflow-hidden transition-all duration-300
            ${isMobile ? (showMobilePreview ? 'hidden' : 'w-full') : 'w-[500px] flex-shrink-0'}
        `}>
          {/* Mobile Navigation Tabs */}
          {isMobile && (
            <div className="flex overflow-x-auto border-b border-border bg-muted/10 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSearchParams({ tab: item.id });
                    }}
                    className={`flex flex-col items-center justify-center min-w-[4.5rem] py-3 px-1 gap-1 transition-colors border-b-2 ${isActive
                      ? 'border-primary text-primary bg-background'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            {/* Desktop/Tablet Navigation Rail */}
            {!isMobile && (
              <div className="w-16 flex-none border-r border-border bg-muted/10 flex flex-col items-center py-4 gap-2 overflow-y-auto scrollbar-none">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      data-tour={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setSearchParams({ tab: item.id });
                      }}
                      title={item.label}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}

                <div className="w-8 h-[1px] bg-border my-2" />

                {/* Extra Links Icons */}
                {cardData.vanityUrl && (
                  <>
                    <button
                      onClick={() => window.open(`/${cardData.vanityUrl}?card`, '_blank')}
                      title="View Card"
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                      <CreditCard className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => window.open('/analytics', '_blank')}
                      title="Analytics"
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => window.open(`/${cardData.vanityUrl}`, '_blank')}
                      title="View Profile"
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
              <div className="max-w-xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {navItems.find(n => n.id === activeSection)?.label}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Customize your {navItems.find(n => n.id === activeSection)?.label.toLowerCase()} settings
                    </p>
                  </div>
                  {/* Card URL Copy for Desktop */}
                  {!isMobile && cardData.vanityUrl && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-xs"
                        onClick={handleCopyUrl}
                      >
                        {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedUrl ? 'Copied' : 'Copy Link'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {renderSection(activeSection)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview (Desktop/Tablet) */}
        {!isMobile && (
          <aside
            data-tour="preview"
            className={`flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent ${cardData.theme === 'modern' ? 'bg-gradient-to-br from-gray-900 to-gray-800' :
              cardData.theme === 'vibrant' ? 'bg-gradient-to-br from-purple-400 to-pink-600' :
                cardData.theme === 'professional' ? 'bg-gradient-to-br from-slate-100 to-gray-200' :
                  cardData.theme === 'minimal' ? 'bg-background' :
                    'bg-muted/30'
              }`}
            style={{ height: '100%' }}
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Live Preview</div>
              </div>
              <CardPreviewNew cardData={{ ...cardData, aiEnabled }} onOpenPayment={() => setShowPaymentDialog(true)} showAIButton={true} />
            </div>
          </aside>
        )}

        {/* Preview Column - Mobile */}
        {isMobile && showMobilePreview && (
          <div className={`fixed inset-0 top-16 z-40 overflow-y-auto scrollbar-thin p-4 transition-transform duration-300 ${cardData.theme === 'modern' ? 'bg-gradient-to-br from-gray-900 to-gray-800' :
            cardData.theme === 'vibrant' ? 'bg-gradient-to-br from-purple-400 to-pink-600' :
              cardData.theme === 'professional' ? 'bg-gradient-to-br from-slate-100 to-gray-200' :
                cardData.theme === 'minimal' ? 'bg-background' :
                  'bg-background'
            }`}>
            <CardPreviewNew cardData={{ ...cardData, aiEnabled }} onOpenPayment={() => setShowPaymentDialog(true)} showAIButton={true} />
          </div>
        )}
      </div>

      {/* AI Consent Dialog */}
      <Dialog open={showAIConsent} onOpenChange={setShowAIConsent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable AI Assistant</DialogTitle>
            <DialogDescription>
              By enabling this feature, you consent to train an AI assistant with your profile data.
              This AI will represent you in conversations with visitors on your profile page.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm">The AI will use:</p>
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              <li>Your name, job title, and bio</li>
              <li>Your skills, interests, and achievements</li>
              <li>Your social links and contact information</li>
              <li>Any testimonials and media you've added</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Visitors will be able to chat with your AI clone to learn more about you and your work.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIConsent(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIConsentAccept}>
              I Consent, Enable AI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Save Button */}
      {isMobile && !showMobilePreview && (
        <div className="border-t border-border bg-card p-4 z-20 shrink-0">
          <Button onClick={() => handleSave()} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
