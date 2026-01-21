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
  Eye, Edit3, Copy, RefreshCw, Send, AlertCircle,
  UserCheck, UserX, Link as LinkIcon, Globe, ShieldCheck, UserPlus,
  ArrowLeft
} from 'lucide-react';


import { Checkbox } from '@/components/ui/checkbox';

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Profile {
  id: string;
  display_name: string;
  company_name: string;
  invite_code: string;
  account_type: string;
  board_member_count: number;
  employee_invite_count: number;
  invite_parameters: Json;
  display_parameters: Json;
  payment_due_date: string | null;
  vanity_url: string | null;
}

interface DigitalCard {
  id: string;
  title: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  vanity_url: string;
}

interface Employee {
  id: string;
  employee_user_id: string;
  status: string;
  joined_at: string;
  designation: string;
  is_approved: boolean;
  data_submitted: any;
  profiles: {
    display_name: string;
    avatar_url: string;
    vanity_url: string;
  };
}

const AVAILABLE_PARAMETERS = [
  { id: 'display_name', label: 'Full Name', required: true },
  { id: 'email', label: 'Email', required: true },
  { id: 'phone', label: 'Phone Number', required: false },
  { id: 'job_title', label: 'Job Title', required: false },
  { id: 'bio', label: 'Bio', required: false },
  { id: 'address', label: 'Address', required: false },
  { id: 'avatar_url', label: 'Profile Picture', required: false },
];

export const CompanyDashboard: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [displayParameters, setDisplayParameters] = useState<string[]>([]);
  const [companyVanity, setCompanyVanity] = useState('');
  const [editingDesignation, setEditingDesignation] = useState<{ id: string, value: string } | null>(null);

  useEffect(() => {
    // Only proceed once auth has finished loading the session
    if (!authLoading) {
      if (user) {
        const loadAll = async () => {
          try {
            setLoading(true);
            const fetchedProfile = await fetchProfile();
            await fetchCards();
            if (fetchedProfile) {
              await fetchEmployees(fetchedProfile.id);
            }
          } catch (err) {
            console.error("Dashboard core loading failed:", err);
          } finally {
            setLoading(false);
          }
        };
        loadAll();
      } else {
        // If auth loaded but no user, stop loading (DashboardRouter handles redirect)
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data.account_type !== 'company') {
        navigate('/dashboard');
        return null;
      }

      if (data.account_type === 'company' && !data.invite_code) {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ invite_code: newCode })
          .eq('id', data.id);
        if (!updateError) data.invite_code = newCode;
      }

      setProfile(data);
      setCompanyVanity(data.vanity_url || '');

      const inviteParams = Array.isArray(data.invite_parameters)
        ? data.invite_parameters as string[]
        : ['display_name', 'email'];
      setSelectedParameters(inviteParams);

      const displayParams = Array.isArray(data.display_parameters)
        ? data.display_parameters as string[]
        : ['display_name', 'email', 'job_title'];
      setDisplayParameters(displayParams);

      return data;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      return null;
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
    }
  };

  const fetchEmployees = async (companyId?: string) => {
    const idToUse = companyId || profile?.id;
    if (!idToUse) return;

    try {
      const { data, error } = await supabase
        .from('invited_employees')
        .select(`
          *,
          profiles:employee_profile_id (
            display_name,
            avatar_url,
            vanity_url
          )
        `)
        .eq('company_profile_id', idToUse)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
    }
  };

  const totalViews = employees.reduce((sum, emp) => sum + (Math.floor(Math.random() * 50)), 0); // Simulated for now


  const handleUpdateVanity = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ vanity_url: companyVanity })
        .eq('id', profile.id);
      if (error) throw error;
      toast({ title: "Success", description: "Company vanity URL updated" });
      fetchProfile();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleApproveEmployee = async (empId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('invited_employees')
        .update({ is_approved: approve, status: approve ? 'joined' : 'rejected' })
        .eq('id', empId);
      if (error) throw error;
      toast({ title: approve ? "Employee Approved" : "Employee Rejected" });
      fetchEmployees();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateDesignation = async () => {
    if (!editingDesignation) return;
    try {
      const { error } = await supabase
        .from('invited_employees')
        .update({ designation: editingDesignation.value })
        .eq('id', editingDesignation.id);
      if (error) throw error;
      toast({ title: "Designation updated" });
      setEditingDesignation(null);
      fetchEmployees();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const currentInviteLink = `${window.location.origin}/invite?id=${profile?.invite_code}`;

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => {
                if (window.history.length > 2) navigate(-1);
                else navigate('/');
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900">{profile?.company_name || 'Company'} Dashboard</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Corporate Control Panel</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="w-5 h-5 text-slate-500" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{employees.filter(e => e.is_approved).length}</div>
              <p className="text-indigo-100/80 text-sm mt-1">Verified employees in your network</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-medium uppercase tracking-wider">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">{employees.filter(e => !e.is_approved && e.status !== 'rejected').length}</div>
              <p className="text-slate-500 text-sm mt-1">New join requests waiting for you</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">{totalViews}</div>
              <p className="text-slate-500 text-sm mt-1">Combined views across all staff</p>
            </CardContent>
          </Card>
        </div>


        <Tabs defaultValue="staff" className="space-y-6">
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm inline-flex min-w-max">
              <TabsTrigger value="staff" className="rounded-lg px-6">Staff Directory</TabsTrigger>
              <TabsTrigger value="directors" className="rounded-lg px-6">Director ID Cards</TabsTrigger>
              <TabsTrigger value="invites" className="rounded-lg px-6">Invite Links</TabsTrigger>
              <TabsTrigger value="parameters" className="rounded-lg px-6">Data Collection</TabsTrigger>
              <TabsTrigger value="display" className="rounded-lg px-6">ID Card Design</TabsTrigger>
              <TabsTrigger value="branding" className="rounded-lg px-6">Branding</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="staff">
            <Card className="shadow-md border-none overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Employee Directory</CardTitle>
                  <CardDescription>Manage your staff, their designations, and access.</CardDescription>
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchEmployees()} className="flex-1 sm:flex-initial">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 flex-1 sm:flex-initial">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="min-w-[200px]">Employee</TableHead>
                      <TableHead className="min-w-[150px]">Designation</TableHead>
                      <TableHead className="min-w-[150px]">Joined Date</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="text-right min-w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                              {emp.profiles?.avatar_url ? (
                                <img src={emp.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-slate-900">{emp.profiles?.display_name || 'New User'}</div>
                              <div className="text-xs text-slate-500">{emp.data_submitted?.email || 'No email provided'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">{emp.designation || 'Not Assigned'}</span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setEditingDesignation({ id: emp.id, value: emp.designation || '' })}>
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Designation</DialogTitle>
                                  <DialogDescription>Assign a professional title for {emp.profiles?.display_name}.</DialogDescription>
                                </DialogHeader>
                                <Input
                                  value={editingDesignation?.value || ''}
                                  onChange={(e) => setEditingDesignation(prev => prev ? { ...prev, value: e.target.value } : null)}
                                  placeholder="e.g. Senior Software Engineer"
                                />
                                <DialogFooter>
                                  <Button onClick={handleUpdateDesignation}>Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {new Date(emp.joined_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {emp.is_approved ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active</Badge>
                          ) : emp.status === 'rejected' ? (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Rejected</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none animate-pulse">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!emp.is_approved && emp.status !== 'rejected' ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApproveEmployee(emp.id, true)}>
                                <UserCheck className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleApproveEmployee(emp.id, false)}>
                                <UserX className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              {emp.profiles?.vanity_url ? (
                                <Button size="sm" variant="ghost" className="text-indigo-600" onClick={() => window.open(`/${profile?.vanity_url}?userid=${emp.profiles.vanity_url}`, '_blank')}>
                                  <LinkIcon className="w-4 h-4 mr-1" /> View ID
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-400 italic mr-3">Pending Activation</span>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-slate-500">View Data</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Collected Data: {emp.profiles?.display_name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    {Object.entries(emp.data_submitted || {}).map(([key, value]) => (
                                      <div key={key} className="flex flex-col border-b border-slate-100 pb-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{key.replace('_', ' ')}</span>
                                        <span className="text-slate-900">{String(value)}</span>
                                      </div>
                                    ))}
                                    {Object.keys(emp.data_submitted || {}).length === 0 && (
                                      <p className="text-center text-slate-500 italic">No data collected yet</p>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="directors">
            <Card className="shadow-md border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Director & Executive Cards</CardTitle>
                  <CardDescription>Manage cards for your board of directors. (Limited to 2 free cards)</CardDescription>
                </div>
                <Button
                  size="sm"
                  disabled={cards.length >= 2}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                  onClick={() => navigate('/corporate-editor')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Director Card
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cards.map((card) => (
                    <div key={card.id} className="p-4 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-indigo-600">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{card.title}</h4>
                          <p className="text-xs text-slate-500 font-mono">{window.location.host}/{card.vanity_url}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/corporate-editor?id=${card.id}`)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => window.open(`/${card.vanity_url}`, '_blank')}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No director cards created yet</p>
                      <p className="text-xs text-slate-400 mt-1">Create up to 2 high-priority cards for your board</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites">
            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle>Company Invitation System</CardTitle>
                <CardDescription>Generate and manage unique links for employees to join your organization.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-4 block">Active Invite Link</Label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 font-mono text-sm sm:text-lg border border-white/10 select-all overflow-hidden text-ellipsis break-all">
                        {currentInviteLink}
                      </div>
                      <Button className="h-12 sm:h-full py-4 bg-white text-slate-900 hover:bg-slate-100" onClick={() => {
                        navigator.clipboard.writeText(currentInviteLink);
                        toast({ title: "Copied!", description: "Invite link copied to clipboard" });
                      }}>
                        <Copy className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <UserPlus className="w-32 h-32" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-slate-200 rounded-2xl space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900">Security Control</h4>
                    <p className="text-sm text-slate-500">Regenerating the link will invalidate all previous invite codes immediately.</p>
                    <Button variant="outline" className="w-full" onClick={() => { }}>Regenerate Code</Button>
                  </div>
                  <div className="p-6 border border-slate-200 rounded-2xl space-y-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-2">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900">Invite Usage</h4>
                    <p className="text-sm text-slate-500">You have {employees.length} employees currently using this invite system.</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-[45%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle>Company Identity & Security</CardTitle>
                <CardDescription>Personalize how your company appears and manage global security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Company Vanity URL</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center bg-slate-100 rounded-lg px-3 border border-slate-200">
                        <Globe className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-slate-500 text-sm">{window.location.host}/</span>
                        <input
                          className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 flex-1 ml-1"
                          value={companyVanity}
                          onChange={(e) => setCompanyVanity(e.target.value)}
                          placeholder="your-company-name"
                        />
                      </div>
                      <Button onClick={handleUpdateVanity}>Save</Button>
                    </div>
                    <p className="text-xs text-slate-500 italic">This URL will be used to host your corporate ID cards.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Global Security & Policy
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Enforce Verification Badge</p>
                        <p className="text-sm text-slate-500">Show "Verified by {profile?.company_name}" on all cards.</p>
                      </div>
                      <Checkbox checked={true} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Auto-Deactivate on Termination</p>
                        <p className="text-sm text-slate-500">Automatically disable card if employee is removed from directory.</p>
                      </div>
                      <Checkbox checked={true} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Corporate Theme Lock</p>
                        <p className="text-sm text-slate-500">Prevent employees from changing the standard corporate theme.</p>
                      </div>
                      <Checkbox />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="parameters">
            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle>Onboarding Requirements</CardTitle>
                <CardDescription>Select what data points employees must provide when joining your organization.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_PARAMETERS.map(param => (
                    <div key={param.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`collect-${param.id}`}
                          checked={selectedParameters.includes(param.id)}
                          onCheckedChange={(checked) => {
                            if (param.required) return;
                            setSelectedParameters(prev =>
                              checked
                                ? [...prev, param.id]
                                : prev.filter(p => p !== param.id)
                            );
                          }}
                          disabled={param.required}
                        />
                        <Label htmlFor={`collect-${param.id}`} className="font-medium cursor-pointer">{param.label}</Label>
                      </div>
                      {param.required && <Badge variant="secondary" className="bg-slate-200 text-slate-600 border-none">Required</Badge>}
                    </div>
                  ))}
                </div>
                <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 px-8" onClick={async () => {
                  const { error } = await supabase.from('profiles').update({ invite_parameters: selectedParameters }).eq('id', profile!.id);
                  if (!error) toast({ title: "Requirements updated" });
                }}>
                  Save Requirements
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display">
            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle>Digital ID Card Display</CardTitle>
                <CardDescription>Choose which pieces of collected data should be visible on the public ID card.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_PARAMETERS.map(param => (
                    <div key={param.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedParameters.includes(param.id) ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/30 border-dashed border-slate-200 opacity-50'}`}>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`show-${param.id}`}
                          checked={displayParameters.includes(param.id)}
                          disabled={!selectedParameters.includes(param.id)}
                          onCheckedChange={(checked) => {
                            setDisplayParameters(prev =>
                              checked
                                ? [...prev, param.id]
                                : prev.filter(p => p !== param.id)
                            );
                          }}
                        />
                        <div className="flex flex-col">
                          <Label htmlFor={`show-${param.id}`} className="font-medium cursor-pointer">{param.label}</Label>
                          {!selectedParameters.includes(param.id) && <span className="text-[10px] text-amber-600 font-bold">Not being collected</span>}
                        </div>
                      </div>
                      <Badge variant="outline" className={`${displayParameters.includes(param.id) ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                        {displayParameters.includes(param.id) ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 px-8" onClick={async () => {
                  const { error } = await supabase.from('profiles').update({ display_parameters: displayParameters }).eq('id', profile!.id);
                  if (!error) toast({ title: "Card design updated" });
                }}>
                  Update ID Cards
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
