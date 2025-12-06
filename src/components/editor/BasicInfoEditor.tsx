import React, { useState, useEffect } from 'react';
import { CardData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Check, Loader2, Camera, User as UserIcon, ArrowRightLeft } from 'lucide-react';
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
                    Upload your profile picture or use your Google avatar
                </p>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-6">
                        {googleAvatarUrl ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center justify-center relative h-32 w-full max-w-xs mx-auto">
                                    {/* Custom Avatar (Left) */}
                                    <div
                                        className={`relative transition-all duration-300 ${cardData.avatarUrl !== googleAvatarUrl ? 'z-20 scale-110' : 'z-10 scale-90 opacity-60 hover:opacity-100 cursor-pointer'}`}
                                        onClick={() => cardData.avatarUrl === googleAvatarUrl && setCardData({ ...cardData, avatarUrl: customAvatarUrl || cardData.avatarUrl })}
                                    >
                                        <Avatar className={`w-28 h-28 border-4 shadow-xl ${cardData.avatarUrl !== googleAvatarUrl ? 'border-primary ring-2 ring-primary/20' : 'border-background'}`}>
                                            <AvatarImage src={customAvatarUrl || (cardData.avatarUrl !== googleAvatarUrl ? cardData.avatarUrl : undefined)} />
                                            <AvatarFallback className="text-3xl">
                                                {cardData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'UN'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    {/* Google Avatar (Right) */}
                                    <div
                                        className={`relative -ml-8 transition-all duration-300 ${cardData.avatarUrl === googleAvatarUrl ? 'z-20 scale-110' : 'z-10 scale-90 opacity-60 hover:opacity-100 cursor-pointer'}`}
                                        onClick={() => cardData.avatarUrl !== googleAvatarUrl && setCardData({ ...cardData, avatarUrl: googleAvatarUrl })}
                                    >
                                        <div className={`p-[3px] rounded-full ${cardData.avatarUrl === googleAvatarUrl ? 'bg-[conic-gradient(from_0deg,#EA4335_0deg_90deg,#4285F4_90deg_180deg,#34A853_180deg_270deg,#FBBC05_270deg_360deg)]' : 'bg-muted'}`}>
                                            <Avatar className="w-28 h-28 border-4 border-background">
                                                <AvatarImage src={googleAvatarUrl} />
                                                <AvatarFallback>G</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const newUrl = cardData.avatarUrl === googleAvatarUrl ? (customAvatarUrl || cardData.avatarUrl) : googleAvatarUrl;
                                            setCardData({ ...cardData, avatarUrl: newUrl });
                                        }}
                                        className="gap-2"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                        Swap Profile
                                    </Button>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="avatar-upload-new"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleAvatarUpload}
                                            disabled={uploadingAvatar}
                                        />
                                        <Button variant="secondary" disabled={uploadingAvatar} className="gap-2">
                                            {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                            Upload New
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                                    <AvatarImage src={cardData.avatarUrl} />
                                    <AvatarFallback className="text-3xl">
                                        {cardData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'UN'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="relative">
                                    <input
                                        type="file"
                                        id="avatar-upload-simple"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                    />
                                    <Button variant="outline" disabled={uploadingAvatar}>
                                        {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload Photo
                                    </Button>
                                </div>
                            </div>
                        )}
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
