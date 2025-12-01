import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/AdminSidebar';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { toast } from '@/hooks/use-toast';
import {
  Shield, Plus, Edit, Trash2, Eye, Send, Mail, Megaphone,
  TrendingUp, Users, CreditCard, Activity,
  CheckCircle, Clock, XCircle, ExternalLink, ChevronDown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Dashboard data
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    totalUsers: 0,
    templates: 0,
    announcements: 0,
    pendingFeedback: 0,
  });

  // Section-specific data
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('');
  const [docContent, setDocContent] = useState<string>('');

  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 'normal',
    sendToAll: false,
    targetUserId: null as string | null,
  });

  const [docPages, setDocPages] = useState<any[]>([]);
  const [isNewDoc, setIsNewDoc] = useState(false);

  // Background image form state
  const [backgroundImages, setBackgroundImages] = useState<any[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [bgImageForm, setBgImageForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    tags: [] as string[],
    uploadMode: 'url' as 'url' | 'upload',
    imageFile: null as File | null,
  });
  const [tagInput, setTagInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // New Features State
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // System Settings (Persisted in LocalStorage for demo)
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    enableAiFeatures: true,
    maxCardsPerUser: 5,
  });

  // Mock Chart Data (since we don't have historical data API)
  const chartData = [
    { name: 'Jan', users: 40, cards: 24 },
    { name: 'Feb', users: 30, cards: 13 },
    { name: 'Mar', users: 20, cards: 98 },
    { name: 'Apr', users: 27, cards: 39 },
    { name: 'May', users: 18, cards: 48 },
    { name: 'Jun', users: 23, cards: 38 },
    { name: 'Jul', users: 34, cards: 43 },
  ];

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin && activeSection === 'dashboard') {
      loadDashboardData();
    } else if (isAdmin && activeSection === 'announcements') {
      loadAnnouncements();
    } else if (isAdmin && activeSection === 'feedback') {
      loadFeedback();
    } else if (isAdmin && activeSection === 'users') {
      loadUsers();
    } else if (isAdmin && activeSection === 'templates') {
      loadTemplates();
      loadBackgroundImages();
      loadExistingTags();
    } else if (isAdmin && activeSection === 'settings') {
      loadSystemSettings();
    }
  }, [isAdmin, activeSection]);

  useEffect(() => {
    if (isAdmin) {
      loadRecentActivity();
    }
  }, [isAdmin]);

  const loadSystemSettings = () => {
    const saved = localStorage.getItem('patra_system_settings');
    if (saved) {
      setSystemSettings(JSON.parse(saved));
    }
  };

  const saveSystemSettings = (newSettings: any) => {
    setSystemSettings(newSettings);
    localStorage.setItem('patra_system_settings', JSON.stringify(newSettings));
    toast({ title: 'Settings Saved', description: 'System configuration updated.' });
  };

  const loadRecentActivity = async () => {
    try {
      const [usersRes, cardsRes] = await Promise.all([
        supabase.from('profiles').select('id, display_name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('digital_cards').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      const activities = [
        ...(usersRes.data || []).map(u => ({ type: 'user', ...u })),
        ...(cardsRes.data || []).map(c => ({ type: 'card', ...c }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error || !data) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [cardsRes, usersRes, templatesRes, announcementsRes, feedbackRes] = await Promise.all([
        supabase.from('digital_cards').select('id, is_active', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('templates').select('id', { count: 'exact' }),
        supabase.from('announcements').select('id', { count: 'exact' }),
        supabase.from('feedback_submissions').select('id, status', { count: 'exact' }),
      ]);

      setStats({
        totalCards: cardsRes.count || 0,
        activeCards: cardsRes.data?.filter(c => c.is_active).length || 0,
        totalUsers: usersRes.count || 0,
        templates: templatesRes.count || 0,
        announcements: announcementsRes.count || 0,
        pendingFeedback: feedbackRes.data?.filter(f => f.status === 'pending').length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  };

  const loadFeedback = async () => {
    const { data } = await supabase
      .from('feedback_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setFeedback(data);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setUsers(data);
  };

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTemplates(data);
  };

  const loadBackgroundImages = async () => {
    const { data } = await supabase
      .from('background_images')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBackgroundImages(data);
  };

  const loadExistingTags = async () => {
    const { data } = await supabase
      .from('background_images')
      .select('tags');
    if (data) {
      const allTags = new Set<string>();
      data.forEach((item: any) => {
        if (item.tags) {
          item.tags.forEach((tag: string) => allTags.add(tag));
        }
      });
      setExistingTags(Array.from(allTags).sort());
    }
  };

  const loadDocPages = async () => {
    try {
      const { data, error } = await supabase
        .from('documentation_pages')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setDocPages(data);
    } catch (error) {
      console.error('Error loading documentation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documentation pages',
        variant: 'destructive',
      });
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBgImageForm({ ...bgImageForm, imageFile: e.target.files[0] });
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !bgImageForm.tags.includes(tag)) {
      setBgImageForm({ ...bgImageForm, tags: [...bgImageForm.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBgImageForm({
      ...bgImageForm,
      tags: bgImageForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleCreateBackgroundImage = async () => {
    if (!bgImageForm.name) {
      toast({
        title: 'Error',
        description: 'Please enter a title for the image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingImage(true);
      let finalImageUrl = bgImageForm.imageUrl;

      // Handle file upload if in upload mode
      if (bgImageForm.uploadMode === 'upload' && bgImageForm.imageFile) {
        const fileExt = bgImageForm.imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `background-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, bgImageForm.imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      if (!finalImageUrl) {
        toast({
          title: 'Error',
          description: 'Please provide an image URL or upload a file',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('background_images')
        .insert({
          name: bgImageForm.name,
          description: bgImageForm.description || null,
          image_url: finalImageUrl,
          tags: bgImageForm.tags,
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Background image added successfully',
      });

      // Reset form
      setBgImageForm({
        name: '',
        description: '',
        imageUrl: '',
        tags: [],
        uploadMode: 'url',
        imageFile: null,
      });

      // Reload images
      loadBackgroundImages();
      loadExistingTags();
    } catch (error) {
      console.error('Error creating background image:', error);
      toast({
        title: 'Error',
        description: 'Failed to add background image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const { data: announcement, error } = await supabase
        .from('announcements')
        .insert({
          title: announcementForm.title,
          content: announcementForm.content,
          type: announcementForm.type,
          priority: announcementForm.priority,
          send_to_all: announcementForm.sendToAll,
          is_published: true,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send to specific user or all users
      if (announcementForm.targetUserId) {
        await supabase.from('announcements_recipients').insert({
          announcement_id: announcement.id,
          user_id: announcementForm.targetUserId,
        });
      } else if (announcementForm.sendToAll) {
        const { data: allUsers } = await supabase.from('profiles').select('user_id');

        if (allUsers && allUsers.length > 0) {
          const recipients = allUsers.map(u => ({
            announcement_id: announcement.id,
            user_id: u.user_id,
          }));

          await supabase.from('announcements_recipients').insert(recipients);
        }
      }

      toast({
        title: 'Success',
        description: 'Announcement created and sent',
      });

      setAnnouncementForm({
        title: '',
        content: '',
        type: 'info',
        priority: 'normal',
        sendToAll: false,
        targetUserId: null,
      });

      loadAnnouncements();
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to create announcement',
        variant: 'destructive',
      });
    }
  };

  const handleSendResponse = async (feedbackItem: any, method: 'email' | 'announcement') => {
    if (method === 'announcement') {
      setAnnouncementForm({
        title: `Re: ${feedbackItem.subject}`,
        content: '',
        type: 'info',
        priority: 'normal',
        sendToAll: false,
        targetUserId: feedbackItem.user_id,
      });
      setActiveSection('announcements');
    } else {
      // Email functionality - would require backend email service
      toast({
        title: 'Email Response',
        description: 'Email integration coming soon. Use announcement for now.',
      });
    }
  };

  const handleViewProfile = (userId: string) => {
    // Navigate to user's profile view
    window.open(`/admin/user/${userId}`, '_blank');
  };

  const handleOpenUserModal = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUpdateFeedbackStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('feedback_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Status updated',
      });

      loadFeedback();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 overflow-y-auto md:ml-0 ml-16">
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground">System overview and analytics</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setActiveSection('announcements')} size="sm">
                    <Megaphone className="w-4 h-4 mr-2" />
                    New Announcement
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      Total Cards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl font-bold">{stats.totalCards}</p>
                      <Badge variant="outline" className="text-green-600 bg-green-500/10">
                        {stats.activeCards} active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-500" />
                      Pending Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.pendingFeedback}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-500" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                      <span className="font-medium">
                        {systemSettings.maintenanceMode ? 'Maintenance' : 'Operational'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Growth Analytics</CardTitle>
                    <CardDescription>User and Card acquisition trends</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <Tooltip />
                        <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                        <Area type="monotone" dataKey="cards" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCards)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recent Activity Feed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                            <div className={`p-2 rounded-full ${item.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                              {item.type === 'user' ? <Users className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {item.type === 'user' ? 'New User Joined' : 'New Card Created'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.type === 'user' ? item.display_name : item.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Announcements Section */}
          {activeSection === 'announcements' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Announcements</h1>
                <p className="text-muted-foreground">Create and manage system announcements</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Create Announcement</CardTitle>
                  <CardDescription>Send announcements to users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      placeholder="Announcement title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Content</Label>
                    <MarkdownEditor
                      value={announcementForm.content}
                      onChange={(content) => setAnnouncementForm({ ...announcementForm, content })}
                      placeholder="Write your announcement in markdown..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={announcementForm.type}
                        onValueChange={(v) => setAnnouncementForm({ ...announcementForm, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={announcementForm.priority}
                        onValueChange={(v) => setAnnouncementForm({ ...announcementForm, priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={announcementForm.sendToAll}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, sendToAll: e.target.checked, targetUserId: null })}
                      className="rounded"
                      disabled={!!announcementForm.targetUserId}
                    />
                    <Label>Send to all users</Label>
                  </div>

                  {announcementForm.targetUserId && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Sending to specific user: {announcementForm.targetUserId}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAnnouncementForm({ ...announcementForm, targetUserId: null })}
                      >
                        Clear Target
                      </Button>
                    </div>
                  )}

                  <Button onClick={handleCreateAnnouncement}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Announcement
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{ann.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{ann.content.substring(0, 100)}...</p>
                          <div className="flex gap-2 mt-2">
                            <Badge>{ann.type}</Badge>
                            <Badge variant="outline">{ann.priority}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feedback Section */}
          {activeSection === 'feedback' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Feedback & Support</h1>
                  <p className="text-muted-foreground">Manage user feedback and support tickets</p>
                </div>
                <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Feedback</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {feedback
                  .filter(f => feedbackFilter === 'all' || f.status === feedbackFilter)
                  .map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{item.subject}</CardTitle>
                            <CardDescription className="mt-1">
                              From: {item.user_name} ({item.user_email})
                            </CardDescription>
                          </div>
                          <Badge variant={item.status === 'resolved' ? 'default' : item.status === 'pending' ? 'destructive' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg text-sm">
                          {item.content}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {item.ip_address && <span>IP: {item.ip_address}</span>}
                          {item.user_phone && <span>Phone: {item.user_phone}</span>}
                          <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap items-center pt-2 border-t">
                          <span className="text-sm font-medium mr-2">Update Status:</span>
                          <Select
                            value={item.status}
                            onValueChange={(v) => handleUpdateFeedbackStatus(item.id, v)}
                          >
                            <SelectTrigger className="w-[150px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="flex-1" />

                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${item.user_email}?subject=Re: ${item.subject}`}>
                              <Mail className="w-4 h-4 mr-2" />
                              Reply via Email
                            </a>
                          </Button>

                          <Button variant="outline" size="sm" onClick={() => handleSendResponse(item, 'announcement')}>
                            <Megaphone className="w-4 h-4 mr-2" />
                            Send Announcement
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {feedback.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No feedback found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">User Management</h1>
                  <p className="text-muted-foreground">View and manage user accounts</p>
                </div>
                <div className="relative w-64">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  <Users className="w-4 h-4 absolute left-2.5 top-3 text-muted-foreground" />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Account Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users
                          .filter(u =>
                            u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((userItem) => (
                            <TableRow key={userItem.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={userItem.avatar_url} />
                                    <AvatarFallback>{userItem.display_name?.charAt(0) || 'U'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{userItem.display_name || 'N/A'}</div>
                                    <div className="text-xs text-muted-foreground">{userItem.user_id.substring(0, 8)}...</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">{userItem.account_type || 'individual'}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                                  {userItem.role || 'member'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(userItem.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenUserModal(userItem)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setAnnouncementForm({
                                        ...announcementForm,
                                        targetUserId: userItem.user_id,
                                        sendToAll: false,
                                      });
                                      setActiveSection('announcements');
                                    }}
                                  >
                                    <Send className="w-4 h-4 mr-1" />
                                    Message
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Templates Section */}
          {activeSection === 'templates' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Background Templates</h1>
                <p className="text-muted-foreground">Manage background images and templates</p>
              </div>

              {/* Add New Background Image Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Background Image</CardTitle>
                  <CardDescription>Upload or link a new background template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bg-title">Title *</Label>
                    <Input
                      id="bg-title"
                      value={bgImageForm.name}
                      onChange={(e) => setBgImageForm({ ...bgImageForm, name: e.target.value })}
                      placeholder="e.g., Abstract Gradient"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bg-description">Description (Optional)</Label>
                    <Textarea
                      id="bg-description"
                      value={bgImageForm.description}
                      onChange={(e) => setBgImageForm({ ...bgImageForm, description: e.target.value })}
                      placeholder="Brief description of the template"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image Source</Label>
                    <div className="flex gap-2 mb-3">
                      <Button
                        type="button"
                        variant={bgImageForm.uploadMode === 'url' ? 'default' : 'outline'}
                        onClick={() => setBgImageForm({ ...bgImageForm, uploadMode: 'url' })}
                        size="sm"
                      >
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={bgImageForm.uploadMode === 'upload' ? 'default' : 'outline'}
                        onClick={() => setBgImageForm({ ...bgImageForm, uploadMode: 'upload' })}
                        size="sm"
                      >
                        Upload
                      </Button>
                    </div>

                    {bgImageForm.uploadMode === 'url' ? (
                      <Input
                        value={bgImageForm.imageUrl}
                        onChange={(e) => setBgImageForm({ ...bgImageForm, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    ) : (
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bg-tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(tagInput);
                          }
                        }}
                        placeholder="Type tag and press Enter"
                        list="existing-tags"
                      />
                      <datalist id="existing-tags">
                        {existingTags.map((tag) => (
                          <option key={tag} value={tag} />
                        ))}
                      </datalist>
                      <Button
                        type="button"
                        onClick={() => handleAddTag(tagInput)}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {bgImageForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bgImageForm.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag} <XCircle className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCreateBackgroundImage}
                    disabled={uploadingImage}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Adding...' : 'Add Background Image'}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Background Images */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Existing Background Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {backgroundImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={image.image_url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-sm">{image.name}</CardTitle>
                        {image.description && (
                          <CardDescription className="text-xs">{image.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {image.tags && image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {image.tags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {backgroundImages.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No background images yet. Add one above to get started.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Documentation Section */}
          {activeSection === 'docs' && (
            <div className="space-y-6 scroll-smooth">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Documentation Editor</h1>
                  <p className="text-muted-foreground">Edit API docs and guides using markdown</p>
                </div>
                <Button onClick={() => setIsNewDoc(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Document
                </Button>
              </div>

              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isNewDoc ? 'Create New Document' : 'Edit Documentation'}
                    </CardTitle>
                    <CardDescription>Use markdown to format your content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isNewDoc ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Document Title</Label>
                          <Input
                            placeholder="Enter document title"
                            value={selectedDoc}
                            onChange={(e) => setSelectedDoc(e.target.value)}
                          />
                        </div>
                        <MarkdownEditor
                          value={docContent}
                          onChange={setDocContent}
                          placeholder="Write your documentation in markdown..."
                        />
                        <div className="flex gap-2">
                          <Button onClick={async () => {
                            try {
                              const pageId = selectedDoc.toLowerCase().replace(/\s+/g, '-');
                              const { error } = await supabase
                                .from('documentation_pages')
                                .insert({
                                  page_id: pageId,
                                  title: selectedDoc,
                                  content: docContent,
                                  is_published: true,
                                  created_by: user?.id,
                                });

                              if (error) throw error;

                              toast({ title: 'Document Created', description: 'Successfully created new document' });
                              setIsNewDoc(false);
                              setDocContent('');
                              setSelectedDoc('');
                              loadDocPages();
                            } catch (error: any) {
                              toast({
                                title: 'Error',
                                description: error.message || 'Failed to create document',
                                variant: 'destructive'
                              });
                            }
                          }}>
                            Create Document
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setIsNewDoc(false);
                            setDocContent('');
                            setSelectedDoc('');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Select Document</Label>
                          <Select value={selectedDoc} onValueChange={(value) => {
                            setSelectedDoc(value);
                            // Load existing content
                            const doc = docPages.find(d => d.id === value);
                            if (doc) setDocContent(doc.content);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a document to edit" />
                            </SelectTrigger>
                            <SelectContent>
                              {docPages.map((doc) => (
                                <SelectItem key={doc.id} value={doc.id}>
                                  {doc.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedDoc && (
                          <>
                            <div className="space-y-2">
                              <Label>Document Title</Label>
                              <Input
                                placeholder="Enter document title"
                                value={docPages.find(d => d.id === selectedDoc)?.title || ''}
                                onChange={(e) => {
                                  const doc = docPages.find(d => d.id === selectedDoc);
                                  if (doc) {
                                    setDocPages(docPages.map(d =>
                                      d.id === selectedDoc ? { ...d, title: e.target.value } : d
                                    ));
                                  }
                                }}
                              />
                            </div>
                            <MarkdownEditor
                              value={docContent}
                              onChange={setDocContent}
                              placeholder="Write your documentation in markdown..."
                            />
                            <div className="flex gap-2">
                              <Button onClick={async () => {
                                try {
                                  const doc = docPages.find(d => d.id === selectedDoc);
                                  const { error } = await supabase
                                    .from('documentation_pages')
                                    .update({
                                      title: doc?.title,
                                      content: docContent,
                                    })
                                    .eq('id', selectedDoc);

                                  if (error) throw error;

                                  toast({ title: 'Saved', description: 'Documentation updated successfully' });
                                  loadDocPages();
                                } catch (error: any) {
                                  toast({
                                    title: 'Error',
                                    description: error.message || 'Failed to update documentation',
                                    variant: 'destructive',
                                  });
                                }
                              }}>
                                Save Changes
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this document?')) {
                                    try {
                                      const { error } = await supabase
                                        .from('documentation_pages')
                                        .delete()
                                        .eq('id', selectedDoc);

                                      if (error) throw error;

                                      toast({ title: 'Deleted', description: 'Document deleted successfully' });
                                      setSelectedDoc('');
                                      setDocContent('');
                                      loadDocPages();
                                    } catch (error: any) {
                                      toast({
                                        title: 'Error',
                                        description: error.message || 'Failed to delete document',
                                        variant: 'destructive',
                                      });
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedDoc('');
                                  setDocContent('');
                                }}
                              >
                                Clear
                              </Button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">System Settings</h1>
                <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                    <CardDescription>Control core system behavior</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Disable access for non-admin users</p>
                      </div>
                      <Switch
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(c) => saveSystemSettings({ ...systemSettings, maintenanceMode: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Registrations</Label>
                        <p className="text-sm text-muted-foreground">Enable new user signups</p>
                      </div>
                      <Switch
                        checked={systemSettings.allowRegistrations}
                        onCheckedChange={(c) => saveSystemSettings({ ...systemSettings, allowRegistrations: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Email Verification</Label>
                        <p className="text-sm text-muted-foreground">Users must verify email before access</p>
                      </div>
                      <Switch
                        checked={systemSettings.requireEmailVerification}
                        onCheckedChange={(c) => saveSystemSettings({ ...systemSettings, requireEmailVerification: c })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Enable or disable specific features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>AI Assistant Features</Label>
                        <p className="text-sm text-muted-foreground">Enable AI profile generation and chat</p>
                      </div>
                      <Switch
                        checked={systemSettings.enableAiFeatures}
                        onCheckedChange={(c) => saveSystemSettings({ ...systemSettings, enableAiFeatures: c })}
                      />
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <Label>Max Cards Per User</Label>
                      <Input
                        type="number"
                        value={systemSettings.maxCardsPerUser}
                        onChange={(e) => saveSystemSettings({ ...systemSettings, maxCardsPerUser: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">Limit for free tier users</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>{selectedUser.display_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{selectedUser.display_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.user_id}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedUser.role || 'Member'}</Badge>
                    <Badge variant="outline">{selectedUser.account_type || 'Free'}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Joined</p>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedUser.location || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium">{selectedUser.company || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Job Title</p>
                    <p className="font-medium">{selectedUser.job_title || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => handleViewProfile(selectedUser.user_id)}>
                  View Public Profile
                </Button>
                <Button onClick={() => {
                  setShowUserModal(false);
                  setAnnouncementForm({
                    ...announcementForm,
                    targetUserId: selectedUser.user_id,
                    sendToAll: false,
                  });
                  setActiveSection('announcements');
                }}>
                  Send Message
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
