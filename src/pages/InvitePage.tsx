import { Building2, UserPlus, ArrowRight, Loader2, CheckCircle2, Upload, User, Globe, Mail, Phone, Info, AlertTriangle, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const InvitePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const inviteId = searchParams.get('id');
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [userProfiles, setUserProfiles] = useState<any[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [entryMode, setEntryMode] = useState<'selection' | 'manual'>('selection');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (inviteId) {
            fetchCompanyInfo();
        } else {
            setLoading(false);
        }
    }, [inviteId]);

    useEffect(() => {
        if (user) {
            fetchUserProfiles();
        }
    }, [user]);

    const fetchUserProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('digital_cards')
                .select('*')
                .eq('owner_user_id', user!.id);
            
            if (error) throw error;
            setUserProfiles(data || []);
            if (data && data.length > 0) {
                setEntryMode('selection');
            } else {
                setEntryMode('manual');
            }
        } catch (err) {
            console.error('Error fetching user profiles:', err);
        }
    };

    const fetchCompanyInfo = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, company_name, company_logo_url, invite_parameters, email, phone, vanity_url')
                .eq('invite_code', inviteId)
                .single();

            if (error) throw error;
            setCompany(data);

            // Initialize form data based on parameters
            const params = Array.isArray(data.invite_parameters)
                ? data.invite_parameters as string[]
                : ['display_name', 'email', 'phone', 'job_title'];

            const initialData: Record<string, string> = {
                'avatar_url': ''
            };
            params.forEach(p => {
                initialData[p] = '';
            });
            setFormData(initialData);

        } catch (error: any) {
            console.error('Error fetching company:', error);
            toast({
                title: "Invalid Invite",
                description: "This invite link is invalid or has expired.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSelect = (card: any) => {
        setSelectedProfileId(card.id);
        const content = card.content_json || {};
        const newFormData = { ...formData };
        
        // Map common fields from profile
        if (content.fullName) newFormData['display_name'] = content.fullName;
        if (content.email) newFormData['email'] = content.email;
        if (content.phone) newFormData['phone'] = content.phone;
        if (content.jobTitle) newFormData['job_title'] = content.jobTitle;
        if (content.avatarUrl) newFormData['avatar_url'] = content.avatarUrl;
        
        setFormData(newFormData);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('card-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('card-assets')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            toast({ title: "Avatar uploaded successfully" });
        } catch (error: any) {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleJoin = async () => {
        if (!user) {
            // Store invite info in session storage to resume after login
            sessionStorage.setItem('pending_invite_id', inviteId || '');
            sessionStorage.setItem('pending_invite_data', JSON.stringify(formData));
            navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
            return;
        }

        setSubmitting(true);
        try {
            // Check if already a member
            const { data: existing } = await supabase
                .from('invited_employees')
                .select('*')
                .eq('company_profile_id', company.id)
                .eq('employee_user_id', user.id)
                .single();

            if (existing) {
                toast({
                    title: "Already Joined",
                    description: "You have already joined this company.",
                });
                setJoined(true);
                return;
            }

            // Get user's profile ID
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            const { error } = await supabase
                .from('invited_employees')
                .insert({
                    company_profile_id: company.id,
                    employee_user_id: user.id,
                    employee_profile_id: userProfile?.id,
                    invite_code: inviteId!,
                    status: 'joined',
                    data_submitted: formData,
                    joined_at: new Date().toISOString()
                });

            if (error) throw error;

            toast({
                title: "Success!",
                description: `You have successfully joined ${company.company_name}.`,
            });
            setJoined(true);

        } catch (error: any) {
            console.error('Error joining company:', error);
            toast({
                title: "Error",
                description: "Failed to join company. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!inviteId || !company) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <CardTitle className="text-2xl mb-2">Invalid Invite</CardTitle>
                    <CardDescription>
                        The invite link you followed is invalid or has expired. Please contact your company administrator for a new link.
                    </CardDescription>
                    <Button className="mt-6 w-full" onClick={() => navigate('/')}>
                        Go Back Home
                    </Button>
                </Card>
            </div>
        );
    }

    if (joined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="max-w-md w-full text-center p-8 border-green-100 bg-green-50/30">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <CardTitle className="text-2xl mb-2">Welcome to {company.company_name}!</CardTitle>
                    <CardDescription>
                        Your request to join has been submitted. You can now access your corporate features in your dashboard.
                    </CardDescription>
                    <Button className="mt-6 w-full" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-screen overflow-hidden">
            {/* Left Side: Company Info */}
            <div className="w-full md:w-5/12 lg:w-4/12 bg-white md:bg-slate-900 md:text-white p-6 md:p-12 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full md:text-white md:hover:bg-white/10"
                            onClick={() => navigate(-1)}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-indigo-500" />
                            <span className="font-black tracking-tighter text-xl">PATRA</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {company.company_logo_url ? (
                            <img src={company.company_logo_url} alt={company.company_name} className="h-24 w-24 object-contain bg-white rounded-2xl p-2 shadow-xl" />
                        ) : (
                            <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <Building2 className="w-12 h-12 text-white" />
                            </div>
                        )}
                        
                        <div>
                            <h1 className="text-4xl font-black tracking-tight leading-none mb-4">{company.company_name}</h1>
                            <div className="flex flex-wrap gap-4 text-sm opacity-80">
                                {company.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {company.email}
                                    </div>
                                )}
                                {company.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {company.phone}
                                    </div>
                                )}
                                {company.vanity_url && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        patra.id/{company.vanity_url}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-indigo-600/10 md:bg-white/5 rounded-2xl border border-indigo-500/20 backdrop-blur-sm space-y-4">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="font-bold">Data Access Notice</p>
                                    <p className="text-sm opacity-70 leading-relaxed">
                                        This company/organisation can see and manage the data you share via this invite. 
                                        {entryMode === 'selection' ? ' Selected profile data will be synchronized for your corporate ID.' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-[11px] font-medium text-amber-600 md:text-amber-200">
                                    If you are not intended to share your data, please report or ignore this link and don't submit your data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block opacity-40 text-[10px] uppercase tracking-widest font-bold">
                    Powered by Patra Digital Intelligence
                </div>
            </div>

            {/* Right Side: Registration Flow */}
            <div className="flex-1 bg-slate-50 p-6 md:p-12 overflow-y-auto">
                <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Member Registration</h2>
                            <p className="text-slate-500">Complete your profile to join the team</p>
                        </div>
                        {user && userProfiles.length > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEntryMode(entryMode === 'selection' ? 'manual' : 'selection')}
                                className="rounded-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                                {entryMode === 'selection' ? 'Fill Manually' : 'Use Existing Profile'}
                            </Button>
                        )}
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            {entryMode === 'selection' && userProfiles.length > 0 ? (
                                <div className="space-y-6">
                                    <Label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Profile to Use</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {userProfiles.map(profile => (
                                            <button
                                                key={profile.id}
                                                onClick={() => handleProfileSelect(profile)}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                                    selectedProfileId === profile.id 
                                                    ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.02]' 
                                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                                }`}
                                            >
                                                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                                    <AvatarImage src={profile.content_json?.avatarUrl} />
                                                    <AvatarFallback><User /></AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-900">{profile.title || profile.content_json?.fullName}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{profile.content_json?.jobTitle || 'No Title'}</p>
                                                </div>
                                                {selectedProfileId === profile.id && (
                                                    <div className="ml-auto bg-indigo-600 rounded-full p-1">
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {selectedProfileId && (
                                        <div className="pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                                            <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Syncing following data:</p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {Object.entries(formData).filter(([k]) => k !== 'avatar_url').map(([key, val]) => (
                                                    <div key={key} className="space-y-1">
                                                        <span className="text-slate-400 capitalize text-[10px] font-black">{key.replace(/_/g, ' ')}</span>
                                                        <p className="font-semibold text-slate-700 truncate">{val || '—'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Avatar Upload Section */}
                                    <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-100">
                                        <div className="relative group">
                                            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                                                <AvatarImage src={formData['avatar_url']} />
                                                <AvatarFallback className="bg-slate-100 text-slate-400">
                                                    <User size={40} />
                                                </AvatarFallback>
                                            </Avatar>
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                                <Upload size={20} />
                                                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                            </label>
                                        </div>
                                        <div className="text-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="relative overflow-hidden group"
                                                disabled={isUploading}
                                            >
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                Upload Avatar
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    onChange={handleAvatarUpload} 
                                                    accept="image/*" 
                                                />
                                            </Button>
                                            <p className="text-[10px] text-slate-400 mt-2">Max 5MB. Jpeg, Png or Webp</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.keys(formData).filter(k => k !== 'avatar_url').map(key => (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={key} className="text-xs font-black uppercase text-slate-400 tracking-tighter">
                                                    {key.replace(/_/g, ' ')}
                                                </Label>
                                                <Input
                                                    id={key}
                                                    value={formData[key]}
                                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                                    placeholder={`Enter your ${key.replace(/_/g, ' ')}`}
                                                    className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pt-4">
                                        <Label className="text-xs font-black uppercase text-slate-400 tracking-tighter">Avatar URL (Optional)</Label>
                                        <Input
                                            value={formData['avatar_url']}
                                            onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                                            placeholder="https://example.com/photo.jpg"
                                            className="h-10 mt-1 bg-slate-50 border-none rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                className={`w-full h-14 text-lg font-black shadow-xl rounded-2xl transition-all transform hover:scale-[1.01] active:scale-[0.98] ${
                                    joined ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                                onClick={handleJoin}
                                disabled={submitting || isUploading || (entryMode === 'selection' && !selectedProfileId)}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        Finalizing Registration...
                                    </>
                                ) : (
                                    <>
                                        {user ? 'Complete & Join Team' : 'Sign in to Join Team'}
                                        <ArrowRight className="w-5 h-5 ml-3" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
