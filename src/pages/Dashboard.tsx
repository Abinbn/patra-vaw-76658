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
  QrCode
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// New Components
import { QuickAccessPanel } from '@/components/dashboard/QuickAccessPanel';

import { SavedProfilesOverview } from '@/components/dashboard/SavedProfilesOverview';
import { CardDropModal } from '@/components/dashboard/CardDropModal';

interface Profile {
  id: string;
  display_name: string;
  job_title: string;
  role: string;
  avatar_url?: string;
  username?: string;
}

interface DigitalCard {
  id: string;
  title: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  vanity_url: string;
  content_json?: any;
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
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
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
      setCards(data || []);
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

  // Handlers for Quick Access Panel
  const handleShare = () => {
    setCardDropMode('send');
    setIsCardDropOpen(true);
  };

  const handleScan = () => {
    setCardDropMode('receive');
    setIsCardDropOpen(true);
  };

  const handleCreate = () => {
    navigate('/editor');
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.vanity_url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate empty chart data for now (no demo data)
  const emptyChartData = Array(7).fill(0).map((_, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: 0
  }));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const SidebarItem = ({ icon: Icon, label, id, onClick }: { icon: any, label: string, id: string, onClick?: () => void }) => (
    <button
      onClick={() => onClick ? onClick() : setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === id
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  // Render Card Item Helper
  const renderCardItem = (card: DigitalCard, index: number) => (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold truncate pr-4">{card.title}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{new Date(card.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className={card.is_active ? "text-green-500" : "text-yellow-500"}>
                  {card.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-border/50">
                <DropdownMenuItem onClick={() => navigate('/editor')}>
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/${card.vanity_url}`, '_blank')}>
                  <Eye className="w-4 h-4 mr-2" /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="p-3 bg-muted/30 rounded-lg mb-4 flex items-center justify-between group-hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-xs font-bold border">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">patra.me/{card.vanity_url}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => copyToClipboard(`https://patra.me/${card.vanity_url}`, card.id)}
            >
              {copiedId === card.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 gap-2" variant="outline" onClick={() => window.open(`/${card.vanity_url}`, '_blank')}>
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button className="flex-1 gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-none" onClick={() => navigate('/editor')}>
              <Edit3 className="w-4 h-4" /> Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const AccessButton = () => (
    <motion.div
      key="access-connections"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer h-full"
      onClick={() => navigate('/dashboard/access')}
    >
      <div className="h-full min-h-[200px] rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/5 flex flex-col items-center justify-center gap-4 transition-all duration-300">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <Shield className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg">My Connections</h3>
          <p className="text-sm text-muted-foreground">View saved profiles</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <main className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                className="pl-10 bg-muted/50 border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <h2 className="text-lg font-semibold md:hidden">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => toast({ title: "Notifications", description: "No new notifications" })}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="pl-2 pr-4 gap-3 rounded-full hover:bg-muted/50">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium leading-none">{profile?.display_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{profile?.job_title || 'Member'}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border-border/50">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back, {profile?.display_name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's what's happening with your digital cards today.
                </p>
              </div>
            </div>

            {/* Quick Access Panel */}
            <QuickAccessPanel
              onShare={handleShare}
              onScan={handleScan}
              onCreate={() => navigate('/dashboard/access')}
              onAnalytics={handleAnalytics}
            />

            {/* Saved Profiles Overview */}
            <SavedProfilesOverview
              totalSaved={0}
              newThisWeek={0}
              onViewAll={() => navigate('/dashboard/access')}
            />

            {/* Recent Cards Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Your Digital Cards</h2>
                <Button variant="ghost" className="gap-2" onClick={() => setActiveTab('cards')}>
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCards.length === 0 ? (
                  <AccessButton />
                ) : (
                  <>
                    {/* First Card */}
                    {renderCardItem(filteredCards[0], 0)}

                    {/* Access Connections (2nd Position) */}
                    <AccessButton />

                    {/* Rest of Cards */}
                    {filteredCards.slice(1).map((card, index) => renderCardItem(card, index + 1))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Card Drop Modal */}
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
