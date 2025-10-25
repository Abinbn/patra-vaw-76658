import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTour } from '@/hooks/useTour';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
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
  Plus,
  X,
  Upload,
  ExternalLink,
  Settings,
  CreditCard,
  Menu,
  Smartphone,
  ChevronLeft,
  LogOut,
  Copy,
  Check,
  ArrowLeft,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Award,
  MessageSquare,
  Video,
  Volume2,
  GripVertical,
  UserCircle,
  Code,
  Share2,
  LayoutGrid,
  Mail,
  Globe,
  MapPin,
  Navigation
} from 'lucide-react';
import { CardPreviewNew } from '@/components/card-preview-new';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaYoutube, 
  FaTiktok, FaDiscord, FaWhatsapp, FaTelegram, FaReddit, FaMedium, 
  FaDribbble, FaBehance, FaPinterest, FaTwitch, FaPaypal, 
  FaCashRegister, FaPatreon, FaBitcoin, FaEthereum
} from "react-icons/fa";
import { SiLitecoin, SiDogecoin } from "react-icons/si";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/components/editor/SortableItem';
import { VideoIntro } from '@/components/VideoIntro';

interface SocialLink {
  platform: string;
  url: string;
  icon: string | React.ReactElement;
}

interface PaymentLink {
  platform: string;
  url: string;
  icon: string | React.ReactElement;
}

interface CustomLink {
  title: string;
  url: string;
  description: string;
  previewImage?: string;
  groupId?: string;
}

interface LinkGroup {
  id: string;
  name: string;
}

interface Achievement {
  title: string;
  issuer: string;
  date: string;
  url?: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar?: string;
  socialUrl?: string;
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

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
  socialLinks: SocialLink[];
  paymentLinks: PaymentLink[];
  customLinks: CustomLink[];
  linkGroups: LinkGroup[];
  interests: string[];
  avatarUrl: string;
  vanityUrl: string;
  upiId: string;
  videoIntro?: string;
  achievements: Achievement[];
  testimonials: Testimonial[];
  theme?: string;
  customCSS?: string;
  photos: Photo[];
  cardOrder: string[];
  cardVisibility: {
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
  mapUrl?: string;
  bannerType?: 'gradient' | 'color' | 'image' | 'blurred' | 'pattern';
  bannerValue?: string; // For color hex, image URL, or pattern type
}

const socialPlatforms = [
  { name: 'GitHub', icon: <FaGithub className="text-lg" /> },
  { name: 'LinkedIn', icon: <FaLinkedin className="text-lg text-blue-700" /> },
  { name: 'Twitter', icon: <FaTwitter className="text-lg text-sky-500" /> },
  { name: 'Instagram', icon: <FaInstagram className="text-lg text-pink-500" /> },
  { name: 'Facebook', icon: <FaFacebook className="text-lg text-blue-600" /> },
  { name: 'YouTube', icon: <FaYoutube className="text-lg text-red-600" /> },
  { name: 'TikTok', icon: <FaTiktok className="text-lg" /> },
  { name: 'Discord', icon: <FaDiscord className="text-lg text-indigo-500" /> },
  { name: 'WhatsApp', icon: <FaWhatsapp className="text-lg text-green-500" /> },
  { name: 'Telegram', icon: <FaTelegram className="text-lg text-sky-400" /> },
  { name: 'Reddit', icon: <FaReddit className="text-lg text-orange-500" /> },
  { name: 'Medium', icon: <FaMedium className="text-lg" /> },
  { name: 'Dribbble', icon: <FaDribbble className="text-lg text-pink-400" /> },
  { name: 'Behance', icon: <FaBehance className="text-lg text-blue-500" /> },
  { name: 'Pinterest', icon: <FaPinterest className="text-lg text-red-500" /> },
  { name: 'Twitch', icon: <FaTwitch className="text-lg text-purple-500" /> },
];

const paymentPlatforms = [
  { name: 'PayPal', icon: <FaPaypal className="text-lg text-sky-600" /> },
  { name: 'CashApp', icon: <FaCashRegister className="text-lg text-green-500" /> },
  { name: 'Patreon', icon: <FaPatreon className="text-lg text-orange-500" /> },
  { name: 'Bitcoin', icon: <FaBitcoin className="text-lg text-orange-400" /> },
  { name: 'Ethereum', icon: <FaEthereum className="text-lg text-gray-400" /> },
  { name: 'Litecoin', icon: <SiLitecoin className="text-lg text-blue-400" /> },
  { name: 'Dogecoin', icon: <SiDogecoin className="text-lg text-yellow-500" /> },
];

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

const CARD_DEFINITIONS = [
  { id: 'contact', label: 'Contact Information', icon: Mail },
  { id: 'verified', label: 'Verified Accounts', icon: Verified },
  { id: 'links', label: 'Custom Links', icon: Link2 },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'interests', label: 'Interests', icon: Heart },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'languages', label: 'Languages', icon: Globe },
  { id: 'location', label: 'Location', icon: MapPin },
];

const cardThemes = [
  { id: 'default', name: 'Default', preview: 'bg-gradient-to-br from-blue-50 to-indigo-100' },
  { id: 'modern', name: 'Modern Dark', preview: 'bg-gradient-to-br from-gray-900 to-gray-800' },
  { id: 'vibrant', name: 'Vibrant', preview: 'bg-gradient-to-br from-purple-400 to-pink-600' },
  { id: 'professional', name: 'Professional', preview: 'bg-gradient-to-br from-slate-100 to-gray-200' },
  { id: 'minimal', name: 'Minimal', preview: 'bg-white border-2 border-gray-200' },
];

export const EditorNew: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('avatar');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputPanelOpen, setInputPanelOpen] = useState(false); // NEW STATE
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

  const [newLanguage, setNewLanguage] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [urlRestrictionReason, setUrlRestrictionReason] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  // Custom link states
  const [newCustomLink, setNewCustomLink] = useState<CustomLink>({
    title: '',
    url: '',
    description: '',
    previewImage: '',
    groupId: ''
  });
  const [showLinkPreview, setShowLinkPreview] = useState(true);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [uploadingLinkImage, setUploadingLinkImage] = useState(false);
  const [fetchingLinkPreview, setFetchingLinkPreview] = useState(false);
  
  // Link group states
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  // Achievement states
  const [newAchievement, setNewAchievement] = useState<Achievement>({ title: '', issuer: '', date: '', url: '' });
  const [editingAchievementIndex, setEditingAchievementIndex] = useState<number | null>(null);
  
  // Testimonial states
  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({ name: '', role: '', content: '', avatar: '', socialUrl: '' });
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(null);
  const [uploadingTestimonialAvatar, setUploadingTestimonialAvatar] = useState(false);
  
  // Media states
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Photo states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  
  // Video intro state
  const [showVideoIntro, setShowVideoIntro] = useState(false);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      // Esc to close panels
      if (e.key === 'Escape') {
        if (inputPanelOpen) {
          handleBackToSidebar();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputPanelOpen]);

  const [shouldStartTour, setShouldStartTour] = useState(false);

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

  const handleSectionChange = (sectionId: string) => {
    if (sectionId === 'card') {
      navigate(`/${cardData.vanityUrl}?card`);
      return;
    }
    
    setActiveSection(sectionId);
    
    // On mobile/tablet, collapse sidebar and show input panel
    if (isMobile) {
      setSidebarOpen(false);
      setShowMobilePreview(false);
      setInputPanelOpen(true);
    } else {
      // On desktop/tablet, collapse sidebar
      setSidebarOpen(false);
      setInputPanelOpen(true);
    }
  };
  
  const handleBackToSidebar = () => {
    setSidebarOpen(true);
    setInputPanelOpen(false);
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

      // Build location_coordinates point if both lat/lng are provided and valid
      let locationPoint: string | null = null;
      if (
        cardData.latitude !== null && cardData.latitude !== undefined &&
        cardData.longitude !== null && cardData.longitude !== undefined
      ) {
        const lat = Number(cardData.latitude);
        const lng = Number(cardData.longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          locationPoint = `(${lat},${lng})`;
        }
      }

      // Also update address fields in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          address: cardData.address || null,
          show_address_map: cardData.showAddressMap || false,
          location_coordinates: locationPoint
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

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

  const checkUrlAvailability = async (url: string) => {
    if (!url || !user) {
      setUrlAvailable(null);
      setUrlRestrictionReason(null);
      return;
    }

    setCheckingUrl(true);
    try {
      // First check if the username is restricted
      const { data: restrictedData, error: restrictedError } = await supabase
        .from('restricted_usernames')
        .select('username, reason')
        .ilike('username', url)
        .maybeSingle();

      if (restrictedError && restrictedError.code !== 'PGRST116') {
        console.error('Error checking restricted usernames:', restrictedError);
      }

      if (restrictedData) {
        setUrlAvailable(false);
        setUrlRestrictionReason(restrictedData.reason || 'This username is restricted');
        return;
      }

      // Then check if the URL is already taken
      const { data, error } = await supabase
        .from('digital_cards')
        .select('id, owner_user_id')
        .eq('vanity_url', url)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // URL is available if no record exists OR if the record belongs to current user
      const isAvailable = !data || data.owner_user_id === user.id;
      setUrlAvailable(isAvailable);
      setUrlRestrictionReason(null);
    } catch (error) {
      console.error('Error checking URL:', error);
      setUrlAvailable(null);
      setUrlRestrictionReason(null);
    } finally {
      setCheckingUrl(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (cardData.vanityUrl) {
        checkUrlAvailability(cardData.vanityUrl);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [cardData.vanityUrl, user]);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setCardData({ ...cardData, avatarUrl: publicUrl });

      toast({
        title: "Avatar uploaded!",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setCardData({ ...cardData, languages: [...cardData.languages, newLanguage.trim()] });
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    setCardData({ ...cardData, languages: cardData.languages.filter(l => l !== lang) });
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setCardData({ ...cardData, interests: [...cardData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setCardData({ ...cardData, interests: cardData.interests.filter(i => i !== interest) });
  };
  
  // Custom link handlers
  const handleAddCustomLink = () => {
    if (!newCustomLink.title.trim() || !newCustomLink.url.trim()) {
      toast({
        title: "Error",
        description: "Please provide at least a title and URL",
        variant: "destructive"
      });
      return;
    }
    
    if (editingLinkIndex !== null) {
      const updated = [...cardData.customLinks];
      updated[editingLinkIndex] = newCustomLink;
      setCardData({ ...cardData, customLinks: updated });
      setEditingLinkIndex(null);
    } else {
      setCardData({ ...cardData, customLinks: [...cardData.customLinks, newCustomLink] });
    }
    
    setNewCustomLink({ title: '', url: '', description: '', previewImage: '', groupId: '' });
    toast({
      title: "Success!",
      description: editingLinkIndex !== null ? "Link updated" : "Link added",
    });
  };

  const addLinkGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = { id: Date.now().toString(), name: newGroupName };
    setCardData({ ...cardData, linkGroups: [...(cardData.linkGroups || []), newGroup] });
    setNewGroupName('');
    toast({ title: "Group created!", description: `"${newGroupName}" added` });
  };

  const deleteLinkGroup = (groupId: string) => {
    setCardData({ 
      ...cardData, 
      linkGroups: (cardData.linkGroups || []).filter(g => g.id !== groupId),
      customLinks: cardData.customLinks.map(link => 
        link.groupId === groupId ? { ...link, groupId: '' } : link
      )
    });
    toast({ title: "Group deleted" });
  };
  
  const handleEditCustomLink = (index: number) => {
    setNewCustomLink(cardData.customLinks[index]);
    setEditingLinkIndex(index);
  };
  
  const handleDeleteCustomLink = (index: number) => {
    setCardData({
      ...cardData,
      customLinks: cardData.customLinks.filter((_, i) => i !== index)
    });
    toast({
      title: "Link deleted",
      description: "The custom link has been removed",
    });
  };

  // Add this function to fetch link preview metadata
  const fetchLinkPreview = async (url: string) => {
    if (!url || !url.startsWith('http')) return;
    
    setFetchingLinkPreview(true);
    try {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        setNewCustomLink(prev => ({
          ...prev,
          title: prev.title || data.data.title || '',
          description: prev.description || data.data.description || '',
          previewImage: prev.previewImage || data.data.image?.url || data.data.logo?.url || ''
        }));
        
        toast({
          title: "Preview loaded!",
          description: "Link preview has been automatically filled",
        });
      }
    } catch (error) {
      console.error('Error fetching link preview:', error);
      toast({
        title: "Could not fetch preview",
        description: "Please add details manually",
        variant: "destructive"
      });
    } finally {
      setFetchingLinkPreview(false);
    }
  };

  // Add debounced URL check for automatic preview
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (newCustomLink.url && newCustomLink.url.startsWith('http') && !newCustomLink.title && editingLinkIndex === null) {
        fetchLinkPreview(newCustomLink.url);
      }
    }, 1500);

    return () => clearTimeout(debounce);
  }, [newCustomLink.url, newCustomLink.title, editingLinkIndex]);
  
  const handleLinkImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingLinkImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/link-previews/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setNewCustomLink({ ...newCustomLink, previewImage: publicUrl });

      toast({
        title: "Image uploaded!",
        description: "Preview image has been added.",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingLinkImage(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'avatar':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Profile Picture</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Upload your profile picture
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={cardData.avatarUrl} />
                <AvatarFallback className="text-3xl">
                  {cardData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>

              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" disabled={uploadingAvatar} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              <p className="text-xs text-muted-foreground text-center">
                Recommended: Square image, at least 400x400px
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="vanity-url">Card URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">cardcraft.me/</span>
                  <Input
                    id="vanity-url"
                    value={cardData.vanityUrl}
                    onChange={(e) => setCardData({ ...cardData, vanityUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    placeholder="your-name"
                    className={
                      cardData.vanityUrl && urlAvailable === false
                        ? 'border-red-500 focus:border-red-500'
                        : cardData.vanityUrl && urlAvailable === true
                        ? 'border-green-500 focus:border-green-500'
                        : ''
                    }
                  />
                </div>
                {checkingUrl && (
                  <p className="text-xs text-muted-foreground mt-1">Checking availability...</p>
                )}
                {!checkingUrl && cardData.vanityUrl && urlAvailable === false && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {urlRestrictionReason 
                      ? `✗ "${cardData.vanityUrl}" is restricted: ${urlRestrictionReason}`
                      : `✗ "${cardData.vanityUrl}" is already taken`
                    }
                  </p>
                )}
                {!checkingUrl && cardData.vanityUrl && urlAvailable === true && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ✓ "{cardData.vanityUrl}" is available
                  </p>
                )}
                {!cardData.vanityUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be your unique card URL
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">About</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Tell people about yourself
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={cardData.fullName}
                  onChange={(e) => setCardData({ ...cardData, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={cardData.jobTitle}
                  onChange={(e) => setCardData({ ...cardData, jobTitle: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={cardData.company}
                  onChange={(e) => setCardData({ ...cardData, company: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={cardData.location}
                  onChange={(e) => setCardData({ ...cardData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={cardData.about}
                  onChange={(e) => setCardData({ ...cardData, about: e.target.value })}
                  placeholder="Tell your story..."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="pronunciation">Name Pronunciation</Label>
                <Input
                  id="pronunciation"
                  value={cardData.pronunciation}
                  onChange={(e) => setCardData({ ...cardData, pronunciation: e.target.value })}
                  placeholder="jon doh"
                />
              </div>

              <div>
                <Label htmlFor="pronoun">Pronouns</Label>
                <Input
                  id="pronoun"
                  value={cardData.pronoun}
                  onChange={(e) => setCardData({ ...cardData, pronoun: e.target.value })}
                  placeholder="he/him"
                />
              </div>

              <div>
                <Label>Languages</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language"
                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                  />
                  <Button onClick={addLanguage} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cardData.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="gap-1">
                      {lang}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeLanguage(lang)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={cardData.email}
                  onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={cardData.phone}
                  onChange={(e) => setCardData({ ...cardData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="contactForm">Contact Form URL</Label>
                <Input
                  id="contactForm"
                  type="url"
                  value={cardData.contactForm}
                  onChange={(e) => setCardData({ ...cardData, contactForm: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="calendar">Calendar Booking URL</Label>
                <Input
                  id="calendar"
                  type="url"
                  value={cardData.calendar}
                  onChange={(e) => setCardData({ ...cardData, calendar: e.target.value })}
                  placeholder="https://calendly.com/..."
                />
              </div>

              {/* Address Section moved to Location tab */}
            </div>
          </div>
        );

      case 'verified':
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
                icon: platform.name,
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

      case 'wallet':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Methods</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Add your payment links
              </p>
            </div>

            {/* UPI ID Section */}
            <div className="space-y-4 pb-6 border-b">
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={cardData.upiId}
                  onChange={(e) => setCardData({ ...cardData, upiId: e.target.value })}
                  placeholder="yourname@upi"
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your primary UPI payment ID
                </p>
              </div>
            </div>

            {/* Other Payment Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Other Payment Links</h3>
              <div className="space-y-5">
                {paymentPlatforms.map((platform) => {
                  const existingLink = cardData.paymentLinks.find(
                    (l) => l.platform === platform.name
                  );

                  return (
                    <div
                      key={platform.name}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 hover:bg-gray-100 p-3 rounded-xl shadow-sm transition-all"
                    >
                      {/* Label with Icon */}
                      <Label className="flex items-center gap-2 text-gray-700 font-medium">
                        <span className="text-xl">{platform.icon}</span>
                        <span>{platform.name}</span>
                      </Label>

                      {/* Input Field */}
                      <Input
                        value={existingLink?.url || ""}
                        onChange={(e) => {
                          const newLinks = cardData.paymentLinks.filter(
                            (l) => l.platform !== platform.name
                          );
                          if (e.target.value) {
                            newLinks.push({
                              platform: platform.name,
                              url: e.target.value,
                              icon: platform.name,
                            });
                          }
                          setCardData({ ...cardData, paymentLinks: newLinks });
                        }}
                        placeholder={`Enter your ${platform.name} link`}
                        className="w-full sm:w-2/3 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-100 transition"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Location</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Set your address, map, and precise coordinates
              </p>
            </div>

            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={cardData.address || ''}
                  onChange={(e) => setCardData({ ...cardData, address: e.target.value })}
                  placeholder="Building Number 21, Infocity, Chandaka Industrial Estate, Patia, Odisha, Bhubaneswar, 751024"
                  className="min-h-[60px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your complete business address
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Show map on profile</Label>
                  <p className="text-xs text-muted-foreground">
                    Display an interactive map with your location
                  </p>
                </div>
                <Switch
                  checked={cardData.showAddressMap || false}
                  onCheckedChange={(checked) => setCardData({ ...cardData, showAddressMap: checked })}
                  disabled={!cardData.address && !cardData.latitude && !cardData.longitude && !cardData.mapUrl}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Location Coordinates (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        toast({ title: 'Not Supported', description: 'Geolocation is not supported by your browser', variant: 'destructive' });
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = Number(pos.coords.latitude.toFixed(6));
                          const lng = Number(pos.coords.longitude.toFixed(6));
                          setCardData({ ...cardData, latitude: lat, longitude: lng });
                          toast({ title: 'Location Fetched', description: 'Device location captured' });
                        },
                        (err) => {
                          toast({ title: 'Error', description: err.message || 'Failed to get your location', variant: 'destructive' });
                        },
                        { enableHighAccuracy: true }
                      );
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Use My Location
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={cardData.latitude ?? ''}
                      onChange={(e) => setCardData({ ...cardData, latitude: e.target.value === '' ? null : Number(e.target.value) })}
                      placeholder="e.g., 20.296059"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={cardData.longitude ?? ''}
                      onChange={(e) => setCardData({ ...cardData, longitude: e.target.value === '' ? null : Number(e.target.value) })}
                      placeholder="e.g., 85.824539"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add precise coordinates if the map shows incorrect location.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapUrl" className="text-sm font-medium">Google Maps URL (Optional)</Label>
                <Input
                  id="mapUrl"
                  type="url"
                  value={cardData.mapUrl || ''}
                  onChange={(e) => setCardData({ ...cardData, mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                />
                <p className="text-xs text-muted-foreground">
                  Provide a Google Maps link if you prefer a specific place URL.
                </p>
              </div>

            </div>
          </div>
        );

          

      case 'links':
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Custom Links</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Add custom links and organize them into groups
        </p>
      </div>

      {/* Link Groups Management */}
      <div className="space-y-3 p-4 border rounded-lg">
        <h3 className="font-semibold text-sm">Link Groups</h3>
        <div className="flex gap-2">
          <Input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g., Social Media, Products"
            onKeyPress={(e) => e.key === 'Enter' && addLinkGroup()}
          />
          <Button onClick={addLinkGroup} size="icon" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(cardData.linkGroups || []).map(group => (
            <Badge key={group.id} variant="secondary" className="gap-1">
              {group.name}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => deleteLinkGroup(group.id)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Add/Edit Link Form */}
      <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
        <div>
          <Label htmlFor="link-group">Assign to Group (Optional)</Label>
          <select
            id="link-group"
            value={newCustomLink.groupId || ''}
            onChange={(e) => setNewCustomLink({ ...newCustomLink, groupId: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="">No Group</option>
            {(cardData.linkGroups || []).map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="link-url">URL *</Label>
          <div className="relative">
            <Input
              id="link-url"
              type="url"
              value={newCustomLink.url}
              onChange={(e) => setNewCustomLink({ ...newCustomLink, url: e.target.value })}
              placeholder="https://example.com"
              className="pr-10"
            />
            {fetchingLinkPreview && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {fetchingLinkPreview 
              ? "Fetching preview..." 
              : "Paste a URL and we'll automatically fetch the preview"
            }
          </p>
          {newCustomLink.url && !fetchingLinkPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchLinkPreview(newCustomLink.url)}
              className="mt-2"
              type="button"
            >
              <Eye className="w-3 h-3 mr-1" />
              Refresh Preview
            </Button>
          )}
        </div>

        <div>
          <Label htmlFor="link-title">Link Title *</Label>
          <Input
            id="link-title"
            value={newCustomLink.title}
            onChange={(e) => setNewCustomLink({ ...newCustomLink, title: e.target.value })}
            placeholder="e.g., My Portfolio"
          />
        </div>

        <div>
          <Label htmlFor="link-description">Description (Optional)</Label>
          <Textarea
            id="link-description"
            value={newCustomLink.description}
            onChange={(e) => setNewCustomLink({ ...newCustomLink, description: e.target.value })}
            placeholder="A brief description about this link"
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Preview Image</Label>
          <div className="flex gap-2">
            <Input
              value={newCustomLink.previewImage}
              onChange={(e) => setNewCustomLink({ ...newCustomLink, previewImage: e.target.value })}
              placeholder="Image URL or upload below"
            />
            <Label htmlFor="link-image-upload" className="cursor-pointer">
              <Button variant="outline" disabled={uploadingLinkImage} asChild type="button">
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingLinkImage ? 'Uploading...' : 'Upload'}
                </span>
              </Button>
            </Label>
            <Input
              id="link-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLinkImageUpload}
            />
          </div>
          {newCustomLink.previewImage && (
            <div className="relative inline-block mt-2">
              <img 
                src={newCustomLink.previewImage} 
                alt="Preview" 
                className="w-full max-w-[200px] h-auto object-cover rounded-md border border-border"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => setNewCustomLink({ ...newCustomLink, previewImage: '' })}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        <Button onClick={handleAddCustomLink} className="w-full" type="button">
          <Plus className="w-4 h-4 mr-2" />
          {editingLinkIndex !== null ? 'Update Link' : 'Add Link'}
        </Button>
        
        {editingLinkIndex !== null && (
          <Button 
            variant="outline" 
            type="button"
            onClick={() => {
              setEditingLinkIndex(null);
              setNewCustomLink({ title: '', url: '', description: '', previewImage: '', groupId: '' });
            }}
            className="w-full"
          >
            Cancel Edit
          </Button>
        )}
      </div>

      {/* Existing Links List */}
      {cardData.customLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Your Custom Links</h3>
          {cardData.customLinks.map((link, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors">
              {link.previewImage && (
                <img 
                  src={link.previewImage} 
                  alt={link.title}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{link.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                {link.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{link.description}</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditCustomLink(index)}
                  className="h-8 w-8"
                  type="button"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteCustomLink(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

      case 'interests':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Interests</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Share your interests and hobbies
              </p>
            </div>

            <div>
              <Label>Add Interests</Label>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="e.g., Photography, Travel"
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button onClick={addInterest} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cardData.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Achievements</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Add your certifications and achievements
              </p>
            </div>

            {/* Add/Edit Achievement Form */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="achievement-title">Achievement Title *</Label>
                <Input
                  id="achievement-title"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
              </div>

              <div>
                <Label htmlFor="achievement-issuer">Issuer *</Label>
                <Input
                  id="achievement-issuer"
                  value={newAchievement.issuer}
                  onChange={(e) => setNewAchievement({ ...newAchievement, issuer: e.target.value })}
                  placeholder="e.g., Amazon Web Services"
                />
              </div>

              <div>
                <Label htmlFor="achievement-date">Date *</Label>
                <Input
                  id="achievement-date"
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="achievement-url">Verification URL (Optional)</Label>
                <Input
                  id="achievement-url"
                  type="url"
                  value={newAchievement.url}
                  onChange={(e) => setNewAchievement({ ...newAchievement, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <Button
                onClick={() => {
                  if (!newAchievement.title || !newAchievement.issuer || !newAchievement.date) {
                    toast({
                      title: "Error",
                      description: "Please fill in all required fields",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  if (editingAchievementIndex !== null) {
                    const updated = [...cardData.achievements];
                    updated[editingAchievementIndex] = newAchievement;
                    setCardData({ ...cardData, achievements: updated });
                    setEditingAchievementIndex(null);
                  } else {
                    setCardData({ ...cardData, achievements: [...cardData.achievements, newAchievement] });
                  }
                  
                  setNewAchievement({ title: '', issuer: '', date: '', url: '' });
                  toast({
                    title: "Success!",
                    description: editingAchievementIndex !== null ? "Achievement updated" : "Achievement added",
                  });
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingAchievementIndex !== null ? 'Update Achievement' : 'Add Achievement'}
              </Button>
              
              {editingAchievementIndex !== null && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingAchievementIndex(null);
                    setNewAchievement({ title: '', issuer: '', date: '', url: '' });
                  }}
                  className="w-full"
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            {/* Existing Achievements - with Drag and Drop */}
            {cardData.achievements.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Your Achievements</h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event: DragEndEvent) => {
                    const { active, over } = event;
                    if (over && active.id !== over.id) {
                      const oldIndex = cardData.achievements.findIndex((_, i) => i.toString() === active.id);
                      const newIndex = cardData.achievements.findIndex((_, i) => i.toString() === over.id);
                      setCardData({ ...cardData, achievements: arrayMove(cardData.achievements, oldIndex, newIndex) });
                    }
                  }}
                >
                  <SortableContext
                    items={cardData.achievements.map((_, i) => i.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    {cardData.achievements.map((achievement, index) => (
                      <SortableItem key={index} id={index.toString()}>
                        <div className="flex-1 flex items-start gap-3 p-3 border border-border rounded-lg bg-card">
                          <Award className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground">{achievement.issuer} • {achievement.date}</p>
                            {achievement.url && (
                              <a href={achievement.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                View Certificate
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setNewAchievement(achievement);
                                setEditingAchievementIndex(index);
                              }}
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setCardData({
                                  ...cardData,
                                  achievements: cardData.achievements.filter((_, i) => i !== index)
                                });
                                toast({ title: "Achievement deleted" });
                              }}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Testimonials</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Add recommendations and testimonials
              </p>
            </div>

            {/* Add/Edit Testimonial Form */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="testimonial-name">Person Name *</Label>
                <Input
                  id="testimonial-name"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  placeholder="e.g., Jane Smith"
                />
              </div>

              <div>
                <Label htmlFor="testimonial-role">Role/Position *</Label>
                <Input
                  id="testimonial-role"
                  value={newTestimonial.role}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                  placeholder="e.g., CEO at Tech Corp"
                />
              </div>

              <div>
                <Label htmlFor="testimonial-content">What they said *</Label>
                <Textarea
                  id="testimonial-content"
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                  placeholder="The testimonial content..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="testimonial-social">Social Media Link (Optional)</Label>
                <Input
                  id="testimonial-social"
                  type="url"
                  value={newTestimonial.socialUrl}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, socialUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link to their LinkedIn, Twitter, etc where this testimonial was given
                </p>
              </div>

              <div className="space-y-2">
                <Label>Profile Picture (Optional)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={newTestimonial.avatar}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, avatar: e.target.value })}
                    placeholder="Image URL or upload below"
                  />
                  <Label htmlFor="testimonial-avatar-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={uploadingTestimonialAvatar} asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingTestimonialAvatar ? 'Uploading...' : 'Upload'}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="testimonial-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;

                      setUploadingTestimonialAvatar(true);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${user.id}/testimonials/${Math.random()}.${fileExt}`;

                        const { error: uploadError } = await supabase.storage
                          .from('avatars')
                          .upload(fileName, file);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                          .from('avatars')
                          .getPublicUrl(fileName);

                        setNewTestimonial({ ...newTestimonial, avatar: publicUrl });

                        toast({
                          title: "Image uploaded!",
                          description: "Avatar has been added.",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Upload failed",
                          description: error.message,
                          variant: "destructive"
                        });
                      } finally {
                        setUploadingTestimonialAvatar(false);
                      }
                    }}
                  />
                </div>
                {newTestimonial.avatar && (
                  <img 
                    src={newTestimonial.avatar} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border border-border mt-2"
                  />
                )}
              </div>

              <Button
                onClick={() => {
                  if (!newTestimonial.name || !newTestimonial.role || !newTestimonial.content) {
                    toast({
                      title: "Error",
                      description: "Please fill in all required fields",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  if (editingTestimonialIndex !== null) {
                    const updated = [...cardData.testimonials];
                    updated[editingTestimonialIndex] = newTestimonial;
                    setCardData({ ...cardData, testimonials: updated });
                    setEditingTestimonialIndex(null);
                  } else {
                    setCardData({ ...cardData, testimonials: [...cardData.testimonials, newTestimonial] });
                  }
                  
                  setNewTestimonial({ name: '', role: '', content: '', avatar: '', socialUrl: '' });
                  toast({
                    title: "Success!",
                    description: editingTestimonialIndex !== null ? "Testimonial updated" : "Testimonial added",
                  });
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingTestimonialIndex !== null ? 'Update Testimonial' : 'Add Testimonial'}
              </Button>
              
              {editingTestimonialIndex !== null && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingTestimonialIndex(null);
                    setNewTestimonial({ name: '', role: '', content: '', avatar: '', socialUrl: '' });
                  }}
                  className="w-full"
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            {/* Existing Testimonials - with Drag and Drop */}
            {cardData.testimonials.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Your Testimonials</h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event: DragEndEvent) => {
                    const { active, over } = event;
                    if (over && active.id !== over.id) {
                      const oldIndex = cardData.testimonials.findIndex((_, i) => i.toString() === active.id);
                      const newIndex = cardData.testimonials.findIndex((_, i) => i.toString() === over.id);
                      setCardData({ ...cardData, testimonials: arrayMove(cardData.testimonials, oldIndex, newIndex) });
                    }
                  }}
                >
                  <SortableContext
                    items={cardData.testimonials.map((_, i) => i.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    {cardData.testimonials.map((testimonial, index) => (
                      <SortableItem key={index} id={index.toString()}>
                        <div className="flex-1 flex gap-3 p-3 border border-border rounded-lg bg-card">
                          {testimonial.avatar && (
                            <img 
                              src={testimonial.avatar} 
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <h4 className="font-medium text-sm">{testimonial.name}</h4>
                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground italic line-clamp-3">"{testimonial.content}"</p>
                            {testimonial.socialUrl && (
                              <a href={testimonial.socialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                                View on social media
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setNewTestimonial(testimonial);
                                setEditingTestimonialIndex(index);
                              }}
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setCardData({
                                  ...cardData,
                                  testimonials: cardData.testimonials.filter((_, i) => i !== index)
                                });
                                toast({ title: "Testimonial deleted" });
                              }}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gallery</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Add videos, photos, and audio to showcase your work
              </p>
            </div>

            <div className="space-y-6">
              {/* Video Introduction */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Video Introduction</h3>
                </div>
                <div>
                  <Label htmlFor="video-upload">Upload Video or Paste URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="video-url"
                      type="url"
                      value={cardData.videoIntro}
                      onChange={(e) => setCardData({ ...cardData, videoIntro: e.target.value })}
                      placeholder="Paste video URL or upload below"
                      readOnly={uploadingMedia}
                    />
                    <Label htmlFor="video-file-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={uploadingMedia} asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingMedia ? 'Uploading...' : 'Upload'}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="video-file-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !user) return;

                        setUploadingMedia(true);
                        try {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${user.id}/videos/${Math.random()}.${fileExt}`;

                          const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(fileName, file);

                          if (uploadError) throw uploadError;

                          const { data: { publicUrl } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(fileName);

                          setCardData({ ...cardData, videoIntro: publicUrl });

                          toast({
                            title: "Video uploaded!",
                            description: "Video has been added.",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Upload failed",
                            description: error.message,
                            variant: "destructive"
                          });
                        } finally {
                          setUploadingMedia(false);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a video file or paste a URL
                  </p>
                </div>
                {cardData.videoIntro && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden scrollbar-thin">
                    {cardData.videoIntro.includes('youtube') || cardData.videoIntro.includes('vimeo') ? (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    ) : (
                      <video src={cardData.videoIntro} controls className="w-full h-full" />
                    )}
                  </div>
                )}
              </div>

              {/* Audio Pronunciation */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Audio Pronunciation</h3>
                </div>
                <div>
                  <Label htmlFor="audio-upload">Upload Audio File</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cardData.audioPronunciation}
                      onChange={(e) => setCardData({ ...cardData, audioPronunciation: e.target.value })}
                      placeholder="Audio URL or upload below"
                      readOnly={uploadingMedia}
                    />
                    <Label htmlFor="audio-file-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={uploadingMedia} asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingMedia ? 'Uploading...' : 'Upload'}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="audio-file-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !user) return;

                        setUploadingMedia(true);
                        try {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${user.id}/audio/${Math.random()}.${fileExt}`;

                          const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(fileName, file);

                          if (uploadError) throw uploadError;

                          const { data: { publicUrl } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(fileName);

                          setCardData({ ...cardData, audioPronunciation: publicUrl });

                          toast({
                            title: "Audio uploaded!",
                            description: "Pronunciation has been added.",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Upload failed",
                            description: error.message,
                            variant: "destructive"
                          });
                        } finally {
                          setUploadingMedia(false);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Record how to pronounce your name (MP3, WAV)
                  </p>
                </div>
                {cardData.audioPronunciation && (
                  <audio controls className="w-full">
                    <source src={cardData.audioPronunciation} />
                    Your browser does not support audio playback.
                  </audio>
                )}
              </div>

              {/* Photos Section */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Photos ({cardData.photos.length}/5)</h3>
                  </div>
                </div>
                
            <div className="space-y-3">
              <div>
                <Label htmlFor="photo-caption">Photo Caption (Optional)</Label>
                <Input
                  id="photo-caption"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="Add a caption for this photo"
                />
              </div>
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <Button variant="outline" disabled={uploadingPhoto || cardData.photos.length >= 5} asChild className="w-full">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingPhoto ? 'Uploading...' : cardData.photos.length >= 5 ? 'Maximum 5 photos' : 'Upload Photo'}
                  </span>
                </Button>
              </Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;

                  // Check photo limit
                  if (cardData.photos.length >= 5) {
                    toast({
                      title: "Upload limit reached",
                      description: "Maximum 5 photos allowed",
                      variant: "destructive"
                    });
                    return;
                  }

                  setUploadingPhoto(true);
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}/photos/${Math.random()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                      .from('avatars')
                      .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                      .from('avatars')
                      .getPublicUrl(fileName);

                    const newPhoto: Photo = {
                      id: Math.random().toString(),
                      url: publicUrl,
                      caption: newPhotoCaption
                    };

                    setCardData({ ...cardData, photos: [...cardData.photos, newPhoto] });
                    setNewPhotoCaption('');

                    toast({
                      title: "Photo uploaded!",
                      description: `Photo ${cardData.photos.length + 1}/5 added to your gallery.`,
                    });
                  } catch (error: any) {
                    toast({
                      title: "Upload failed",
                      description: error.message,
                      variant: "destructive"
                    });
                  } finally {
                    setUploadingPhoto(false);
                  }
                }}
              />
            </div>

            {/* Photo Gallery */}
            {cardData.photos.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-medium text-sm">Your Photos</h4>
                <div className="grid grid-cols-2 gap-3">
                  {cardData.photos.map((photo, index) => (
                    <div key={photo.id} className="relative group">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || 'Photo'}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setCardData({
                            ...cardData,
                            photos: cardData.photos.filter((_, i) => i !== index)
                          });
                          toast({ title: "Photo deleted" });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Customize your card appearance with templates and themes
              </p>
            </div>

            {/* Template Browse Button */}
            <div className="p-4 border border-border rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">Choose a Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse our gallery of professional templates
                  </p>
                </div>
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <Button 
                onClick={() => navigate('/templates')}
                className="w-full"
                variant="outline"
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Card Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {cardThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setCardData({ ...cardData, theme: theme.id })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      cardData.theme === theme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-full h-20 rounded-md mb-2 ${theme.preview}`}></div>
                    <p className="text-sm font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Customization */}
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-sm">Banner Customization</h3>
              <p className="text-xs text-muted-foreground">
                Customize your card header background
              </p>
              
              <div className="space-y-3">
                <Label>Banner Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={cardData.bannerType === 'gradient' || !cardData.bannerType ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCardData({ ...cardData, bannerType: 'gradient' })}
                  >
                    Gradient
                  </Button>
                  <Button
                    variant={cardData.bannerType === 'color' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCardData({ ...cardData, bannerType: 'color' })}
                  >
                    Color
                  </Button>
                  <Button
                    variant={cardData.bannerType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCardData({ ...cardData, bannerType: 'image' })}
                  >
                    Image
                  </Button>
                  <Button
                    variant={cardData.bannerType === 'blurred' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCardData({ ...cardData, bannerType: 'blurred' })}
                  >
                    Blurred
                  </Button>
                  <Button
                    variant={cardData.bannerType === 'pattern' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCardData({ ...cardData, bannerType: 'pattern' })}
                  >
                    Pattern
                  </Button>
                </div>

                {cardData.bannerType === 'color' && (
                  <div className="space-y-2">
                    <Label>Pick a Color</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setCardData({ ...cardData, bannerValue: color })}
                          className={`w-full aspect-square rounded-lg border-2 transition-all ${
                            cardData.bannerValue === color ? 'border-foreground scale-110' : 'border-border'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <Input
                      type="color"
                      value={cardData.bannerValue || '#3b82f6'}
                      onChange={(e) => setCardData({ ...cardData, bannerValue: e.target.value })}
                      className="w-full h-10"
                    />
                  </div>
                )}

                {cardData.bannerType === 'image' && (
                  <div className="space-y-2">
                    <Label>Banner Image URL</Label>
                    <Input
                      value={cardData.bannerValue || ''}
                      onChange={(e) => setCardData({ ...cardData, bannerValue: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL for your banner image
                    </p>
                  </div>
                )}

                {cardData.bannerType === 'blurred' && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Your profile photo will be used as a blurred background
                    </p>
                  </div>
                )}

                {cardData.bannerType === 'pattern' && (
                  <div className="space-y-2">
                    <Label>Pattern Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['dots', 'lines', 'waves', 'grid'].map((pattern) => (
                        <Button
                          key={pattern}
                          variant={cardData.bannerValue === pattern ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCardData({ ...cardData, bannerValue: pattern })}
                          className="capitalize"
                        >
                          {pattern}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom CSS */}
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Custom CSS (Advanced)</h3>
                <Badge variant="secondary">Pro</Badge>
              </div>
              <div>
                <Label htmlFor="custom-css">Custom CSS Code</Label>
                <Textarea
                  id="custom-css"
                  value={cardData.customCSS}
                  onChange={(e) => setCardData({ ...cardData, customCSS: e.target.value })}
                  placeholder=".card { background: linear-gradient(...); }"
                  className="min-h-[120px] font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add custom CSS to style your card (for advanced users)
                </p>
              </div>
            </div>
          </div>
        );

      case 'cardlayout':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Card Layout</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Control which cards appear and their order on your profile
              </p>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event: DragEndEvent) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                  const oldIndex = cardData.cardOrder.indexOf(active.id as string);
                  const newIndex = cardData.cardOrder.indexOf(over.id as string);
                  setCardData({ ...cardData, cardOrder: arrayMove(cardData.cardOrder, oldIndex, newIndex) });
                }
              }}
            >
              <SortableContext items={cardData.cardOrder} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {cardData.cardOrder.map((cardId) => {
                    const card = CARD_DEFINITIONS.find(c => c.id === cardId);
                    if (!card) return null;
                    const CardIcon = card.icon;
                    
                    return (
                      <SortableItem key={cardId} id={cardId}>
                        <div className="flex-1 flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div className="flex items-center gap-3">
                            <CardIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{card.label}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCardData({
                              ...cardData,
                              cardVisibility: {
                                ...cardData.cardVisibility,
                                [cardId]: !cardData.cardVisibility[cardId]
                              }
                            })}
                          >
                            {cardData.cardVisibility[cardId] ? 
                              <Eye className="w-4 h-4" /> : 
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            }
                          </Button>
                        </div>
                      </SortableItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <GripVertical className="w-4 h-4 inline mr-1" />
                Drag cards to reorder them. Use the eye icon to show/hide cards.
              </p>
            </div>
          </div>
        );

      case 'aiprofile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">AI Profile</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Enable AI chat and export your profile for AI assistants
              </p>
            </div>

            {/* Enable AI Toggle */}
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Enable Your AI</h3>
                  <p className="text-sm text-muted-foreground">Allow visitors to chat with your AI clone</p>
                </div>
                <Switch
                  checked={aiEnabled}
                  onCheckedChange={handleAIToggle}
                />
              </div>
            </div>

            {aiEnabled && (
              <div className="p-4 border border-green-500/20 rounded-lg bg-green-500/5">
                <p className="text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>AI is enabled! Visitors can now chat with your AI at <code className="text-xs bg-muted px-1 rounded">/{cardData.vanityUrl}/ai</code></span>
                </p>
              </div>
            )}

            <hr className="my-6" />

            {/* Collapsible AI Profile Builder */}
            <div>
              <button
                onClick={() => setAiProfileExpanded(!aiProfileExpanded)}
                className="w-full flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">AI Profile Builder</h3>
                </div>
                <ChevronLeft className={`w-5 h-5 transition-transform ${aiProfileExpanded ? '-rotate-90' : 'rotate-0'}`} />
              </button>

              {aiProfileExpanded && (
                <div className="mt-4 space-y-6 animate-fade-in">
                  <div className="p-6 border border-border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a custom AI prompt that tells chatbots like ChatGPT, Claude, Gemini, and Perplexity exactly who you are. This helps AI assistants provide more personalized and relevant responses.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Tailored AI responses based on your background and expertise</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>No need to repeat yourself in every conversation</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Better recommendations aligned with your interests</span>
                      </div>
                    </div>
                  </div>

                  {/* Generated AI Prompt */}
                  <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Your AI Profile Prompt</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const aiPrompt = `I'm ${cardData.fullName || 'a user'}, ${cardData.jobTitle || 'professional'}${cardData.company ? ` at ${cardData.company}` : ''}. ${cardData.about || ''}\n\nMy background:\n- Location: ${cardData.location || 'Not specified'}\n- Languages: ${cardData.languages.join(', ') || 'Not specified'}\n- Interests: ${cardData.interests.join(', ') || 'Not specified'}\n\n${cardData.achievements.length > 0 ? `Achievements:\n${cardData.achievements.map(a => `- ${a.title} from ${a.issuer} (${a.date})`).join('\n')}\n\n` : ''}When assisting me, please consider my background, expertise, and interests to provide personalized and relevant responses. You can view my full profile at: patra.me/${cardData.vanityUrl || 'username'}`;
                          
                          navigator.clipboard.writeText(aiPrompt);
                          toast({
                            title: "Copied!",
                            description: "AI profile prompt copied to clipboard. Paste it into any AI chatbot!",
                          });
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Prompt
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-sm overflow-auto scrollbar-thin max-h-96 whitespace-pre-wrap">
{`I'm ${cardData.fullName || 'a user'}, ${cardData.jobTitle || 'professional'}${cardData.company ? ` at ${cardData.company}` : ''}. ${cardData.about || ''}

My background:
- Location: ${cardData.location || 'Not specified'}
- Languages: ${cardData.languages.join(', ') || 'Not specified'}
- Interests: ${cardData.interests.join(', ') || 'Not specified'}

${cardData.achievements.length > 0 ? `Achievements:
${cardData.achievements.map(a => `- ${a.title} from ${a.issuer} (${a.date})`).join('\n')}

` : ''}When assisting me, please consider my background, expertise, and interests to provide personalized and relevant responses. You can view my full profile at: patra.me/${cardData.vanityUrl || 'username'}`}
                    </div>
                  </div>

                  {/* How to Use */}
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <h4 className="font-semibold text-sm mb-3">How to use:</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">1.</span>
                        <span>Click "Copy Prompt" above to copy your AI profile to clipboard</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">2.</span>
                        <span>Open your preferred AI chatbot (ChatGPT, Claude, Gemini, Perplexity)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">3.</span>
                        <span>Paste the prompt at the start of your conversation</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">4.</span>
                        <span>Enjoy personalized AI responses tailored to your profile!</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              <Menu className="w-5 h-5" />
            </Button>
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
      <div className="flex-1 flex overflow-hidden scrollbar-thin">
        <div className="flex flex-1 overflow-hidden relative scrollbar-thin">
          {/* Sidebar */}
          <aside
            className={`
              transition-all duration-300 border-r border-border bg-card flex flex-col flex-shrink-0 
              scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
              ${isMobile 
                ? (sidebarOpen ? 'w-full absolute inset-y-0 left-0 z-30' : 'hidden') 
                : (sidebarOpen ? 'w-full max-w-[450px] absolute inset-y-0 left-0 z-30' : 'hidden')
              }
            `}
            style={{ 
              overflowY: sidebarOpen ? 'auto' : 'hidden',
              maxHeight: 'calc(100vh - 4rem)'
            }}
          >

            <div className={`p-4 border-b border-border ${!sidebarOpen && !isMobile ? 'hidden' : ''}`}>
              <div className="flex items-center justify-between">
                <h2 className={`font-semibold text-sm text-muted-foreground ${isMobile ? 'hidden' : ''}`}>
                  Sections
                </h2>
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="h-6 w-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isAIProfile = item.id === 'aiprofile';
                return (
                  <button
                    key={item.id}
                    data-tour={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left relative ${
                      activeSection === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    } ${isAIProfile && aiEnabled ? 'overflow-hidden' : ''}`}
                  >
                    {/* Silver glow effect for AI Profile when enabled */}
                    {isAIProfile && aiEnabled && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                    <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                    <span className="font-medium text-sm relative z-10">
                      {item.label}
                    </span>
                  </button>
                );
              })}
              
              {/* Divider/Spacer before redirection buttons */}
              {sidebarOpen && cardData.vanityUrl && (
                <div className="relative py-3 flex items-center justify-center">
                  <hr className="absolute inset-x-0 border-border" />
                  <div className="relative h-10" />
                </div>
              )}
              
              {/* Card, Analytics and Profile buttons */}
              {sidebarOpen && cardData.vanityUrl && (
                <>
                  <button
                    onClick={() => window.open(`/${cardData.vanityUrl}?card`, '_blank')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left hover:bg-muted"
                  >
                    <CreditCard className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">Card</span>
                  </button>
                  
                  <button
                    onClick={() => window.open('/analytics', '_blank')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left hover:bg-muted"
                  >
                    <ExternalLink className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">Analytics</span>
                  </button>
                  
                  <button
                    onClick={() => window.open(`/${cardData.vanityUrl}`, '_blank')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left hover:bg-muted"
                  >
                    <Eye className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">Profile</span>
                  </button>
                  
                  {/* Card URL display with copy button */}
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30">
                      <span className="text-sm flex-1 truncate font-mono">
                        patra.me/{cardData.vanityUrl}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={handleCopyUrl}
                        title="Copy URL"
                      >
                        {copiedUrl ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </nav>

          </aside>

          {/* Input Panel */}
          <main
            className={`overflow-y-auto p-4 md:p-6 transition-all duration-300 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent bg-card border-r border-border
              ${isMobile 
                ? (showMobilePreview ? 'hidden' : 'w-full')
                : (inputPanelOpen ? 'w-full max-w-[450px] absolute inset-y-0 left-0 z-20' : 'hidden')
              }`}
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          >
            {/* Back button */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToSidebar}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold capitalize">{activeSection}</h2>
            </div>
            {renderSection()}
          </main>
        </div>

        {/* Preview Column - Desktop/Tablet */}
        {!isMobile && (
          <aside 
            data-tour="preview"
            className={`flex-1 border-l border-border overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent ${
              cardData.theme === 'modern' ? 'bg-gradient-to-br from-gray-900 to-gray-800' :
              cardData.theme === 'vibrant' ? 'bg-gradient-to-br from-purple-400 to-pink-600' :
              cardData.theme === 'professional' ? 'bg-gradient-to-br from-slate-100 to-gray-200' :
              cardData.theme === 'minimal' ? 'bg-background' :
              'bg-muted/30'
            }`}
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Live Preview</div>
              </div>
              <CardPreviewNew cardData={{...cardData, aiEnabled}} onOpenPayment={() => setShowPaymentDialog(true)} showAIButton={true} />
            </div>
          </aside>
        )}

        {/* Preview Column - Mobile */}
        {isMobile && showMobilePreview && (
          <div className={`fixed inset-0 top-16 z-40 overflow-y-auto scrollbar-thin p-4 transition-transform duration-300 ${
            cardData.theme === 'modern' ? 'bg-gradient-to-br from-gray-900 to-gray-800' :
            cardData.theme === 'vibrant' ? 'bg-gradient-to-br from-purple-400 to-pink-600' :
            cardData.theme === 'professional' ? 'bg-gradient-to-br from-slate-100 to-gray-200' :
            cardData.theme === 'minimal' ? 'bg-background' :
            'bg-background'
          }`}>
            <CardPreviewNew cardData={{...cardData, aiEnabled}} onOpenPayment={() => setShowPaymentDialog(true)} showAIButton={true} />
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
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-card border-t border-border z-20">
          <Button onClick={() => handleSave()} disabled={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditorNew;

