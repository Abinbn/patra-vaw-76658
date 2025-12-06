import React, { useState, useEffect } from 'react';
import { CardData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Check, Loader2, Camera, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface BasicInfoEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
    user: User | null;
}

export const BasicInfoEditor: React.FC<BasicInfoEditorProps> = ({ cardData, setCardData, user }) => {
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
    const [checkingUrl, setCheckingUrl] = useState(false);
    const [urlRestrictionReason, setUrlRestrictionReason] = useState<string | null>(null);

    // Avatar State
    const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);
    const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const googleUrl = user.user_metadata?.avatar_url;
            setGoogleAvatarUrl(googleUrl || null);

            const savedCustomUrl = user.user_metadata?.custom_avatar_url;
            if (savedCustomUrl) {
                setCustomAvatarUrl(savedCustomUrl);
            } else if (cardData.avatarUrl && cardData.avatarUrl !== googleUrl) {
                // Current is custom, but not saved in metadata yet
                setCustomAvatarUrl(cardData.avatarUrl);
            }
        }
    }, [user, cardData.avatarUrl]);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setUploadingAvatar(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update card data
            setCardData({ ...cardData, avatarUrl: publicUrl });
            setCustomAvatarUrl(publicUrl);

            // Save custom avatar to user metadata for persistence
            await supabase.auth.updateUser({
                data: { custom_avatar_url: publicUrl }
            });

            toast({
                title: "Avatar uploaded!",
                description: "Your avatar has been updated successfully.",
            });
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const checkUrlAvailability = async (url: string) => {
        if (!url || !user) {
            setUrlAvailable(null);
            setUrlRestrictionReason(null);
            return;
        }

        setCheckingUrl(true);
        try {
            // First check if the username is restricted
            const { data: restrictedData, error: restrictedError } = await supabase
                .from('restricted_usernames')
                .select('username, reason')
                .ilike('username', url)
                .maybeSingle();

            if (restrictedError && restrictedError.code !== 'PGRST116') {
                console.error('Error checking restricted usernames:', restrictedError);
            }

            if (restrictedData) {
                setUrlAvailable(false);
                setUrlRestrictionReason(restrictedData.reason || 'This username is restricted');
                return;
            }

            // Then check if the URL is already taken
            const { data, error } = await supabase
                .from('digital_cards')
                .select('id, owner_user_id')
                .eq('vanity_url', url)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;

            // URL is available if no record exists OR if the record belongs to current user
            const isAvailable = !data || data.owner_user_id === user.id;
            setUrlAvailable(isAvailable);
            setUrlRestrictionReason(null);
        } catch (error) {
            console.error('Error checking URL:', error);
            setUrlAvailable(null);
            setUrlRestrictionReason(null);
        } finally {
            setCheckingUrl(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (cardData.vanityUrl) {
                checkUrlAvailability(cardData.vanityUrl);
            }
        }, 500);

        return () => clearTimeout(debounce);
    }, [cardData.vanityUrl, user]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Profile Picture</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Upload your profile picture
                </p>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                        <AvatarImage src={cardData.avatarUrl} />
                        <AvatarFallback className="text-3xl">
                            {cardData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'UN'}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-muted-foreground">Current Active Avatar</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                    {/* Google Option */}
                    {googleAvatarUrl && (
                        <div
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${cardData.avatarUrl === googleAvatarUrl ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                            onClick={() => cardData.avatarUrl !== googleAvatarUrl && setCardData({ ...cardData, avatarUrl: googleAvatarUrl })}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={googleAvatarUrl} />
                                    <AvatarFallback>G</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Google Profile</p>
                                    <p className="text-xs text-muted-foreground">Synced from Google</p>
                                </div>
                                {cardData.avatarUrl === googleAvatarUrl && <Check className="w-4 h-4 text-primary" />}
                            </div>
                        </div>
                    )}

                    {/* Custom Option */}
                    <div
                        className={`p-4 rounded-xl border-2 transition-all ${cardData.avatarUrl !== googleAvatarUrl ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    >
                        <div
                            className="flex items-center gap-3 mb-3 cursor-pointer"
                            onClick={() => customAvatarUrl && cardData.avatarUrl !== customAvatarUrl && setCardData({ ...cardData, avatarUrl: customAvatarUrl })}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={customAvatarUrl || cardData.avatarUrl} />
                                <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium text-sm">Custom Upload</p>
                                <p className="text-xs text-muted-foreground">Uploaded by you</p>
                            </div>
                            {cardData.avatarUrl !== googleAvatarUrl && <Check className="w-4 h-4 text-primary" />}
                        </div>

                        <div className="flex gap-2">
                            {customAvatarUrl && cardData.avatarUrl !== customAvatarUrl && (
                                <Button size="sm" variant="outline" className="flex-1" onClick={() => setCardData({ ...cardData, avatarUrl: customAvatarUrl })}>
                                    Use This
                                </Button>
                            )}
                            <div className="relative flex-1">
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                />
                                <Button size="sm" variant={cardData.avatarUrl !== googleAvatarUrl ? "secondary" : "outline"} className="w-full" disabled={uploadingAvatar}>
                                    {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Camera className="w-3 h-3 mr-2" />}
                                    {customAvatarUrl ? 'Replace' : 'Upload'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div>
                    <Label htmlFor="vanity-url">Card URL</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">cardcraft.me/</span>
                        <Input
                            id="vanity-url"
                            value={cardData.vanityUrl}
                            onChange={(e) => setCardData({ ...cardData, vanityUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                            placeholder="your-name"
                            className={
                                cardData.vanityUrl && urlAvailable === false
                                    ? 'border-red-500 focus:border-red-500'
                                    : cardData.vanityUrl && urlAvailable === true
                                        ? 'border-green-500 focus:border-green-500'
                                        : ''
                            }
                        />
                    </div>
                    {checkingUrl && (
                        <p className="text-xs text-muted-foreground mt-1">Checking availability...</p>
                    )}
                    {!checkingUrl && cardData.vanityUrl && urlAvailable === false && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                            {urlRestrictionReason
                                ? `✗ "${cardData.vanityUrl}" is restricted: ${urlRestrictionReason}`
                                : `✗ "${cardData.vanityUrl}" is already taken`
                            }
                        </p>
                    )}
                    {!checkingUrl && cardData.vanityUrl && urlAvailable === true && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                            ✓ "{cardData.vanityUrl}" is available
                        </p>
                    )}
                    {!cardData.vanityUrl && (
                        <p className="text-xs text-muted-foreground mt-1">
                            This will be your unique card URL
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
