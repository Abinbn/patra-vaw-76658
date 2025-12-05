import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Search, Loader2, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
            owner_avatar: profileData.avatar_url || ''
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
    try {
      // BIDIRECTIONAL REMOVAL: Remove both directions of the connection
      // 1. Remove current user's save of the other user
      const { error: deleteError1 } = await supabase
        .from('saved_profiles')
        .delete()
        .eq('id', connectionId);

      if (deleteError1) throw deleteError1;

      // 2. Remove the other user's save of current user (bidirectional)
      const { error: deleteError2 } = await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', savedUserId)
        .eq('saved_user_id', user.id);

      // Don't fail if reverse delete fails (might not exist)
      if (deleteError2) {
        console.warn('Bidirectional delete failed:', deleteError2);
      }

      // 3. Remove profile_access records (both directions)
      await supabase
        .from('profile_access')
        .delete()
        .eq('owner_user_id', savedUserId)
        .eq('viewer_user_id', user.id);

      await supabase
        .from('profile_access')
        .delete()
        .eq('owner_user_id', user.id)
        .eq('viewer_user_id', savedUserId);

      setConnections(prev => prev.filter(c => c.id !== connectionId));
      toast({
        title: "Connection Removed",
        description: `Connection with ${ownerName} has been removed for both parties.`,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredConnections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col"
              >
                {/* Digital Card Preview - Embedded iframe */}
                <Card
                  className="relative overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary/50"
                  onClick={() => navigate(`/${connection.card_vanity_url}`)}
                >
                  <div className="aspect-[1.586/1] relative">
                    <iframe
                      src={`/${connection.card_vanity_url}?embed=true`}
                      className="w-full h-full border-0 pointer-events-none"
                      title={`${connection.owner_name}'s Card`}
                      sandbox="allow-same-origin"
                    />
                    {/* Overlay for saved date */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="flex items-center justify-between text-white text-xs">
                        <span>@{connection.card_vanity_url}</span>
                        <span>Saved {new Date(connection.saved_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => navigate(`/${connection.card_vanity_url}`)}
                  >
                    View Profile
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {connection.owner_name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the connection for both you and {connection.owner_name}. Both parties will lose access to each other's cards. You can always reconnect by scanning their QR code again.
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
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
