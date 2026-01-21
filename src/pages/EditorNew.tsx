import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTour } from '@/hooks/useTour';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  LogOut,
  BarChart3,
  Download
} from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardPreviewNew } from '@/components/card-preview-new';
import { BusinessCard3D } from '@/components/BusinessCard3D';
import { addToGoogleWallet } from '@/lib/google-wallet-utils';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!isMobile);
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

    const cardId = searchParams.get('id');
    const isNew = searchParams.get('new') === 'true';

    try {
      // Fetch profile data first (for defaults across all cards)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('address, show_address_map, location_coordinates')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) console.error('Error fetching profile:', profileError);

      // Handle location parsing for defaults
      let defaultLat = null;
      let defaultLng = null;
      if (profileData?.location_coordinates) {
        const coords = String(profileData.location_coordinates).replace(/[()]/g, '').split(',');
        if (coords.length === 2) {
          defaultLat = parseFloat(coords[0].trim());
          defaultLng = parseFloat(coords[1].trim());
        }
      }

      if (isNew) {
        // If it's a new card, we start fresh but inherit address info from profile
        if (profileData) {
          setCardData(prev => ({
            ...prev,
            address: profileData.address ?? '',
            showAddressMap: profileData.show_address_map ?? false,
            latitude: defaultLat,
            longitude: defaultLng
          }));
        }
        return;
      }

      // Fetch digital card data
      let cardQuery = supabase.from('digital_cards').select('*');

      if (cardId) {
        cardQuery = cardQuery.eq('id', cardId);
      } else {
        // If no ID, fetch the most recent card
        cardQuery = cardQuery.eq('owner_user_id', user.id).order('created_at', { ascending: false }).limit(1);
      }

      const { data: cardDataResult, error: cardError } = await cardQuery.maybeSingle();

      if (cardError && cardError.code !== 'PGRST116') throw cardError;

      if (cardDataResult && cardDataResult.content_json) {
        const incoming = cardDataResult.content_json as Partial<CardData>;

        // Update URL if we fetched a specific card but didn't have ID in URL
        if (!cardId) {
          setSearchParams({ id: cardDataResult.id }, { replace: true });
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
          latitude: defaultLat ?? incoming.latitude ?? null,
          longitude: defaultLng ?? incoming.longitude ?? null,
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

  const generateAndUploadCardImage = async (cardId: string) => {
    const element = document.getElementById('card-capture-container');
    if (!element) return null;

    try {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return null;

      const fileName = `${cardId}.png`;

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('card_images')
        .upload(fileName, blob, {
          upsert: true,
          contentType: 'image/png'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('card_images')
        .getPublicUrl(fileName);

      // Add a timestamp to bust cache
      return `${publicUrl}?t=${new Date().getTime()}`;
    } catch (error) {
      console.error('Error generating card image:', error);
      return null;
    }
  };

  const handleSave = async (silent = false) => {
    if (!user) return;

    setSaving(true);
    try {
      const cardId = searchParams.get('id');

      // First, fetch existing card or use the one we were editing
      let existingId = cardId;

      if (!existingId) {
        const { data: existing } = await supabase
          .from('digital_cards')
          .select('id, vanity_url')
          .eq('owner_user_id', user.id)
          .maybeSingle(); // This might still be ambiguous if they have multiple and no ID

        // If we are creating a new card and didn't pass an ID, we should check if they want to overwrite the existing or create a new one.
        // Given the goal is "multi-profile", we'll default to creating a NEW one if no ID is passed in the URL.
        // Wait, if no ID passed, maybe we should just use the most recent one or enforce ID passed for editing?
        // Let's stick with: if no ID passed, but they HAVE a card, we edit it. If they DON'T have a card, we create it.
        // BUT if we want true multi-profile, we should have a "New Card" button that goes to /editor without an ID.
        // To avoid data loss, I'll check if they ALREADY have cards but we are not passing an ID.
      }

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

      let currentCardId = cardId || null;
      let error;

      if (currentCardId) {
        // Update existing card
        ({ error } = await supabase
          .from('digital_cards')
          .update(payload)
          .eq('id', currentCardId));
      } else {
        // Create new card
        const { data: newCard, error: insertError } = await supabase
          .from('digital_cards')
          .insert({
            ...payload,
            vanity_url: cardData.vanityUrl || `user-${Math.random().toString(36).substring(7)}`,
            owner_user_id: user.id
          })
          .select()
          .single();

        error = insertError;
        if (newCard) {
          currentCardId = newCard.id;
          // Redirect to the newly created card's editor
          setSearchParams({ id: newCard.id });
        }
      }

      if (error) throw error;

      // Generate and upload card image if not silent (or maybe even if silent?)
      // Let's do it only on manual save to save resources, or if it's a new card
      if (!silent && currentCardId) {
        const imageUrl = await generateAndUploadCardImage(currentCardId);
        if (imageUrl) {
          await supabase
            .from('digital_cards')
            .update({ card_image_url: imageUrl } as any)
            .eq('id', currentCardId);
        }
      }

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

  const handleAddToGoogleWallet = () => {
    const result = addToGoogleWallet({
      fullName: cardData.fullName || 'Your Name',
      jobTitle: cardData.jobTitle || '',
      company: cardData.company || '',
      email: cardData.email || '',
      phone: cardData.phone || '',
      avatarUrl: cardData.avatarUrl || '',
      vanityUrl: cardData.vanityUrl || '',
      qrCodeData: `https://patra.me/${cardData.vanityUrl}`,
    });

    toast({
      title: "Contact Card Downloaded!",
      description: result.message,
    });
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
      {/* Hidden container for card image generation */}
      <div
        id="card-capture-container"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '400px',
          zIndex: -1
        }}
      >
        <div className={`p-4 ${cardData.theme === 'modern' ? 'bg-gradient-to-br from-gray-900 to-gray-800' :
          cardData.theme === 'vibrant' ? 'bg-gradient-to-br from-purple-400 to-pink-600' :
            cardData.theme === 'professional' ? 'bg-gradient-to-br from-slate-100 to-gray-200' :
              cardData.theme === 'minimal' ? 'bg-background' :
                'bg-background'
          }`}>
          <CardPreviewNew cardData={{ ...cardData, aiEnabled }} showAIButton={true} />
        </div>
      </div>

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
            {isMobile && cardData.vanityUrl && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-muted-foreground"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => window.open(`/${cardData.vanityUrl}?card`, '_blank')}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    View Card
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open('/analytics', '_blank')}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`/${cardData.vanityUrl}`, '_blank')}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
              <Button data-tour="save" onClick={() => handleSave()} disabled={loading} size="sm" className="min-w-[100px]">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            )}

            <Avatar
              className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all ml-2"
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
            ${isMobile ? (showMobilePreview ? 'hidden' : 'w-full') : (isSidebarExpanded ? 'w-[600px]' : 'w-[400px]')} flex-shrink-0
        `}>
          {/* Mobile Navigation Tabs */}
          {isMobile && (
            <>
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
            </>
          )}

          <div className="flex flex-1 overflow-hidden">
            {/* Desktop/Tablet Navigation Rail */}
            {!isMobile && (
              <div className={`flex-none border-r border-border bg-muted/10 flex flex-col items-center py-6 gap-2 overflow-y-auto scrollbar-thin transition-all duration-300 ${isSidebarExpanded ? 'w-48 items-start px-3' : 'w-18'}`}>

                {/* Expand/Collapse Toggle */}
                <div className={`w-full flex ${isSidebarExpanded ? 'justify-end' : 'justify-center'} mb-4`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  >
                    {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  if (isSidebarExpanded) {
                    return (
                      <button
                        key={item.id}
                        data-tour={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setSearchParams({ tab: item.id });
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  }

                  return (
                    <TooltipProvider key={item.id}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            data-tour={item.id}
                            onClick={() => {
                              setActiveSection(item.id);
                              setSearchParams({ tab: item.id });
                            }}
                            className={`w-10 h-10 my-1 rounded-lg flex items-center justify-center transition-all ${isActive
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-primary text-primary-foreground border-primary">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}

                {!isSidebarExpanded && <div className="w-8 h-[1px] bg-border my-2" />}

                {/* Extra Links Icons */}
                {cardData.vanityUrl && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => window.open(`/${cardData.vanityUrl}?card`, '_blank')}
                            className={`rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all ${isSidebarExpanded ? 'w-full px-3 py-2.5 gap-3 justify-start' : 'w-10 h-10 my-1'}`}
                          >
                            <CreditCard className="w-5 h-5" />
                            {isSidebarExpanded && <span className="text-sm font-medium">View Card</span>}
                          </button>
                        </TooltipTrigger>
                        {!isSidebarExpanded && <TooltipContent side="right" className="bg-primary text-primary-foreground border-primary">View Card</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => window.open('/analytics', '_blank')}
                            className={`rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all ${isSidebarExpanded ? 'w-full px-3 py-2.5 gap-3 justify-start' : 'w-10 h-10 my-1'}`}
                          >
                            <BarChart3 className="w-5 h-5" />
                            {isSidebarExpanded && <span className="text-sm font-medium">Analytics</span>}
                          </button>
                        </TooltipTrigger>
                        {!isSidebarExpanded && <TooltipContent side="right" className="bg-primary text-primary-foreground border-primary">Analytics</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => window.open(`/${cardData.vanityUrl}`, '_blank')}
                            className={`rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all ${isSidebarExpanded ? 'w-full px-3 py-2.5 gap-3 justify-start' : 'w-10 h-10 my-1'}`}
                          >
                            <Eye className="w-5 h-5" />
                            {isSidebarExpanded && <span className="text-sm font-medium">View Profile</span>}
                          </button>
                        </TooltipTrigger>
                        {!isSidebarExpanded && <TooltipContent side="right" className="bg-primary text-primary-foreground border-primary">View Profile</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>

                    {/* Google Wallet Button - Hidden Feature */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleAddToGoogleWallet}
                            className={`rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all ${isSidebarExpanded ? 'w-full px-3 py-2.5 gap-3 justify-start' : 'w-10 h-10 my-1'}`}
                          >
                            <Download className="w-5 h-5" />
                            {isSidebarExpanded && <span className="text-sm font-medium">Add to Wallet</span>}
                          </button>
                        </TooltipTrigger>
                        {!isSidebarExpanded && <TooltipContent side="right" className="bg-primary text-primary-foreground border-primary">Add to Google Wallet</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
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
            <div className="max-w-md mx-auto space-y-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Live Preview</div>
              </div>

              {/* 3D Business Card */}
              <div className="mb-8">
                <BusinessCard3D cardData={cardData} scale={0.85} showControls={false} />
              </div>

              {/* Profile Preview */}
              <CardPreviewNew cardData={{ ...cardData, aiEnabled }} onOpenPayment={() => setShowPaymentDialog(true)} showAIButton={true} />

              {/* Profile URL Input at Bottom */}
              {cardData.vanityUrl && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Profile URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={`patra.me/${cardData.vanityUrl}`}
                      className="w-full px-4 py-2.5 pr-24 bg-background/50 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-default"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 gap-2"
                      onClick={handleCopyUrl}
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    End of profile preview
                  </p>
                </div>
              )}
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
            <div className="space-y-8">
              {/* 3D Business Card */}
              <div className="mb-8">
                <BusinessCard3D cardData={cardData} scale={0.85} showControls={false} />
              </div>

              {/* Profile Preview */}
              <CardPreviewNew cardData={{ ...cardData, aiEnabled }} onOpenPayment={() => setShowPaymentDialog(true)} showAIButton={true} />

              {/* Profile URL Input at Bottom */}
              {cardData.vanityUrl && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Profile URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={`patra.me/${cardData.vanityUrl}`}
                      className="w-full px-4 py-2.5 pr-24 bg-background/50 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-default"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 gap-2"
                      onClick={handleCopyUrl}
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    End of profile preview
                  </p>
                </div>
              )}
            </div>
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
