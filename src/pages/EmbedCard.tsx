import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DigitalCard, CardData } from '@/components/card/DigitalCard';
import { Loader2 } from 'lucide-react';

export const EmbedCard: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [cardData, setCardData] = useState<CardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCard = async () => {
            if (!username) return;

            try {
                // 1. Try to find by vanity_url
                let { data: card, error } = await supabase
                    .from('digital_cards')
                    .select('*, profiles:owner_user_id(display_name, avatar_url, job_title)')
                    .eq('vanity_url', username)
                    .maybeSingle();

                if (error) throw error;

                // 2. If not found, try by ID (if username looks like UUID)
                if (!card && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username)) {
                    const { data: cardById, error: idError } = await supabase
                        .from('digital_cards')
                        .select('*, profiles:owner_user_id(display_name, avatar_url, job_title)')
                        .eq('id', username)
                        .maybeSingle();

                    if (idError) throw idError;
                    card = cardById;
                }

                if (!card) {
                    setError('Card not found');
                    return;
                }

                const content = card.content_json as any;
                const profile = Array.isArray(card.profiles) ? card.profiles[0] : card.profiles;

                setCardData({
                    fullName: content.fullName || profile?.display_name || 'User',
                    jobTitle: content.jobTitle || profile?.job_title || '',
                    company: content.company || '',
                    email: content.email || '',
                    phone: content.phone || '',
                    avatarUrl: content.avatarUrl || profile?.avatar_url || '',
                    vanityUrl: card.vanity_url,
                    cardConfig: content.cardConfig,
                    bannerType: content.bannerType,
                    bannerValue: content.bannerValue
                });

            } catch (err: any) {
                console.error('Error fetching card:', err);
                setError('Failed to load card');
            } finally {
                setLoading(false);
            }
        };

        fetchCard();
    }, [username]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !cardData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent text-red-500">
                <p>{error || 'Card not found'}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
            <DigitalCard
                cardData={cardData}
                username={username || ''}
                width={400}
                height={250}
            />
        </div>
    );
};
