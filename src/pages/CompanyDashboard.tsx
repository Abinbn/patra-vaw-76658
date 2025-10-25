import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, Users, CreditCard, BarChart3, Settings, LogOut, 
  Eye, Edit3, Copy, RefreshCw, Send, AlertCircle
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Profile {
  id: string;
  display_name: string;
  company_name: string;
  invite_code: string;
  account_type: string;
  board_member_count: number;
  employee_invite_count: number;
  invite_parameters: string[];
  payment_due_date: string | null;
}

interface DigitalCard {
  id: string;
  title: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  vanity_url: string;
}

interface Payment {
  id: string;
  payment_type: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  employee_count: number;
}

const AVAILABLE_PARAMETERS = [
  { id: 'display_name', label: 'Full Name', required: true },
  { id: 'email', label: 'Email', required: true },
  { id: 'phone', label: 'Phone Number', required: false },
  { id: 'job_title', label: 'Job Title', required: false },
  { id: 'bio', label: 'Bio', required: false },
  { id: 'address', label: 'Address', required: false },
  { id: 'avatar_url', label: 'Profile Picture', required: false },
  { id: 'timezone', label: 'Timezone', required: false },
];

export const CompanyDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [boardMemberEmails, setBoardMemberEmails] = useState<string[]>(['', '', '']);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCards();
      fetchPayments();
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
      
      if (data.account_type !== 'company') {
        toast({
          title: "Access Denied",
          description: "This dashboard is only for company accounts",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setProfile(data);
      const params = Array.isArray(data.invite_parameters) 
        ? data.invite_parameters as string[]
        : ['display_name', 'phone', 'email', 'job_title'];
      setSelectedParameters(params);
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
      setCards(data || []);
    } catch (error: any) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profileData) return;

      const { data, error } = await supabase
        .from('company_payments')
        .select('*')
        .eq('company_profile_id', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleRegenerateInviteCode = async () => {
    if (!profile) return;

    try {
      const { data: newCode } = await supabase.rpc('generate_invite_code');
      
      const { error } = await supabase
        .from('profiles')
        .update({ invite_code: newCode })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Invite code regenerated",
        description: "New invite code has been generated successfully"
      });

      fetchProfile();
    } catch (error: any) {
      console.error('Error regenerating invite code:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate invite code",
        variant: "destructive"
      });
    }
  };

  const handleCopyInviteCode = () => {
    if (profile?.invite_code) {
      navigator.clipboard.writeText(profile.invite_code);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard"
      });
    }
  };

  const handleUpdateParameters = async () => {
    if (!profile || selectedParameters.length === 0) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ invite_parameters: selectedParameters })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Parameters updated",
        description: "Data collection parameters have been updated"
      });
    } catch (error: any) {
      console.error('Error updating parameters:', error);
      toast({
        title: "Error",
        description: "Failed to update parameters",
        variant: "destructive"
      });
    }
  };

  const handleParameterToggle = (parameterId: string, isRequired: boolean) => {
    if (isRequired) return; // Can't toggle required fields

    setSelectedParameters(prev => 
      prev.includes(parameterId)
        ? prev.filter(id => id !== parameterId)
        : [...prev, parameterId]
    );
  };

  const handleCreateBoardMemberCards = async () => {
    const validEmails = boardMemberEmails.filter(email => email.trim() !== '');
    
    if (validEmails.length === 0) {
      toast({
        title: "No emails provided",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }

    if (validEmails.length > 5) {
      toast({
        title: "Too many emails",
        description: "Maximum 5 board member cards allowed",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Feature in development",
      description: "Board member card creation will be available soon"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{profile?.company_name || 'Company'}</h1>
                <p className="text-sm text-muted-foreground">Company Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Payment Warning */}
        {payments.some(p => p.status === 'pending' || p.status === 'overdue') && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">Payment Required</h4>
                  <p className="text-sm text-slate-700 mb-3">
                    You have pending payments. Please complete them to avoid account suspension.
                  </p>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    View Payments
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cards.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Board Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.board_member_count || 0}/5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Employees Invited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.employee_invite_count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="invite" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invite">Invite Code</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="board">Board Members</TabsTrigger>
            <TabsTrigger value="cards">All Cards</TabsTrigger>
          </TabsList>

          {/* Invite Code Tab */}
          <TabsContent value="invite" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Invite Code</CardTitle>
                <CardDescription>
                  Share this code with employees to join your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-4 bg-muted rounded-lg font-mono text-2xl font-bold text-center tracking-wider">
                    {profile?.invite_code || 'XXXXXXXX'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopyInviteCode} className="flex-1" variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button onClick={handleRegenerateInviteCode} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm">
                  <p className="font-medium text-slate-900 mb-1">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>Share this invite code with your employees</li>
                    <li>They use it during their onboarding process</li>
                    <li>Their data is automatically linked to your company</li>
                    <li>Pay ₹2 per employee within 2 months</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Collection Parameters</CardTitle>
                <CardDescription>
                  Select what information to collect from employees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {AVAILABLE_PARAMETERS.map((param) => (
                    <div key={param.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={param.id}
                          checked={selectedParameters.includes(param.id)}
                          onCheckedChange={() => handleParameterToggle(param.id, param.required)}
                          disabled={param.required}
                        />
                        <Label htmlFor={param.id} className="cursor-pointer">
                          {param.label}
                        </Label>
                      </div>
                      {param.required && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={handleUpdateParameters} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Save Parameters
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Board Members Tab */}
          <TabsContent value="board" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Board of Directors Cards</CardTitle>
                <CardDescription>
                  Create up to 5 free cards for board members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {boardMemberEmails.map((email, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`board-email-${index}`}>
                        Board Member {index + 1} Email {index < 3 && '(Optional)'}
                      </Label>
                      <Input
                        id={`board-email-${index}`}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...boardMemberEmails];
                          newEmails[index] = e.target.value;
                          setBoardMemberEmails(newEmails);
                        }}
                        placeholder="board.member@company.com"
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={handleCreateBoardMemberCards} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board Member Cards
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">All Cards</h3>
              <Button onClick={() => navigate('/editor')}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Card
              </Button>
            </div>

            {cards.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">No cards yet</CardTitle>
                  <CardDescription className="mb-6">
                    Create your first digital card to get started
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
                  <Card key={card.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                        <div className="flex space-x-1">
                          {card.is_approved && (
                            <Badge variant="secondary">Approved</Badge>
                          )}
                          {card.is_active && (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>
                        Created {new Date(card.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
