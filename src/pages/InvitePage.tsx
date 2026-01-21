import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Building2, UserPlus, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const InvitePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const inviteId = searchParams.get('id');
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [joined, setJoined] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});

    useEffect(() => {
        if (inviteId) {
            fetchCompanyInfo();
        } else {
            setLoading(false);
        }
    }, [inviteId]);

    const fetchCompanyInfo = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, company_name, company_logo_url, invite_parameters')
                .eq('invite_code', inviteId)
                .single();

            if (error) throw error;
            setCompany(data);

            // Initialize form data based on parameters
            const params = Array.isArray(data.invite_parameters)
                ? data.invite_parameters as string[]
                : [];

            const initialData: Record<string, string> = {};
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    {company.company_logo_url ? (
                        <img src={company.company_logo_url} alt={company.company_name} className="h-16 mx-auto mb-4 object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-primary" />
                        </div>
                    )}
                    <h1 className="text-3xl font-bold text-slate-900">Join {company.company_name}</h1>
                    <p className="text-slate-600 mt-2">You've been invited to join the team!</p>
                </div>

                <Card className="border-slate-200 shadow-xl overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white text-center py-6">
                        <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-80" />
                        <CardTitle>Member Registration</CardTitle>
                        <CardDescription className="text-slate-300">Please provide the following details to join</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {Object.keys(formData).map(key => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={key} className="capitalize">
                                    {key.replace(/_/g, ' ')}
                                </Label>
                                <Input
                                    id={key}
                                    value={formData[key]}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    placeholder={`Enter your ${key.replace(/_/g, ' ')}`}
                                    className="h-12"
                                />
                            </div>
                        ))}

                        <Button
                            className="w-full h-12 text-lg font-semibold shadow-lg transition-all hover:scale-[1.02]"
                            onClick={handleJoin}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    {user ? 'Join Now' : 'Sign in to Join'}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-slate-500">
                    By joining, you agree to share the above information with {company.company_name}.
                </p>
            </div>
        </div>
    );
};
