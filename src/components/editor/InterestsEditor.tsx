import React, { useState } from 'react';
import { CardData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface InterestsEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const InterestsEditor: React.FC<InterestsEditorProps> = ({ cardData, setCardData }) => {
    const [newInterest, setNewInterest] = useState('');

    const addInterest = () => {
        if (newInterest.trim()) {
            setCardData({ ...cardData, interests: [...cardData.interests, newInterest.trim()] });
            setNewInterest('');
        }
    };

    const removeInterest = (interest: string) => {
        setCardData({ ...cardData, interests: cardData.interests.filter(i => i !== interest) });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Interests</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Share your hobbies and passions
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="e.g., Photography, Hiking, AI"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <Button onClick={addInterest} size="icon">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {cardData.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="gap-1 px-3 py-1 text-sm">
                            {interest}
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                                onClick={() => removeInterest(interest)}
                            />
                        </Badge>
                    ))}
                    {cardData.interests.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No interests added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
