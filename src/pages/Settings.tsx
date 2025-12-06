import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Building2,
  Code,
  Shield,
  LogOut,
  Trash2,
  CreditCard,
  Bell,
  Globe,
  Moon,
  Sun,
  Laptop,
  Key,
  Copy,
  Check,
  ChevronRight,
  Mail,
  Smartphone,
  Loader2,
  Camera
} from 'lucide-react';
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

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [copiedApiKey, setCopiedApiKey] = useState(false);

  // Avatar State
  const [uploading, setUploading] = useState(false);
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
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

      // Initialize avatar states
      const googleUrl = user.user_metadata?.avatar_url;
      setGoogleAvatarUrl(googleUrl || null);

      const savedCustomUrl = user.user_metadata?.custom_avatar_url;
      if (savedCustomUrl) {
        setCustomAvatarUrl(savedCustomUrl);
      } else if (data.avatar_url && data.avatar_url !== googleUrl) {
        // Current is custom, but not saved in metadata yet
        setCustomAvatarUrl(data.avatar_url);
        // Save it for future
        supabase.auth.updateUser({ data: { custom_avatar_url: data.avatar_url } });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile (active avatar)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update user metadata (reserved custom avatar)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { custom_avatar_url: publicUrl }
      });

      if (metadataError) throw metadataError;

      setCustomAvatarUrl(publicUrl);
      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const setAvatar = async (url: string) => {
    if (!user) return;
    try {
      setUploading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, avatar_url: url });
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been changed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: fullName })
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: "Success", description: "Profile updated successfully" });
      fetchProfile();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('pk_test_' + user?.id?.replace(/-/g, '').substring(0, 24));
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
    toast({ title: "Copied", description: "API key copied to clipboard" });
  };

  const menuItems = [
    { id: 'account', label: 'Account', icon: User, description: 'Profile details & personal info' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password & authentication' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & push preferences' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Plans & payment methods' },
    { id: 'developer', label: 'Developer', icon: Code, description: 'API keys & webhooks' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/editor')}>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-4 hidden md:block">
              <div className="text-xl font-bold text-foreground">
                <span className="text-muted-foreground">P</span>atra
              </div>
            </div>
            <Button variant="ghost" onClick={handleSignOut} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </aside>

          {/* Mobile Navigation (Tabs) */}
          <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
            <div className="flex gap-2 min-w-max">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border text-muted-foreground'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <main className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your photo and personal details here.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="text-2xl">{profile?.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="file"
                            id="avatar-upload-settings"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                          />
                          <Button variant="outline" size="sm" disabled={uploading}>
                            {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Camera className="w-3 h-3 mr-2" />}
                            Change Avatar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email} disabled className="bg-muted" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-4">
                    <Button onClick={handleUpdateProfile} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">Permanently remove your account and all data</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>Manage your password and login methods</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Key className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Password</h4>
                          <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                        </div>
                      </div>
                      <Button variant="outline">Update</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Smartphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'developer' && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">API Access</Badge>
                    </div>
                    <CardTitle className="text-2xl">Developer Portal</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your API keys and access developer resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Public API Key</Label>
                      <div className="flex gap-2">
                        <code className="flex-1 p-3 rounded-lg bg-black/50 font-mono text-sm text-gray-300 border border-white/10">
                          pk_test_{user?.id?.replace(/-/g, '').substring(0, 24) || '...'}
                        </code>
                        <Button onClick={copyApiKey} variant="secondary" className="shrink-0">
                          {copiedApiKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Use this key to authenticate requests from your client-side applications.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Comprehensive guides and API reference to help you start building.
                      </p>
                      <Button variant="outline" className="w-full" onClick={() => navigate('/docs')}>
                        View Documentation
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Webhooks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Receive real-time updates when data changes in your account.
                      </p>
                      <Button variant="outline" className="w-full" disabled>
                        Manage Webhooks (Coming Soon)
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Placeholders for other tabs */}
            {(activeTab === 'notifications' || activeTab === 'billing') && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Laptop className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Coming Soon</h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    This section is currently under development. Check back later for updates.
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
