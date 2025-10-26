import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, ChevronLeft, Users, Building2, User, AlertCircle,
  Brain, Wand2, Palette, Sparkles, Check, CreditCard, MapPin, Info,
  Camera, Mail, Briefcase, FileText, Upload
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type AccountType = 'individual' | 'company' | null;

interface OnboardingData {
  accountType: AccountType;
  display_name: string;
  phone: string;
  email: string;
  age: string;
  locationConsent: boolean;
  locationCoords: { lat: number; lng: number } | null;
  deviceInfo: {
    browser: string;
    device: string;
    ip: string;
  };
  // Company-specific fields
  company_name: string;
  company_domain: string;
  termsAccepted: boolean;
  verificationPaid: boolean;
  // Profile creation fields
  bio: string;
  job_title: string;
  avatar_url: string;
  google_avatar_url: string;
  website: string;
  company: string;
  selectedAvatarSource: 'google' | 'upload' | null;
}

const aiLoadingSteps = [
  { icon: Brain, text: "Analyzing your information...", duration: 1500 },
  { icon: Wand2, text: "Generating suitable fields...", duration: 1500 },
  { icon: Palette, text: "AI picking your card design...", duration: 1500 },
  { icon: Sparkles, text: "Personalizing your experience...", duration: 1000 },
  { icon: Check, text: "All set! Redirecting...", duration: 500 }
];

export const OnboardingNew: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0 = account type, 1 = personal info, 2-5 = profile setup for individual
  const [loading, setLoading] = useState(false);
  const [showCompanyWarning, setShowCompanyWarning] = useState(false);
  const [showAILoading, setShowAILoading] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    accountType: null,
    display_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    phone: user?.user_metadata?.phone || '',
    email: user?.email || '',
    age: '',
    locationConsent: false,
    locationCoords: null,
    deviceInfo: {
      browser: '',
      device: '',
      ip: ''
    },
    company_name: '',
    company_domain: '',
    termsAccepted: false,
    verificationPaid: false,
    bio: '',
    job_title: '',
    avatar_url: '',
    google_avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '',
    website: '',
    company: '',
    selectedAvatarSource: user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? 'google' : null,
  });

  useEffect(() => {
    if (user?.email) {
      setData(prev => ({ 
        ...prev, 
        email: user.email!,
        display_name: prev.display_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
        phone: prev.phone || user.user_metadata?.phone || '',
      }));
    }
    // Collect device info
    collectDeviceInfo();
  }, [user]);

  // AI Loading Animation
  useEffect(() => {
    if (showAILoading && aiLoadingStep < aiLoadingSteps.length) {
      const timer = setTimeout(() => {
        setAiLoadingStep(aiLoadingStep + 1);
      }, aiLoadingSteps[aiLoadingStep].duration);
      
      return () => clearTimeout(timer);
    } else if (showAILoading && aiLoadingStep >= aiLoadingSteps.length) {
      completeOnboarding();
    }
  }, [showAILoading, aiLoadingStep]);

  const collectDeviceInfo = async () => {
    const browser = navigator.userAgent;
    const device = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    
    // Get IP via a public API
    let ip = 'Unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const ipData = await response.json();
      ip = ipData.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
    }

    setData(prev => ({
      ...prev,
      deviceInfo: { browser, device, ip }
    }));
  };

  const requestLocation = async () => {
    if (!data.locationConsent) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setData(prev => ({
            ...prev,
            locationCoords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          toast({
            title: "Location captured",
            description: `Coordinates: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Error",
            description: "Unable to get your location",
            variant: "destructive"
          });
        }
      );
    }
  };

  useEffect(() => {
    if (data.locationConsent) {
      requestLocation();
    }
  }, [data.locationConsent]);

  const handleAccountTypeSelect = (type: AccountType) => {
    if (type === 'company') {
      setShowCompanyWarning(true);
    } else {
      setData({ ...data, accountType: type });
      setCurrentStep(1);
    }
  };

  const handleCompanyConfirm = () => {
    setData({ ...data, accountType: 'company' });
    setShowCompanyWarning(false);
    setCurrentStep(1);
  };

  const handleComplete = () => {
    setLoading(true);
    setShowAILoading(true);
    setAiLoadingStep(0);
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      // Get profile ID first
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileFetchError) throw profileFetchError;

      // Generate username function with better collision handling
      const generateUsername = async (baseUsername: string): Promise<string> => {
        let base = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Ensure base is not empty
        if (!base || base.length === 0) {
          base = 'user';
        }
        
        // Always add random 4-digit number to ensure uniqueness
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        let username = `${base}${randomNum}`;
        
        // Double-check for collisions
        const { data: existingCard } = await supabase
          .from('digital_cards')
          .select('vanity_url')
          .eq('vanity_url', username)
          .maybeSingle();
        
        // If still exists (extremely rare), add more random digits
        if (existingCard) {
          username = `${base}${randomNum}${Math.floor(Math.random() * 99)}`;
        }
        
        return username;
      };

      // Determine final avatar URL
      const finalAvatarUrl = data.selectedAvatarSource === 'google' 
        ? data.google_avatar_url 
        : data.selectedAvatarSource === 'upload' 
          ? data.avatar_url 
          : '';

      // Always generate and create username for new users
      const { data: existingCard, error: cardCheckError } = await supabase
        .from('digital_cards')
        .select('id, vanity_url')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      let vanityUrl = '';

      if (!existingCard) {
        // Generate username from display name, email, or default
        const baseUsername = data.display_name
          ? data.display_name.split(' ')[0]
          : user.email?.split('@')[0] || 'user';
        
        vanityUrl = await generateUsername(baseUsername);
        
        const { error: insertError } = await supabase.from('digital_cards').insert({
          owner_user_id: user.id,
          title: data.display_name || user.email?.split('@')[0] || 'My Card',
          vanity_url: vanityUrl,
          content_json: {
            name: data.display_name || '',
            email: data.email || '',
            phone: data.phone || '',
            jobTitle: data.job_title || '',
            bio: data.bio || '',
            company: data.company || '',
            website: data.website || '',
            avatar: finalAvatarUrl,
            showAvatar: !!finalAvatarUrl,
            showName: true,
            showJobTitle: !!data.job_title,
            showPhone: !!data.phone,
            showEmail: true,
            showBio: !!data.bio,
            showQRCode: true,
            showCompany: !!data.company,
            showWebsite: !!data.website,
          }
        });

        if (insertError) throw insertError;
      } else {
        vanityUrl = existingCard.vanity_url;
      }

      const updateData: any = {
        display_name: data.display_name || null,
        phone: data.phone || null,
        age: data.age ? parseInt(data.age) : null,
        account_type: data.accountType,
        location_coordinates: data.locationCoords ? `(${data.locationCoords.lat},${data.locationCoords.lng})` : null,
        device_info: data.deviceInfo,
        onboarding_completed: true,
        avatar_url: finalAvatarUrl || null,
        bio: data.bio || null,
        job_title: data.job_title || null,
        company_name: data.company || null,
      };

      // Company-specific fields
      if (data.accountType === 'company') {
        const inviteCode = await supabase.rpc('generate_invite_code');
        
        updateData.company_name = data.company_name;
        updateData.company_domain = data.company_domain || null;
        updateData.invite_code = inviteCode.data;
        updateData.terms_accepted_at = new Date().toISOString();
        updateData.payment_due_date = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
        
        // Create verification payment record
        await supabase.from('company_payments').insert({
          company_profile_id: profileData.id,
          payment_type: 'verification',
          amount: 20,
          status: 'pending',
          due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        });
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update digital card with all data
      const { data: finalCard, error: cardFetchError } = await supabase
        .from('digital_cards')
        .select('id, vanity_url')
        .eq('owner_user_id', user.id)
        .single();

      if (cardFetchError) throw cardFetchError;

      if (finalCard) {
        const { error: cardUpdateError } = await supabase
          .from('digital_cards')
          .update({
            title: data.display_name || 'My Card',
            content_json: {
              name: data.display_name || '',
              email: data.email || '',
              phone: data.phone || '',
              jobTitle: data.job_title || '',
              bio: data.bio || '',
              company: data.company || '',
              website: data.website || '',
              avatar: finalAvatarUrl,
              showAvatar: !!finalAvatarUrl,
              showName: true,
              showJobTitle: !!data.job_title,
              showPhone: !!data.phone,
              showEmail: true,
              showBio: !!data.bio,
              showQRCode: true,
              showCompany: !!data.company,
              showWebsite: !!data.website,
            }
          })
          .eq('id', finalCard.id);

        if (cardUpdateError) throw cardUpdateError;

        toast({
          title: "Welcome to Patra!",
          description: `Your profile has been created successfully.`,
        });

        // Mark tour as should show
        localStorage.removeItem('patra-tour-completed');

        // Navigate to card for individual, dashboard for company
        if (data.accountType === 'individual') {
          navigate(`/${finalCard.vanity_url}?card`);
        } else {
          navigate('/dashboard');
        }
        return;
      }

      // Fallback if something went wrong
      toast({
        title: "Welcome to Patra!",
        description: `Your ${data.accountType} account has been set up successfully.`,
      });
      navigate(data.accountType === 'company' ? '/dashboard' : '/editor');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
      setShowAILoading(false);
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (currentStep === 0) return data.accountType !== null;
    if (currentStep === 1) {
      if (data.accountType === 'individual') {
        return data.display_name.trim() !== '';
      } else {
        return data.display_name.trim() !== '' && data.company_name.trim() !== '' && data.termsAccepted;
      }
    }
    // All profile steps are optional
    return true;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setData({ ...data, avatar_url: publicUrl, selectedAvatarSource: 'upload' });
      
      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated."
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // AI Loading Screen
  if (showAILoading) {
    const CurrentIcon = aiLoadingStep < aiLoadingSteps.length ? aiLoadingSteps[aiLoadingStep].icon : Check;
    const currentText = aiLoadingStep < aiLoadingSteps.length ? aiLoadingSteps[aiLoadingStep].text : "Complete!";
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 text-center max-w-md w-full">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 border-4 border-violet-200 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-2 border-4 border-purple-200 rounded-full animate-spin-reverse"></div>
              <div className="absolute inset-4 border-4 border-pink-200 rounded-full animate-spin-slow"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                  <CurrentIcon className="w-10 h-10 text-white animate-bounce-slow" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 animate-fade-in">
            {currentText}
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            {aiLoadingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index <= aiLoadingStep
                    ? 'w-8 bg-gradient-to-r from-violet-600 to-purple-600'
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>

          <div className="space-y-3 mb-8">
            {aiLoadingSteps.slice(0, aiLoadingStep).map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm animate-slide-in-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-slate-700 font-medium">{step.text}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500 italic">
            Did you know? Digital cards are 90% more likely to be saved than paper cards! 🌱
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-slate-700">Welcome to Patra</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-violet-900 to-purple-900 bg-clip-text text-transparent mb-2">
            Let's get you started
          </h1>
          <p className="text-slate-600 text-lg">Choose the best account type for you</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-slate-200">
          <CardContent className="p-8">
            {currentStep === 0 && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Account Type</h2>
                  <p className="text-slate-600">Select the option that best describes you</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAccountTypeSelect('individual')}
                    className="group relative p-6 rounded-2xl border-2 border-slate-200 hover:border-violet-500 bg-white hover:bg-violet-50/50 transition-all duration-200 text-left"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Individual</h3>
                    <p className="text-sm text-slate-600">
                      For personal use, freelancers, and professionals
                    </p>
                  </button>

                  <button
                    onClick={() => handleAccountTypeSelect('company')}
                    className="group relative p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/50 transition-all duration-200 text-left"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Company</h3>
                    <p className="text-sm text-slate-600">
                      For organizations managing employee cards
                    </p>
                    <div className="mt-3 text-xs text-orange-600 font-medium">
                      Requires verification (₹20)
                    </div>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 1 && data.accountType === 'individual' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
                  <p className="text-slate-600">Tell us a bit about yourself</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="display_name"
                      value={data.display_name}
                      onChange={(e) => setData({ ...data, display_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={data.phone}
                      onChange={(e) => setData({ ...data, phone: e.target.value })}
                      placeholder="+91 1234567890"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={data.email}
                      disabled
                      className="h-12 bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age (Optional)</Label>
                    <Input
                      id="age"
                      type="number"
                      value={data.age}
                      onChange={(e) => setData({ ...data, age: e.target.value })}
                      placeholder="25"
                      className="h-12"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Checkbox
                      id="location-consent"
                      checked={data.locationConsent}
                      onCheckedChange={(checked) => setData({ ...data, locationConsent: checked as boolean })}
                    />
                    <div className="flex-1">
                      <Label htmlFor="location-consent" className="text-sm font-medium cursor-pointer">
                        Share my location
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll capture your device location to help personalize your experience
                      </p>
                      {data.locationCoords && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-medium">
                          <MapPin className="w-3 h-3" />
                          <span>Location captured successfully</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    <p className="font-medium mb-1">📱 Device Information</p>
                    <p>Browser: {data.deviceInfo.browser.substring(0, 50)}...</p>
                    <p>Device: {data.deviceInfo.device}</p>
                    <p>IP: {data.deviceInfo.ip}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStepValid() || loading}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Avatar (Individual only) */}
            {currentStep === 2 && data.accountType === 'individual' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose your photo</h2>
                  <p className="text-slate-600">Select between Google photo or upload new (optional)</p>
                </div>
                
                <div className="flex flex-col items-center space-y-6">
                  {/* Avatar options */}
                  <div className="flex gap-6">
                    {/* Google Photo Option */}
                    {data.google_avatar_url && (
                      <button
                        type="button"
                        onClick={() => setData({ ...data, selectedAvatarSource: 'google' })}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-xl transition-all ${
                          data.selectedAvatarSource === 'google'
                            ? 'border-4 border-green-500 bg-green-50'
                            : 'border-2 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={data.google_avatar_url} alt="Google Profile" />
                          <AvatarFallback>
                            <User className="w-12 h-12" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Google Photo</span>
                        {data.selectedAvatarSource === 'google' && (
                          <span className="text-xs text-green-600 font-semibold">Selected</span>
                        )}
                      </button>
                    )}

                    {/* Upload Photo Option */}
                    <button
                      type="button"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className={`flex flex-col items-center space-y-2 p-4 rounded-xl transition-all ${
                        data.selectedAvatarSource === 'upload'
                          ? 'border-4 border-green-500 bg-green-50'
                          : 'border-2 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={data.avatar_url} alt="Uploaded Profile" />
                        <AvatarFallback className="bg-slate-100">
                          <Upload className="w-12 h-12 text-slate-400" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Upload Photo</span>
                      {data.selectedAvatarSource === 'upload' && (
                        <span className="text-xs text-green-600 font-semibold">Selected</span>
                      )}
                    </button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Preview of selected avatar */}
                  {(data.selectedAvatarSource === 'google' || data.selectedAvatarSource === 'upload') && (
                    <div className="text-center">
                      <p className="text-sm text-green-600 font-medium mb-2">✓ Profile photo selected</p>
                      <Avatar className="w-32 h-32 mx-auto border-4 border-green-500">
                        <AvatarImage 
                          src={data.selectedAvatarSource === 'google' ? data.google_avatar_url : data.avatar_url} 
                          alt="Selected" 
                        />
                        <AvatarFallback>
                          <User className="w-16 h-16" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Company & Website (Individual only) */}
            {currentStep === 3 && data.accountType === 'individual' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Company & Website</h2>
                  <p className="text-slate-600">Where do you work? (optional)</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={data.company}
                      onChange={(e) => setData({ ...data, company: e.target.value })}
                      placeholder="Acme Inc."
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={data.website}
                      onChange={(e) => setData({ ...data, website: e.target.value })}
                      placeholder="https://example.com"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Job Title (Individual only) */}
            {currentStep === 4 && data.accountType === 'individual' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">What do you do?</h2>
                  <p className="text-slate-600">Your professional title (optional)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={data.job_title}
                    onChange={(e) => setData({ ...data, job_title: e.target.value })}
                    placeholder="e.g., Software Engineer, Designer, Entrepreneur"
                    className="h-12"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Bio (Individual only) */}
            {currentStep === 5 && data.accountType === 'individual' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Tell us about yourself</h2>
                  <p className="text-slate-600">A short bio for your card (optional)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder="Share a bit about yourself, your work, or what you're passionate about..."
                    className="min-h-32"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1"
                  >
                    Create My Profile
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && data.accountType === 'company' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Company Account Setup</h2>
                  <p className="text-slate-600">Complete your company information</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="company_admin_name">
                      Your Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_admin_name"
                      value={data.display_name}
                      onChange={(e) => setData({ ...data, display_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name"
                      value={data.company_name}
                      onChange={(e) => setData({ ...data, company_name: e.target.value })}
                      placeholder="Enter company name"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_domain">Company Domain (Optional)</Label>
                    <Input
                      id="company_domain"
                      value={data.company_domain}
                      onChange={(e) => setData({ ...data, company_domain: e.target.value })}
                      placeholder="example.com"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_email">Email</Label>
                    <Input
                      id="company_email"
                      value={data.email}
                      disabled
                      className="h-12 bg-muted"
                    />
                  </div>

                  <div className="p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-2">Verification Payment Required</h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Company accounts require a one-time verification fee of ₹20. Your account will be activated within 1-2 hours after payment.
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <Checkbox
                            id="payment-confirm"
                            checked={data.verificationPaid}
                            onCheckedChange={(checked) => setData({ ...data, verificationPaid: checked as boolean })}
                          />
                          <Label htmlFor="payment-confirm" className="text-sm cursor-pointer">
                            I have completed the payment of ₹20
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-700 space-y-2">
                        <p className="font-medium">Company Account Features:</p>
                        <ul className="space-y-1 ml-4 list-disc text-xs">
                          <li>Create digital IDs for employees in bulk</li>
                          <li>Up to 5 Board of Directors cards (free)</li>
                          <li>Unique invite code for employees</li>
                          <li>Customizable data collection parameters</li>
                          <li>Company-branded templates</li>
                          <li>₹2 per employee invite (payable within 2 months)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border">
                    <Checkbox
                      id="terms-accept"
                      checked={data.termsAccepted}
                      onCheckedChange={(checked) => setData({ ...data, termsAccepted: checked as boolean })}
                    />
                    <div className="flex-1">
                      <Label htmlFor="terms-accept" className="text-sm font-medium cursor-pointer">
                        I accept the Terms & Conditions and Data Handling Consent
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        By checking this, you agree to our terms of service and data privacy policy. Company accounts cannot be converted to individual accounts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!isStepValid() || loading}
                    className="flex-1"
                  >
                    Complete Setup
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company Warning Dialog */}
      <AlertDialog open={showCompanyWarning} onOpenChange={setShowCompanyWarning}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              Company Account - Important Information
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-left">
              <p className="text-base">
                You're about to create a <strong>Company Account</strong>. This account type is designed for businesses and organizations. Please read carefully:
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                <h4 className="font-semibold text-slate-900 text-base">What is a Company Account?</h4>
                <p className="text-sm text-slate-700">
                  The company account is designed for creating digital ID cards and profiles for employees in large numbers. Perfect for organizations that need:
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-slate-700 ml-2">
                  <li>Bulk employee ID card creation</li>
                  <li>Centralized employee profile management</li>
                  <li>Request printing services for physical ID cards</li>
                  <li>Specialized dashboard tailored for HR/Admin teams</li>
                  <li>Board of Directors cards (up to 5 members included)</li>
                </ul>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 space-y-2">
                <h4 className="font-semibold text-slate-900">⚠️ Critical Requirements:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-slate-700">
                  <li>Company accounts <strong>CANNOT be changed</strong> to individual accounts</li>
                  <li><strong>Verification fee: ₹20</strong> (required during account creation)</li>
                  <li>Account will be <strong>active within 1-2 hours</strong> after payment verification</li>
                  <li>Must <strong>verify company status</strong> - individual users cannot use this</li>
                  <li><strong>Employee invite fee: ₹2 per employee</strong> (payable within 2 months)</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
                <h4 className="font-semibold text-slate-900">✨ Company Account Benefits:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-slate-700">
                  <li>Create up to 5 Board of Directors cards (FREE)</li>
                  <li>Generate unique invite codes for employees</li>
                  <li>Customize data collection parameters per employee</li>
                  <li>Access specialized company dashboard</li>
                  <li>Company-branded templates and designs</li>
                  <li>Manage all employee cards from one place</li>
                </ul>
              </div>

              <p className="text-sm text-slate-600 italic">
                💡 If you're an individual user or freelancer, please choose the "Individual" account type instead.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompanyConfirm} className="bg-blue-600 hover:bg-blue-700">
              I Understand & Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
