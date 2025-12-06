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
        </div >
    );
};
