import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Search, Loader2, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DigitalCard, CardData } from '@/components/card/DigitalCard';
import { LogViewer } from '@/components/dashboard/LogViewer';

interface SavedConnection {
  id: string;
  saved_user_id: string;
  saved_at: string;
  card_id: string;
  card_title: string;
  card_vanity_url: string;
  card_content: any;
  owner_name: string;
  owner_job_title: string;
  owner_avatar: string;
  is_shared_with_them: boolean;
}

export const AccessManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      // Fetch saved profiles - using simple query without complex joins
      const { data: savedProfiles, error: savedError } = await supabase
        .from('saved_profiles')
        .select('id, saved_user_id, saved_at')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (savedError) throw savedError;

      if (!savedProfiles || savedProfiles.length === 0) {
        setConnections([]);
        return;
      }

      // Fetch profile data for all saved users
      const savedUserIds = savedProfiles.map(sp => sp.saved_user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, job_title, avatar_url')
        .in('user_id', savedUserIds);

      if (profilesError) throw profilesError;

      // Create a map for quick profile lookup
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

      // Fetch people who have saved ME (to check mutual status)
      const { data: sharedWithMe } = await supabase
        .from('saved_profiles')
        .select('user_id')
        .eq('saved_user_id', user.id);

      const sharedWithMeSet = new Set((sharedWithMe || []).map(s => s.user_id));

      // For each saved profile, fetch their active card
      const connectionsWithCards = await Promise.all(
        savedProfiles.map(async (profile) => {
          const profileData = profilesMap.get(profile.saved_user_id);

          if (!profileData) return null;

          const { data: card } = await supabase
            .from('digital_cards')
            .select('id, title, vanity_url, content_json')
            .eq('owner_user_id', profileData.user_id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!card) return null;

          return {
            id: profile.id,
            saved_user_id: profile.saved_user_id,
            saved_at: profile.saved_at,
            card_id: card.id,
            card_title: card.title,
            card_vanity_url: card.vanity_url,
            card_content: card.content_json,
            owner_name: profileData.display_name || 'User',
            owner_job_title: profileData.job_title || '',
            owner_avatar: profileData.avatar_url || '',
            is_shared_with_them: sharedWithMeSet.has(profile.saved_user_id)
          };
        })
      );

      setConnections(connectionsWithCards.filter(Boolean) as SavedConnection[]);
    } catch (error: any) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (connectionId: string, savedUserId: string, ownerName: string) => {
    if (!user) return;

    try {
      // Remove ONLY my save of them (I stop seeing them)
      const { error: deleteError } = await supabase
        .from('saved_profiles')
        .delete()
        .eq('id', connectionId);

      if (deleteError) throw deleteError;

      // Remove my access to them
      await supabase
        .from('profile_access')
        .delete()
        .eq('owner_user_id', savedUserId)
        .eq('viewer_user_id', user.id);

      // Log the removal
      await supabase.from('access_logs').insert({
        actor_id: user.id,
        target_id: savedUserId,
        action_type: 'removed_access'
      });

      setConnections(prev => prev.filter(c => c.id !== connectionId));
      toast({
        title: "Connection Removed",
        description: `You have removed ${ownerName} from your connections.`,
      });
    } catch (error: any) {
      console.error('Error removing connection:', error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive"
      });
    }
  };

  const handleRevokeAccess = async (savedUserId: string, ownerName: string) => {
    if (!user) return;

    try {
      // Remove THEIR save of ME (They stop seeing me)
      const { error: deleteError } = await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', savedUserId)
        .eq('saved_user_id', user.id);

      if (deleteError) throw deleteError;

      // Remove their access to me
      await supabase
        .from('profile_access')
        .delete()
        .eq('owner_user_id', user.id)
        .eq('viewer_user_id', savedUserId);

      // Log the revocation
      await supabase.from('access_logs').insert({
        actor_id: user.id,
        target_id: savedUserId,
        action_type: 'revoked_access'
      });

      // Update local state to reflect they no longer see me
      setConnections(prev => prev.map(c =>
        c.saved_user_id === savedUserId
          ? { ...c, is_shared_with_them: false }
          : c
      ));

      toast({
        title: "Access Revoked",
        description: `You have revoked ${ownerName}'s access to your profile.`,
      });
    } catch (error: any) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive"
      });
    }
  };

  const filteredConnections = connections.filter(conn =>
    conn.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.card_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.card_vanity_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full hover:bg-muted">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  My Connections
                </h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  Cards you've saved from others
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-xl font-bold text-foreground">
                <span className="text-muted-foreground">P</span>atra
              </div>
              <LogViewer />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Bar */}
        <div className="relative w-full max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Cards Grid */}
        {filteredConnections.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Connections Yet</h3>
            <p className="text-muted-foreground mb-6">
              Scan someone's QR code to save their card and create a connection
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredConnections.map((connection, index) => {
              const cardData: CardData = {
                fullName: connection.card_content.fullName || connection.card_title || '',
                jobTitle: connection.card_content.jobTitle || '',
                company: connection.card_content.company || '',
                email: connection.card_content.email || '',
                phone: connection.card_content.phone || '',
                avatarUrl: connection.card_content.avatarUrl || '',
                vanityUrl: connection.card_vanity_url,
                cardConfig: connection.card_content.cardConfig,
                bannerType: connection.card_content.bannerType,
                bannerValue: connection.card_content.bannerValue
              };

              return (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {/* Digital Card Component */}
                  <div className="relative mb-4 transform hover:scale-105 transition-transform duration-300">
                    <DigitalCard
                      cardData={cardData}
                      username={connection.card_vanity_url}
                      width={350}
                      height={220}
                    />

                    {/* Overlay for saved date */}
                    <div className="absolute -bottom-6 left-0 right-0 text-center">
                      <span className="text-xs text-muted-foreground">
                        Saved {new Date(connection.saved_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons & Status Text */}
                  <div className="flex flex-col gap-3 mt-6 w-full max-w-[350px]">
                    {/* Status Message */}
                    <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground text-center">
                      {connection.is_shared_with_them ? (
                        <p>
                          Your profile is shared to {connection.owner_name}, therefore you now have access to {connection.owner_name}'s profile.
                          If you no longer want to share your profile with {connection.owner_name}, you can revoke access.
                        </p>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => navigate(`/${connection.card_vanity_url}`)}
                      >
                        View Profile
                      </Button>

                      {connection.is_shared_with_them && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                              Revoke Access
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke access for {connection.owner_name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will stop sharing your profile with {connection.owner_name}. They will no longer see your card in their connections. You will still retain access to their profile.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeAccess(connection.saved_user_id, connection.owner_name)}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Revoke Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" title="Remove from my connections">
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {connection.owner_name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {connection.owner_name} from your connections list. You will lose access to their card.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveConnection(connection.id, connection.saved_user_id, connection.owner_name)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
