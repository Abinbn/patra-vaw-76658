import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Loader2, 
    Building2, 
    MapPin, 
    Globe, 
    UserPlus, 
    ArrowRight, 
    CheckCircle2, 
    AlertCircle,
    Info,
    Mail,
    Phone,
    ShieldCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const InvitePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const inviteId = searchParams.get('id');
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [company, setCompany] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form states for joining
    const [selectedCard, setSelectedCard] = useState<string>('');
    const [userCards, setUserCards] = useState<any[]>([]);

    useEffect(() => {
        if (inviteId) {
            fetchCompanyInfo();
        } else {
            setError('Missing invitation code.');
            setLoading(false);
        }
    }, [inviteId]);

    useEffect(() => {
        if (user) {
            fetchUserCards();
        }
    }, [user]);

    const fetchCompanyInfo = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, company_name, company_logo_url, bio, address, location_coordinates, vanity_url, email, phone')
                .eq('invite_code', inviteId)
                .maybeSingle();

            if (error) throw error;
            if (!data) {
                setError('Invalid or expired invitation code.');
            } else {
                setCompany(data);
            }
        } catch (err) {
            console.error('Error fetching company info:', err);
            setError('Failed to load invitation details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCards = async () => {
        try {
            const { data, error } = await supabase
                .from('digital_cards')
                .select('id, title, content_json')
                .eq('owner_user_id', user!.id);
            
            if (error) throw error;
            setUserCards(data || []);
            if (data && data.length > 0) {
                setSelectedCard(data[0].id);
            }
        } catch (err) {
            console.error('Error fetching user cards:', err);
        }
    };

    const handleJoin = async () => {
        if (!user) {
            // Redirect to auth with return path
            navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }

        if (userCards.length === 0) {
            toast({
                title: "No Digital Card Found",
                description: "Please create a digital card first to join the company.",
                variant: "destructive"
            });
            navigate('/editor');
            return;
        }

        setJoining(true);
        try {
            // Logic to join company: 
            // Usually this means updating the digital card's company info or linking to company_id
            // For now, let's assume we update the selected card's company field
            
            const { error: updateError } = await supabase
                .from('digital_cards')
                .update({
                    company_id: company.id,
                    // We might also want to mark it as a corporate card if that's a thing
                })
                .eq('id', selectedCard);

            if (updateError) throw updateError;

            setSuccess(true);
            toast({
                title: "Welcome to the team!",
                description: `You have successfully joined ${company.company_name}.`,
            });
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            console.error('Error joining company:', err);
            toast({
                title: "Error",
                description: "Failed to join the company. Please try again.",
                variant: "destructive"
            });
        } finally {
            setJoining(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                    <p className="text-slate-500 font-medium animate-pulse">Verifying Invitation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-none shadow-2xl shadow-indigo-200/50 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900">Invitation Error</h1>
                            <p className="text-slate-500">{error}</p>
                        </div>
                        <Button 
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all"
                            onClick={() => navigate('/')}
                        >
                            Return Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-none shadow-2xl shadow-indigo-200/50 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900">Successfully Joined!</h1>
                            <p className="text-slate-500 text-lg">You are now part of <span className="font-semibold text-slate-900">{company.company_name}</span>.</p>
                        </div>
                        <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
            {/* Design Sidebar / Decorative side */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400 rounded-full blur-[120px]" />
                </div>
                
                <div className="relative z-10 max-w-lg space-y-8 text-white">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center ring-1 ring-white/30">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tight leading-tight">
                            Build Your Professional <span className="text-indigo-200">Network</span> Today.
                        </h1>
                        <p className="text-indigo-100 text-lg leading-relaxed font-medium">
                            Join <span className="text-white font-bold">{company.company_name}</span> and unlock a world of connected professional identity.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Verified Profile', icon: CheckCircle2 },
                            { label: 'Digital Card', icon: Globe },
                            { label: 'Team Portal', icon: Building2 },
                            { label: 'Direct Access', icon: UserPlus },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                <item.icon className="w-5 h-5 text-indigo-300" />
                                <span className="text-sm font-semibold text-white">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12">
                <div className="max-w-[480px] w-full space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-xl ring-1 ring-slate-100">
                            <AvatarImage src={company.company_logo_url} />
                            <AvatarFallback className="bg-indigo-600 text-white text-2xl font-bold">
                                {company.company_name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold px-3 py-1 uppercase tracking-wider text-[10px]">Official Invitation</Badge>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Join {company.company_name}</h2>
                        </div>
                    </div>

                    {/* Company Info Card */}
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            {company.bio && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Info className="w-3.5 h-3.5" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">About the Company</span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed italic">
                                        "{company.bio}"
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                {company.address && (
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                                            <p className="text-sm font-semibold text-slate-700">{company.address}</p>
                                        </div>
                                    </div>
                                )}

                                {company.vanity_url && (
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Corporate Portal</p>
                                            <p className="text-sm font-semibold text-slate-700">patra.app/{company.vanity_url}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-indigo-600 rounded-3xl text-white space-y-4 shadow-lg shadow-indigo-200">
                                <div className="space-y-1">
                                    <h3 className="font-bold">Next Steps</h3>
                                    <p className="text-indigo-100 text-xs">By joining, you'll be able to display your company affiliation on your digital card.</p>
                                </div>
                                
                                {!user ? (
                                    <Button 
                                        className="w-full bg-white text-indigo-600 hover:bg-indigo-50 h-12 rounded-xl font-bold"
                                        onClick={handleJoin}
                                    >
                                        Sign In to Join Team
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-white text-xs font-bold opacity-80 uppercase tracking-widest">Select Your Digital Card</Label>
                                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                {userCards.length > 0 ? (
                                                    userCards.map(card => (
                                                        <button 
                                                            key={card.id}
                                                            onClick={() => setSelectedCard(card.id)}
                                                            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                                                selectedCard === card.id 
                                                                ? 'bg-white/20 border-white text-white' 
                                                                : 'bg-white/5 border-transparent text-indigo-100 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${selectedCard === card.id ? 'bg-white' : 'bg-transparent border border-white/50'}`} />
                                                                <span className="text-sm font-bold truncate max-w-[180px]">{card.title}</span>
                                                            </div>
                                                            {selectedCard === card.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="text-sm italic opacity-80">You don't have any digital cards yet.</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            className="w-full bg-white text-indigo-600 hover:bg-indigo-50 h-12 rounded-xl font-bold shadow-sm"
                                            onClick={handleJoin}
                                            disabled={joining || (userCards.length === 0)}
                                        >
                                            {joining ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Confirm & Join Team'
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer / Help */}
                    <div className="text-center pb-8">
                        <p className="text-slate-400 text-xs">
                            Invitation from <span className="font-bold text-slate-500">{company.company_name}</span>. 
                            Verified by Patra.
                        </p>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}} />
        </div>
    );
};
