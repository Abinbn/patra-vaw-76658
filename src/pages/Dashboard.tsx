import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  Plus,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  Edit3,
  Home,
  User,
  Zap,
  Search,
  Bell,
  ChevronRight,
  MoreVertical,
  Copy,
  Check,
  QrCode,
  Camera,
  LayoutDashboard,
  Users as UsersIcon,
  History,
  Star,
  Pin,
  Share2,
  Trash2,
  PlusCircle,
  Globe,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavedProfilesOverview } from '@/components/dashboard/SavedProfilesOverview';
import { CardDropModal } from '@/components/dashboard/CardDropModal';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  display_name: string;
  job_title: string;
  role: string;
  avatar_url?: string;
  username?: string;
  user_id: string;
}

interface DigitalCard {
  id: string;
  title: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  vanity_url: string;
  content_json?: any;
  is_pinned?: boolean;
  is_favorite?: boolean;
}

export const Dashboard: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Card Drop State
  const [isCardDropOpen, setIsCardDropOpen] = useState(false);
  const [cardDropMode, setCardDropMode] = useState<'send' | 'receive'>('send');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCards();
    }
  }, [user]);

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
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchCards = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('digital_cards')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map data to include pinned/favorite from content_json if not yet in top level
      const mappedCards = (data || []).map(card => ({
        ...card,
        is_pinned: card.content_json?.is_pinned || false,
        is_favorite: card.content_json?.is_favorite || false
      }));

      setCards(mappedCards);
    } catch (error: any) {
      console.error('Error fetching cards:', error);
      toast({
        title: "Error",
        description: "Failed to load cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (card: DigitalCard) => {
    const newPinned = !card.is_pinned;
    try {
      const updatedContent = {
        ...(card.content_json || {}),
        is_pinned: newPinned
      };

      const { error } = await supabase
        .from('digital_cards')
        .update({ content_json: updatedContent })
        .eq('id', card.id);

      if (error) throw error;

      setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_pinned: newPinned, content_json: updatedContent } : c));
      toast({
        title: newPinned ? "Card Pinned" : "Card Unpinned",
        description: card.title,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update card status",
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = async (card: DigitalCard) => {
    const newFav = !card.is_favorite;
    try {
      const updatedContent = {
        ...(card.content_json || {}),
        is_favorite: newFav
      };

      const { error } = await supabase
        .from('digital_cards')
        .update({ content_json: updatedContent })
        .eq('id', card.id);

      if (error) throw error;

      setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_favorite: newFav, content_json: updatedContent } : c));
      toast({
        title: newFav ? "Added to Favorites" : "Removed from Favorites",
        description: card.title,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update card status",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.vanity_url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse text-sm">Synchronizing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-30">
        <div className="p-6">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            Patra
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarNavItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarNavItem icon={CreditCard} label="My Cards" active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} />
          <SidebarNavItem icon={UsersIcon} label="Connections" active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} />
          <SidebarNavItem icon={Shield} label="Corporate" active={activeTab === 'corporate'} onClick={() => setActiveTab('corporate')} />
          <SidebarNavItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => navigate('/analytics')} />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <SidebarNavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => navigate('/settings')} />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>

        <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Pro Plan</p>
              <p className="text-xs text-slate-500">2 cards left</p>
            </div>
          </div>
          <Button variant="default" size="sm" className="w-full rounded-xl bg-slate-900 shadow-lg" onClick={() => navigate('/pricing')}>
            Upgrade
          </Button>
        </div>
      </aside>

      {/* Mobile Nav Top */}
      <header className="lg:hidden h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 flex items-center justify-between">
        <div className="text-xl font-bold text-primary">Patra</div>
        <Avatar className="h-8 w-8" onClick={() => navigate('/settings')}>
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>{profile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </header>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen flex flex-col relative">

        {/* Desktop Top Header */}
        <header className="lg:flex hidden h-20 items-center justify-between px-8 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-20">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search cards, connections, or features..."
              className="bg-white border-none shadow-sm h-11 pl-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 ml-8">
            <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-primary transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1 pr-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                  <Avatar className="h-8 w-8 border border-slate-100">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{profile?.display_name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{profile?.job_title || 'Member'}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-slate-100 shadow-xl p-2">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl"><User className="w-4 h-4 mr-2" /> Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/analytics')} className="rounded-xl"><BarChart3 className="w-4 h-4 mr-2" /> Insights</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 rounded-xl"><LogOut className="w-4 h-4 mr-2" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Views */}
        <div className="p-4 lg:p-8 pt-4 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.display_name?.split(' ')[0] || 'User'}</h1>
                      <p className="text-sm text-slate-500">Your network at a glance</p>
                    </div>
                    <Button
                      onClick={() => navigate('/editor?new=true')}
                      className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-2xl flex items-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      New Card
                    </Button>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <OverviewStatCard label="Total Taps" value="1.2k" trend="+12%" color="blue" />
                    <OverviewStatCard label="Live Cards" value={cards.length} color="violet" />
                    <OverviewStatCard label="Connections" value="24" trend="New" color="emerald" />
                    <OverviewStatCard label="Avg Scans" value="42" color="amber" />
                  </div>
                </section>

                {/* Action Panel */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h2 className="font-bold text-slate-900">Quick Actions</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActionCard icon={QrCode} title="Share Card" desc="Show your primary QR" color="blue" onClick={() => { setCardDropMode('send'); setIsCardDropOpen(true); }} />
                    <ActionCard icon={Camera} title="Scan QR" desc="Connect with someone" color="emerald" onClick={() => { setCardDropMode('receive'); setIsCardDropOpen(true); }} />
                    <ActionCard icon={UsersIcon} title="Connections" desc="Manage network" color="violet" onClick={() => setActiveTab('connections')} />
                    <ActionCard icon={History} title="Recent Activity" desc="Track interactions" color="amber" onClick={() => navigate('/analytics')} />
                  </div>
                </section>

                {/* Pinned Cards */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Pin className="w-5 h-5 text-slate-400 rotate-45" />
                      <h2 className="font-bold text-slate-900">Pinned Cards</h2>
                    </div>
                    <Button variant="ghost" className="text-primary text-sm font-medium" onClick={() => setActiveTab('cards')}>
                      Manage All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.filter(c => c.is_pinned).length > 0 ? (
                      cards.filter(c => c.is_pinned).map((card, i) => (
                        <CardItem key={card.id} card={card} onCopy={() => copyToClipboard(`patra.me/${card.vanity_url}`, card.id)} copied={copiedId === card.id} onPin={() => handleTogglePin(card)} onFav={() => handleToggleFavorite(card)} />
                      ))
                    ) : (
                      <div className="lg:col-span-3 py-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                          <Pin className="w-6 h-6 text-slate-300 rotate-45" />
                        </div>
                        <p className="text-slate-600 font-bold">No pinned cards</p>
                        <p className="text-slate-400 text-sm max-w-xs mt-1">Pin your favorite cards to the top of your dashboard for quick access.</p>
                        <Button variant="outline" className="mt-6 rounded-xl border-slate-200" onClick={() => setActiveTab('cards')}>
                          Pin a Card
                        </Button>
                      </div>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'cards' && (
              <motion.div key="cards" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Digital Cards</h1>
                    <p className="text-sm text-slate-500">Manage all your networking profiles</p>
                  </div>
                  <Button
                    onClick={() => navigate('/editor?new=true')}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Create New Profile
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCards.map((card, i) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      onCopy={() => copyToClipboard(`patra.me/${card.vanity_url}`, card.id)}
                      copied={copiedId === card.id}
                      onPin={() => handleTogglePin(card)}
                      onFav={() => handleToggleFavorite(card)}
                    />
                  ))}
                  <motion.div
                    className="group h-[380px] rounded-3xl border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all cursor-pointer flex flex-col items-center justify-center p-8"
                    whileHover={{ y: -4 }}
                    onClick={() => navigate('/editor?new=true')}
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors mb-4">
                      <Plus className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-slate-900">Create New Card</p>
                    <p className="text-sm text-slate-500 text-center mt-1">Add another persona or business profile to your account.</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'corporate' && (
              <motion.div
                key="corporate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white">
                    <Shield className="w-10 h-10" />
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 mb-4">Patra for Organizations</h1>
                  <p className="text-lg text-slate-600">The most powerful way to manage your team's digital identity.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <Card className="border-none shadow-xl bg-white overflow-hidden group">
                    <div className="h-2 bg-indigo-500" />
                    <CardHeader>
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                        <UsersIcon className="w-6 h-6" />
                      </div>
                      <CardTitle>Staff Management</CardTitle>
                      <CardDescription>Bulk create and manage cards for your entire team from a single dashboard.</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="border-none shadow-xl bg-white overflow-hidden group">
                    <div className="h-2 bg-purple-500" />
                    <CardHeader>
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                        <Globe className="w-6 h-6" />
                      </div>
                      <CardTitle>Company Vanity URL</CardTitle>
                      <CardDescription>Get a unique organization URL like patra.me/yourcompany to host all employee cards.</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="border-none shadow-xl bg-white overflow-hidden group">
                    <div className="h-2 bg-blue-500" />
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6" />
                      </div>
                      <CardTitle>Instant Onboarding</CardTitle>
                      <CardDescription>Unique invite links for employees to submit their data directly for your approval.</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="border-none shadow-xl bg-white overflow-hidden group">
                    <div className="h-2 bg-emerald-500" />
                    <CardHeader>
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <CardTitle>Unified Analytics</CardTitle>
                      <CardDescription>Track the total networking impact of your company across all staff members.</CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                <Card className="border-2 border-indigo-100 bg-indigo-50/50 shadow-2xl rounded-3xl overflow-hidden p-8 text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Upgrade to Corporate Profile</h3>
                  <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                    Get access to all organization features for a one-time verification fee of ₹999.
                    Switch your account type and start managing your team today.
                  </p>
                  <Button
                    className="h-14 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-200"
                    onClick={() => navigate('/onboarding')}
                  >
                    Try Corporate Profile Now
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-xs text-slate-400 mt-6 italic">
                    Note: Your existing individual cards will be preserved, but your dashboard will transition to Corporate Mode.
                  </p>
                </Card>
              </motion.div>
            )}

            {activeTab === 'connections' && (
              <motion.div key="connections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Connections</h1>
                    <p className="text-sm text-slate-500">Saved profiles and networking history</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl" onClick={() => { setCardDropMode('receive'); setIsCardDropOpen(true); }}>
                      <Camera className="w-4 h-4 mr-2" /> Scan New
                    </Button>
                  </div>
                </div>

                <SavedProfilesOverview
                  totalSaved={0}
                  newThisWeek={0}
                  onViewAll={() => navigate('/dashboard/access')}
                />

                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UsersIcon className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No connections yet</h3>
                  <p className="text-slate-500 mt-2 max-w-xs mx-auto">Start building your network by scanning QR codes or sharing your link.</p>
                  <Button onClick={() => { setCardDropMode('receive'); setIsCardDropOpen(true); }} className="mt-8 rounded-2xl h-12 px-8">Scan QR Code</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Nav Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 lg:hidden z-50 px-6 flex items-center justify-between">
        <MobileNavItem icon={LayoutDashboard} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <MobileNavItem icon={CreditCard} active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} />
        <div className="-mt-12 bg-primary p-4 rounded-full shadow-lg shadow-primary/30 border-4 border-white" onClick={() => { setCardDropMode('send'); setIsCardDropOpen(true); }}>
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <MobileNavItem icon={UsersIcon} active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} />
        <MobileNavItem icon={Settings} active={activeTab === 'settings'} onClick={() => navigate('/settings')} />
      </nav>

      <CardDropModal
        isOpen={isCardDropOpen}
        onClose={() => setIsCardDropOpen(false)}
        initialMode={cardDropMode}
        cards={cards}
        userProfile={profile}
      />
    </div>
  );
};

// UI Components
const SidebarNavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
      ? 'bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
  >
    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-sm">{label}</span>
  </button>
);

const MobileNavItem = ({ icon: Icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-2 transition-all ${active ? 'text-primary' : 'text-slate-400'}`}>
    <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''}`} />
  </button>
);

const OverviewStatCard = ({ label, value, trend, color }: any) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600',
    violet: 'bg-violet-500/10 text-violet-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600'
  };
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden group">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} font-bold group-hover:scale-110 transition-transform`}>
          {color === 'blue' ? <UsersIcon className="w-6 h-6" /> : color === 'violet' ? <Zap className="w-6 h-6" /> : color === 'emerald' ? <Star className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{value}</span>
            {trend && <span className="text-[10px] font-bold text-emerald-600">{trend}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActionCard = ({ icon: Icon, title, desc, color, onClick }: any) => (
  <Card
    className="border-none shadow-sm rounded-3xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer group bg-white"
    onClick={onClick}
  >
    <div className={`w-12 h-12 rounded-2xl items-center justify-center flex mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${color === 'blue' ? 'bg-blue-50 text-blue-600' :
      color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
        color === 'violet' ? 'bg-violet-50 text-violet-600' : 'bg-amber-50 text-amber-600'
      }`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </Card>
);

const CardItem = ({ card, onCopy, copied, onPin, onFav }: { card: DigitalCard, onCopy: () => void, copied: boolean, onPin: () => void, onFav: () => void }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group h-[380px] w-full"
    >
      <Card className="h-full border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden flex flex-col relative bg-white border border-slate-100">
        {/* Visual Header */}
        <div className={`h-28 w-full bg-gradient-to-br transition-all duration-500 ${card.is_approved ? 'from-slate-900 to-slate-800' : 'from-slate-400 to-slate-500'
          } relative`}>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); onPin(); }} className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${card.is_pinned ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <Pin className={`w-4 h-4 ${card.is_pinned ? '' : 'rotate-45'}`} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onFav(); }} className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${card.is_favorite ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <Star className={`w-4 h-4 ${card.is_favorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 flex flex-col flex-1 pb-6">
          <div className="-mt-12 flex items-end justify-between mb-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white shadow-xl bg-white">
                <AvatarImage src={card.content_json?.avatarUrl} />
                <AvatarFallback className="text-xl font-bold bg-slate-100">
                  {card.title.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {card.is_active && (
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></span>
              )}
            </div>
            <div className="flex gap-1">
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border-none">
                {card.is_active ? 'LIVE' : 'DRAFT'}
              </Badge>
            </div>
          </div>

          <div className="space-y-1 mb-4 flex-1">
            <h3 className="text-xl font-black text-slate-900 leading-tight truncate pr-2">{card.title}</h3>
            <p className="text-sm font-medium text-primary flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              patra.me/{card.vanity_url}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-2">
              {card.content_json?.jobTitle || 'Digital Identity'} {card.content_json?.company ? `at ${card.content_json.company}` : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              className="rounded-2xl border-slate-200 h-10 gap-2 text-xs font-bold hover:bg-slate-50"
              onClick={() => window.open(`/${card.vanity_url}`, '_blank')}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button
              variant="default"
              className="rounded-2xl bg-slate-900 border-none h-10 gap-2 text-xs font-bold shadow-lg shadow-slate-200"
              onClick={() => navigate(`/editor?id=${card.id}`)}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
            <div className="flex-1 flex gap-2">
              <button onClick={onCopy} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" onClick={() => navigate('/analytics')}>
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                <DropdownMenuItem className="rounded-xl"><Share2 className="w-4 h-4 mr-2" /> Share QR</DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl"><ExternalLink className="w-4 h-4 mr-2" /> Open Link</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 rounded-xl font-bold"><Trash2 className="w-4 h-4 mr-2" /> Delete Profile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
