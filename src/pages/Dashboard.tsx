import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, CreditCard, Users, BarChart3, Settings, LogOut, Eye, Edit3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name: string;
  job_title: string;
  role: string;
}

interface DigitalCard {
  id: string;
  title: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  vanity_url: string;
}

export const Dashboard: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border overflow-x-auto">
        <div className="container mx-auto px-4 py-4 min-w-max">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gradient">CardCraft</h1>
                <p className="text-sm text-foreground-muted">Digital Business Cards</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{profile?.display_name}</p>
                <p className="text-sm text-foreground-muted">{profile?.job_title || 'Member'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">{cards.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground-muted">Active Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">
                {cards.filter(card => card.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground-muted">Approved Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">
                {cards.filter(card => card.is_approved).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">--</div>
              <p className="text-xs text-foreground-muted mt-1">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-xs"
                  onClick={() => navigate('/analytics')}
                >
                  View Analytics
                </Button>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">My Digital Cards</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/analytics')} className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button onClick={() => navigate('/editor')} className="gap-2 btn-gradient">
              <Plus className="w-4 h-4" />
              Create New Card
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
              <CardTitle className="mb-2">No cards yet</CardTitle>
              <CardDescription className="mb-6">
                Create your first digital business card to get started
              </CardDescription>
              <Button onClick={() => navigate('/editor')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card.id} className="hover-scale cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <div className="flex space-x-1">
                      {card.is_approved && (
                        <Badge variant="secondary" className="text-xs">Approved</Badge>
                      )}
                      {card.is_active && (
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Created {new Date(card.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};