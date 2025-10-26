import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { startTour } from '@/hooks/useTour';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  Code, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Trash2, 
  RefreshCcw,
  ExternalLink,
  Bug,
  MessageSquare,
  Lightbulb,
  BookOpen,
  FileText,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  PlayCircle,
  Calendar,
  Mail,
  Globe,
  ChevronRight,
  Settings as SettingsIcon,
  Bell,
  Download,
  Zap,
  ChevronDown,
  Menu
} from 'lucide-react';
import { OGMetaEditor } from '@/components/OGMetaEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Json } from '@/integrations/supabase/types';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  job_title: string;
  avatar_url: string;
  created_at: string;
  timezone?: string;
  invite_parameters?: Json;
  account_type?: string;
}

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState<'personal' | 'professional'>('personal');
  const [inviteId, setInviteId] = useState('');
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [timezone, setTimezone] = useState('UTC');
  const [deleteUsername, setDeleteUsername] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [developerExpanded, setDeveloperExpanded] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUsername();
    }
  }, [user]);

  const fetchUsername = async () => {
    if (!user) return;

    try {
      const { data: card } = await supabase
        .from('digital_cards')
        .select('vanity_url')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (card?.vanity_url) {
        setCurrentUsername(card.vanity_url);
      }
    } catch (error: any) {
      console.error('Error fetching username:', error);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFullName(data.display_name || '');
      setTimezone(data.timezone || 'UTC');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    }
  };

  const handleUpdateName = async () => {
    if (!user || !fullName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: fullName })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Name updated successfully"
      });
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating name:', error);
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTimezone = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ timezone })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Timezone updated successfully"
      });
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating timezone:', error);
      toast({
        title: "Error",
        description: "Failed to update timezone",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Delete old card
      await supabase
        .from('digital_cards')
        .delete()
        .eq('owner_user_id', user.id);

      // Generate new random username
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

      // Create new card with new username
      const { error: createError } = await supabase
        .from('digital_cards')
        .insert({
          owner_user_id: user.id,
          title: profile?.display_name || 'My Card',
          vanity_url: newUsername,
          content_json: {},
          is_active: true,
        });

      if (createError) throw createError;

      toast({
        title: "Success",
        description: "Profile reset successfully with new username"
      });
      setShowResetDialog(false);
      setResetUsername('');
      setCurrentUsername(newUsername);
      navigate('/editor');
    } catch (error: any) {
      console.error('Error resetting profile:', error);
      toast({
        title: "Error",
        description: "Failed to reset profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await supabase.from('digital_cards').delete().eq('owner_user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);
      
      await signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been scheduled for deletion"
      });
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRestartTour = () => {
    localStorage.removeItem('patra-tour-completed');
    toast({
      title: "Tour Reset",
      description: "The tour will show when you next visit the editor"
    });
    navigate('/editor');
  };

  const getAccountAge = () => {
    if (!profile?.created_at) return 'N/A';
    
    const createdDate = new Date(profile.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''}`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('pk_test_xxxxxxxxxxxxxxxxxxxxx');
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    });
  };

  const navigationItems = [
    { id: 'account', label: 'Account', icon: Building2 },
    { id: 'developer', label: 'Developer', icon: Code },
    { id: 'support', label: 'Support', icon: HelpCircle, submenu: [
      { id: 'bug', label: 'Report Bug', path: '/settings/bug', icon: Bug },
      { id: 'feedback', label: 'Send Feedback', path: '/settings/feedback', icon: MessageSquare },
      { id: 'feature', label: 'Request Feature', path: '/settings/feature', icon: Lightbulb },
      { id: 'support', label: 'Get Support', path: '/settings/support', icon: HelpCircle },
    ]},
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/editor')}
                className="hover:bg-primary/10"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
                  <SettingsIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Settings
                  </h1>
                  <p className="hidden sm:block text-sm text-muted-foreground">
                    Manage your preferences
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Navigation Dropdown */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Menu className="w-4 h-4" />
                      <span className="hidden sm:inline">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className="gap-2 cursor-pointer"
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                    <Separator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="gap-2 cursor-pointer text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10"
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                  {profile?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">
            <nav className="space-y-1 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-2 shadow-lg shadow-black/5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                if (item.submenu) {
                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="font-medium">{item.label}</span>
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      </button>
                      <div className="ml-6 space-y-1">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => navigate(subItem.path)}
                              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left text-sm transition-all duration-200 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            >
                              <SubIcon className="w-4 h-4 shrink-0" />
                              <span>{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                );
              })}
              
              <Separator className="my-2" />
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content - Continuous Scroll */}
          <main className="space-y-8">
            {/* Account Section */}
            <section id="section-account" className="scroll-mt-24">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Account</h2>
                </div>
                
                {/* Profile Header Card */}
                <Card className="border-border/50 shadow-lg shadow-black/5 overflow-hidden">
                  <div className="h-24 sm:h-32 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
                  <CardContent className="relative pt-0 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background shadow-xl">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                          {profile?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-bold truncate">{profile?.display_name || 'User'}</h2>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm break-all">
                          <Mail className="w-4 h-4 shrink-0" />
                          {user?.email}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {accountType === 'personal' ? 'Personal' : 'Professional'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="border-border/50 shadow-lg shadow-black/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">Display Name</Label>
                        <div className="flex gap-2">
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your name"
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleUpdateName} 
                            disabled={loading}
                            size="icon"
                            className="shrink-0"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Timezone
                        </Label>
                        <div className="flex gap-2">
                          <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                              <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                              <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                              <SelectItem value="Europe/London">London (GMT)</SelectItem>
                              <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                              <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                              <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                              <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={handleUpdateTimezone} 
                            disabled={loading}
                            size="icon"
                            className="shrink-0"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Member Since</p>
                          <p className="text-sm text-muted-foreground">{getAccountAge()} ago</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full justify-between hover:bg-primary/5 hover:border-primary/50"
                      onClick={() => window.open('/analytics', '_blank')}
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        View Analytics Dashboard
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Account Type */}
                <Card className="border-border/50 shadow-lg shadow-black/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Account Type
                    </CardTitle>
                    <CardDescription>
                      Manage your account type and organization settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              {accountType === 'personal' ? (
                                <User className="w-4 h-4 text-primary" />
                              ) : (
                                <Building2 className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <h3 className="font-semibold">
                              {accountType === 'personal' ? 'Personal Account' : 'Professional Account'}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {accountType === 'personal' 
                              ? 'Perfect for individual use and personal projects'
                              : 'Ideal for teams and business collaboration'
                            }
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setAccountType(accountType === 'personal' ? 'professional' : 'personal')}
                          className="shrink-0 w-full sm:w-auto"
                        >
                          Switch to {accountType === 'personal' ? 'Professional' : 'Personal'}
                        </Button>
                      </div>
                    </div>

                    {accountType === 'professional' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <Label htmlFor="inviteId" className="text-base font-semibold">Company Integration</Label>
                          <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Link your account to a company card by entering the invite ID provided by your administrator
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                id="inviteId"
                                value={inviteId}
                                onChange={(e) => setInviteId(e.target.value)}
                                placeholder="Enter invite ID"
                                className="flex-1"
                              />
                              <Button disabled={!inviteId.trim()} className="w-full sm:w-auto">
                                Link Company
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Developer Section - Collapsible */}
            <section id="section-developer" className="scroll-mt-24">
              <div className="space-y-6">
                <Card className="border-border/50 shadow-lg shadow-black/5">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl" 
                    onClick={() => setDeveloperExpanded(!developerExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary" />
                        <CardTitle>Developer Tools</CardTitle>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${developerExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    <CardDescription>
                      Integrate Patra with your applications using our API
                    </CardDescription>
                  </CardHeader>
                  {developerExpanded && (
                    <CardContent className="space-y-6">
                      {/* OG Meta Editor */}
                      {user && <OGMetaEditor userId={user.id} />}
                      
                      <Separator />

                      <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1 min-w-0">
                            <Label className="text-sm font-medium">API Key</Label>
                            <code className="block text-xs text-muted-foreground font-mono break-all">
                              pk_test_xxxxxxxxxxxxxxxxxxxxx
                            </code>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copyApiKey}
                            className="shrink-0"
                          >
                            {copiedApiKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Keep your API key secure. Never share it publicly or commit it to version control.
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Developer Resources</Label>
                        <div className="grid gap-3">
                          <Button
                            onClick={() => navigate('/api-docs')}
                            variant="outline"
                            className="justify-between h-auto py-4 hover:bg-primary/5 hover:border-primary/50"
                          >
                            <div className="flex items-center gap-3 text-left">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Code className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">API Documentation</p>
                                <p className="text-xs text-muted-foreground">Explore endpoints and examples</p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 shrink-0" />
                          </Button>

                          <Button
                            onClick={() => window.open('https://docs.patra.me', '_blank')}
                            variant="outline"
                            className="justify-between h-auto py-4 hover:bg-primary/5 hover:border-primary/50"
                          >
                            <div className="flex items-center gap-3 text-left">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">SDK Documentation</p>
                                <p className="text-xs text-muted-foreground">SDKs for popular languages</p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 shrink-0" />
                          </Button>

                          <Button
                            onClick={() => window.open('https://github.com/patra', '_blank')}
                            variant="outline"
                            className="justify-between h-auto py-4 hover:bg-primary/5 hover:border-primary/50"
                          >
                            <div className="flex items-center gap-3 text-left">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Code className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Code Examples</p>
                                <p className="text-xs text-muted-foreground">Sample projects on GitHub</p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 shrink-0" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Need help getting started?</p>
                            <p className="text-xs text-muted-foreground">
                              Check out our quick start guide or join our developer community for support.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </section>

            {/* Support Section */}
            <section id="section-support" className="scroll-mt-24">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Support</h2>
                </div>
                
                {/* Help Resources */}
                <Card className="border-border/50 shadow-lg shadow-black/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Help Resources
                    </CardTitle>
                    <CardDescription>
                      Find answers and learn more about Patra
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-4 hover:bg-primary/5 hover:border-primary/50"
                      onClick={() => navigate('/docs')}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Documentation</p>
                          <p className="text-xs text-muted-foreground">Comprehensive guides and tutorials</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-4 hover:bg-primary/5 hover:border-primary/50"
                      onClick={() => window.open('https://help.patra.me', '_blank')}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Help Center</p>
                          <p className="text-xs text-muted-foreground">FAQs and troubleshooting</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-4 hover:bg-primary/5 hover:border-primary/50"
                      onClick={() => {
                        toast({
                          title: "Tour Restarting",
                          description: "The guided tour will begin when you return to the editor.",
                        });
                        startTour();
                      }}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <PlayCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Restart Guided Tour</p>
                          <p className="text-xs text-muted-foreground">Step-by-step walkthrough</p>
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact & Feedback */}
                <Card className="border-border/50 shadow-lg shadow-black/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Contact & Feedback
                    </CardTitle>
                    <CardDescription>
                      Get in touch with our team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    <button className="group p-6 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                      <div className="space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Bug className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Report a Bug</h3>
                          <p className="text-sm text-muted-foreground">
                            Found an issue? Let us know
                          </p>
                        </div>
                      </div>
                    </button>

                    <button className="group p-6 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                      <div className="space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Send Feedback</h3>
                          <p className="text-sm text-muted-foreground">
                            Share your thoughts with us
                          </p>
                        </div>
                      </div>
                    </button>

                    <button className="group p-6 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                      <div className="space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Lightbulb className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Feature Request</h3>
                          <p className="text-sm text-muted-foreground">
                            Suggest new features
                          </p>
                        </div>
                      </div>
                    </button>

                    <button className="group p-6 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                      <div className="space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <HelpCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Get Support</h3>
                          <p className="text-sm text-muted-foreground">
                            Contact our support team
                          </p>
                        </div>
                      </div>
                    </button>
                  </CardContent>
                </Card>

                {/* Legal */}
                <Card className="border-border/50 shadow-lg shadow-black/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Legal & Privacy
                    </CardTitle>
                    <CardDescription>
                      Important information about your rights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <button className="w-full p-4 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Terms of Service</p>
                            <p className="text-xs text-muted-foreground">Review our terms</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>

                    <button className="w-full p-4 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Privacy Policy</p>
                            <p className="text-xs text-muted-foreground">How we protect your data</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>

                    <button className="w-full p-4 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Cookie Policy</p>
                            <p className="text-xs text-muted-foreground">How we use cookies</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Security Section - Moved to Bottom */}
            <section id="section-security" className="scroll-mt-24">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Security</h2>
                </div>
                
                <Card className="border-border/50 shadow-lg shadow-black/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Protect your account with advanced security features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* GDPR Compliance */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Privacy & Data Rights</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Button variant="outline" className="justify-start h-auto py-4 hover:bg-primary/5">
                          <div className="flex items-start gap-3 text-left">
                            <Download className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Download Data</p>
                              <p className="text-xs text-muted-foreground">Export all your information</p>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start h-auto py-4 hover:bg-primary/5"
                          onClick={() => navigate('/docs')}
                        >
                          <div className="flex items-start gap-3 text-left">
                            <Eye className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Privacy Dashboard</p>
                              <p className="text-xs text-muted-foreground">Manage your preferences</p>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Danger Zone */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        <h3 className="font-semibold text-destructive">Danger Zone</h3>
                      </div>
                      <div className="space-y-3">
                        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-start h-auto py-4 border-destructive/20 hover:bg-destructive/5 hover:border-destructive/50">
                              <div className="flex items-start gap-3 text-left">
                                <RefreshCcw className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                                <div>
                                  <p className="font-medium text-destructive">Reset Profile</p>
                                  <p className="text-xs text-muted-foreground">Delete all cards and start fresh</p>
                                </div>
                              </div>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset Profile</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete all your cards and generate a new username. Type "{currentUsername}" to confirm.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Input
                              value={resetUsername}
                              onChange={(e) => setResetUsername(e.target.value)}
                              placeholder={`Type "${currentUsername}" to confirm`}
                            />
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setResetUsername('')}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleResetProfile} 
                                disabled={resetUsername !== currentUsername || loading}
                                className="bg-destructive text-destructive-foreground"
                              >
                                {loading ? 'Resetting...' : 'Reset Profile'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-start h-auto py-4 border-destructive/20 hover:bg-destructive/5 hover:border-destructive/50">
                              <div className="flex items-start gap-3 text-left">
                                <Trash2 className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                                <div>
                                  <p className="font-medium text-destructive">Delete Account</p>
                                  <p className="text-xs text-muted-foreground">Permanently remove all your data</p>
                                </div>
                              </div>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete your account. Type "{currentUsername}" to confirm deletion.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Input
                              value={deleteUsername}
                              onChange={(e) => setDeleteUsername(e.target.value)}
                              placeholder={`Type "${currentUsername}" to confirm`}
                            />
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteUsername('')}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDeleteAccount} 
                                disabled={deleteUsername !== currentUsername || loading}
                                className="bg-destructive text-destructive-foreground"
                              >
                                {loading ? 'Deleting...' : 'Delete Account'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
