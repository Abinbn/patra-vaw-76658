import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  User, 
  Briefcase, 
  Phone, 
  Verified,
  Wallet,
  Link,
  Heart,
  Image,
  Palette,
  Plus,
  X,
  Globe
} from 'lucide-react';
import { CardPreview } from '@/components/card-preview';
import { 
  FaGithub
} from "react-icons/fa";

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
}

interface CardData {
  // Personal
  fullName: string;
  about: string;
  dob: string;
  location: string;
  timezone: string;
  pronunciation: string;
  pronoun: string;
  languages: string[];
  
  // Professional
  jobTitle: string;
  company: string;
  
  // Contact
  email: string;
  phone: string;
  contactForm: string;
  calendar: string;
  
  // Verified Accounts
  socialLinks: SocialLink[];
  
  // Wallet
  paymentLinks: PaymentLink[];
  
  // Links
  customLinks: CustomLink[];
  
  // Interests
  interests: string[];
  
  // Photos (URLs)
  photos: string[];
  
  // Design
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

const socialPlatforms = [
  { name: 'GitHub', icon: <FaGithub className="text-lg" /> },
  { name: 'LinkedIn', icon: '💼' },
  { name: 'Twitter', icon: '🐦' },
  { name: 'Instagram', icon: '📷' },
  { name: 'Facebook', icon: '📘' },
  { name: 'YouTube', icon: '🎥' },
  { name: 'TikTok', icon: '🎵' },
  { name: 'Discord', icon: '🎮' },
  { name: 'WhatsApp', icon: '💬' },
  { name: 'Telegram', icon: '✈️' },
  { name: 'Reddit', icon: '🔴' },
  { name: 'Medium', icon: '✍️' },
  { name: 'Dribbble', icon: '🏀' },
  { name: 'Behance', icon: '🎨' },
  { name: 'Pinterest', icon: '📌' },
  { name: 'Twitch', icon: '🎮' },
];

const paymentPlatforms = [
  { name: 'PayPal', icon: '💰' },
  { name: 'Venmo', icon: '💸' },
  { name: 'CashApp', icon: '💵' },
  { name: 'Patreon', icon: '🎯' },
  { name: 'Bitcoin', icon: '₿' },
  { name: 'Ethereum', icon: 'Ξ' },
  { name: 'Litecoin', icon: 'Ł' },
  { name: 'Dogecoin', icon: 'Đ' },
];

export const Editor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setSaving] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    fullName: '',
    about: '',
    dob: '',
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    pronunciation: '',
    pronoun: '',
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
    interests: [],
    photos: [],
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    accentColor: '#3b82f6',
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' });
  const [newPaymentLink, setNewPaymentLink] = useState({ platform: '', url: '' });
  const [newCustomLink, setNewCustomLink] = useState({ title: '', url: '' });

  useEffect(() => {
    // Auto-detect timezone
    setCardData(prev => ({
      ...prev,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }));
    
    // Load existing profile and card data
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    if (!user) return;

    try {
      // Check localStorage for cached onboarding data first
      const cachedData = localStorage.getItem('patra-onboarding-data');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setCardData(prev => ({
            ...prev,
            fullName: parsed.fullName || prev.fullName,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
            jobTitle: parsed.jobTitle || prev.jobTitle,
            company: parsed.company || prev.company,
            about: parsed.bio || prev.about,
          }));
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, phone, bio, job_title, avatar_url, company_name')
        .eq('user_id', user.id)
        .single();

      // Load digital card data
      const { data: card } = await supabase
        .from('digital_cards')
        .select('content_json, vanity_url')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      // Ensure vanity URL exists - if not, create one
      if (card && !card.vanity_url) {
        const generateRandomUsername = () => {
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          const length = Math.random() > 0.5 ? 4 : 5;
          let username = '';
          for (let i = 0; i < length; i++) {
            username += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return username;
        };

        const newUsername = generateRandomUsername();
        await supabase
          .from('digital_cards')
          .update({ vanity_url: newUsername })
          .eq('owner_user_id', user.id);
      }

      if (profile || card) {
        const cardContent = card?.content_json as any || {};
        
        setCardData(prev => ({
          ...prev,
          fullName: profile?.display_name || prev.fullName,
          email: user.email || prev.email,
          phone: profile?.phone || cardContent.phone || prev.phone,
          jobTitle: profile?.job_title || cardContent.jobTitle || prev.jobTitle,
          company: profile?.company_name || cardContent.company || prev.company,
          about: profile?.bio || cardContent.bio || prev.about,
          // Load other card content if available
          socialLinks: cardContent.socialLinks || prev.socialLinks,
          paymentLinks: cardContent.paymentLinks || prev.paymentLinks,
          customLinks: cardContent.customLinks || prev.customLinks,
          interests: cardContent.interests || prev.interests,
          photos: cardContent.photos || prev.photos,
          languages: cardContent.languages || prev.languages,
          dob: cardContent.dob || prev.dob,
          location: cardContent.location || prev.location,
          pronunciation: cardContent.pronunciation || prev.pronunciation,
          pronoun: cardContent.pronoun || prev.pronoun,
          contactForm: cardContent.contactForm || prev.contactForm,
          calendar: cardContent.calendar || prev.calendar,
          backgroundColor: cardContent.backgroundColor || prev.backgroundColor,
          textColor: cardContent.textColor || prev.textColor,
          accentColor: cardContent.accentColor || prev.accentColor,
        }));

        toast({
          title: "Data loaded",
          description: "Your existing profile has been loaded.",
        });
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Check if card already exists
      const { data: existingCard } = await supabase
        .from('digital_cards')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (existingCard) {
        // Update existing card
        const { error } = await supabase
          .from('digital_cards')
          .update({
            title: cardData.fullName || 'My Digital Card',
            content_json: cardData as any,
          })
          .eq('id', existingCard.id);

        if (error) throw error;
      } else {
        // Create new card
        const { error } = await supabase
          .from('digital_cards')
          .insert({
            owner_user_id: user.id,
            title: cardData.fullName || 'My Digital Card',
            content_json: cardData as any,
            is_active: true,
            is_approved: false,
          });

        if (error) throw error;
      }

      // Also update profile with basic info
      await supabase
        .from('profiles')
        .update({
          display_name: cardData.fullName || null,
          phone: cardData.phone || null,
          bio: cardData.about || null,
          job_title: cardData.jobTitle || null,
          company_name: cardData.company || null,
        })
        .eq('user_id', user.id);

      toast({
        title: "Card Saved!",
        description: "Your digital business card has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving card:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save card. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !cardData.languages.includes(newLanguage.trim())) {
      setCardData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setCardData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !cardData.interests.includes(newInterest.trim())) {
      setCardData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setCardData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url.trim()) {
      const platform = socialPlatforms.find(p => p.name === newSocialLink.platform);
      setCardData(prev => ({
        ...prev,
        socialLinks: [...prev.socialLinks, {
          ...newSocialLink,
          icon: platform?.icon || '🌐'
        }]
      }));
      setNewSocialLink({ platform: '', url: '' });
    }
  };

  const removeSocialLink = (index: number) => {
    setCardData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const addPaymentLink = () => {
    if (newPaymentLink.platform && newPaymentLink.url.trim()) {
      const platform = paymentPlatforms.find(p => p.name === newPaymentLink.platform);
      setCardData(prev => ({
        ...prev,
        paymentLinks: [...prev.paymentLinks, {
          ...newPaymentLink,
          icon: platform?.icon || '💰'
        }]
      }));
      setNewPaymentLink({ platform: '', url: '' });
    }
  };

  const removePaymentLink = (index: number) => {
    setCardData(prev => ({
      ...prev,
      paymentLinks: prev.paymentLinks.filter((_, i) => i !== index)
    }));
  };

  const addCustomLink = () => {
    if (newCustomLink.title.trim() && newCustomLink.url.trim()) {
      setCardData(prev => ({
        ...prev,
        customLinks: [...prev.customLinks, newCustomLink]
      }));
      setNewCustomLink({ title: '', url: '' });
    }
  };

  const removeCustomLink = (index: number) => {
    setCardData(prev => ({
      ...prev,
      customLinks: prev.customLinks.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/editor')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Card Editor</h1>
                <p className="text-sm text-foreground-muted">Create your digital business card</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={loading} className="gap-2 btn-gradient">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Card'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="personal" className="text-xs">
                  <User className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="professional" className="text-xs">
                  <Briefcase className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs">
                  <Phone className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs">
                  <Verified className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="wallet" className="text-xs">
                  <Wallet className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="links" className="text-xs">
                  <Link className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="interests" className="text-xs">
                  <Heart className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Personal Tab */}
              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Tell people about yourself</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={user?.user_metadata?.username || ''}
                        disabled
                        className="bg-muted"
                        placeholder="Your username"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your unique username for your card URL
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={cardData.fullName}
                          onChange={(e) => setCardData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pronunciation">Pronunciation</Label>
                        <Input
                          id="pronunciation"
                          value={cardData.pronunciation}
                          onChange={(e) => setCardData(prev => ({ ...prev, pronunciation: e.target.value }))}
                          placeholder="How to pronounce your name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="about">About</Label>
                      <Textarea
                        id="about"
                        value={cardData.about}
                        onChange={(e) => setCardData(prev => ({ ...prev, about: e.target.value }))}
                        placeholder="Tell people about yourself..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={cardData.location}
                          onChange={(e) => setCardData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pronoun">Pronouns</Label>
                        <Input
                          id="pronoun"
                          value={cardData.pronoun}
                          onChange={(e) => setCardData(prev => ({ ...prev, pronoun: e.target.value }))}
                          placeholder="e.g., he/him, she/her, they/them"
                        />
                      </div>
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
                        <Button onClick={addLanguage} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cardData.languages.map((language) => (
                          <Badge key={language} variant="secondary" className="gap-1">
                            {language}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-destructive"
                              onClick={() => removeLanguage(language)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Professional Tab */}
              <TabsContent value="professional" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Professional Information
                    </CardTitle>
                    <CardDescription>Your work and career details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={cardData.jobTitle}
                        onChange={(e) => setCardData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        placeholder="Your job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        value={cardData.company}
                        onChange={(e) => setCardData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Where you work"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>How people can reach you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={cardData.email}
                          onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={cardData.phone}
                          onChange={(e) => setCardData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contactForm">Contact Form URL</Label>
                      <Input
                        id="contactForm"
                        value={cardData.contactForm}
                        onChange={(e) => setCardData(prev => ({ ...prev, contactForm: e.target.value }))}
                        placeholder="https://your-contact-form.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="calendar">Calendar Booking URL</Label>
                      <Input
                        id="calendar"
                        value={cardData.calendar}
                        onChange={(e) => setCardData(prev => ({ ...prev, calendar: e.target.value }))}
                        placeholder="https://calendly.com/yourname"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Tab */}
              <TabsContent value="social" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Verified className="w-5 h-5" />
                      Verified Accounts
                    </CardTitle>
                    <CardDescription>Your social media profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <select
                        value={newSocialLink.platform}
                        onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select platform</option>
                        {socialPlatforms.map((platform) => (
                          <option key={platform.name} value={platform.name}>
                            {platform.icon} {platform.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={newSocialLink.url}
                        onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="Profile URL"
                        className="flex-1"
                      />
                      <Button onClick={addSocialLink} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {cardData.socialLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>{link.icon}</span>
                            <span className="font-medium">{link.platform}</span>
                            <span className="text-sm text-foreground-muted">{link.url}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocialLink(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wallet Tab */}
              <TabsContent value="wallet" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Payment & Crypto
                    </CardTitle>
                    <CardDescription>Ways people can send you money</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <select
                        value={newPaymentLink.platform}
                        onChange={(e) => setNewPaymentLink(prev => ({ ...prev, platform: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select platform</option>
                        {paymentPlatforms.map((platform) => (
                          <option key={platform.name} value={platform.name}>
                            {platform.icon} {platform.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={newPaymentLink.url}
                        onChange={(e) => setNewPaymentLink(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="Payment URL or address"
                        className="flex-1"
                      />
                      <Button onClick={addPaymentLink} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {cardData.paymentLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>{link.icon}</span>
                            <span className="font-medium">{link.platform}</span>
                            <span className="text-sm text-foreground-muted truncate">{link.url}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePaymentLink(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="w-5 h-5" />
                      Custom Links
                    </CardTitle>
                    <CardDescription>Share your favorite links and resources</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newCustomLink.title}
                        onChange={(e) => setNewCustomLink(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Link title"
                      />
                      <Input
                        value={newCustomLink.url}
                        onChange={(e) => setNewCustomLink(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="URL"
                        className="flex-1"
                      />
                      <Button onClick={addCustomLink} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {cardData.customLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span className="font-medium">{link.title}</span>
                            <span className="text-sm text-foreground-muted">{link.url}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomLink(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Interests Tab */}
              <TabsContent value="interests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Interests & Hobbies
                    </CardTitle>
                    <CardDescription>Share what you're passionate about</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest or hobby"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      />
                      <Button onClick={addInterest} size="sm">
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <CardPreview cardData={cardData} />
          </div>
        </div>
      </div>
    </div>
  );
};
