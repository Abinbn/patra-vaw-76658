import React, { useState } from 'react';
import { CardData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ProfileInfoEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const ProfileInfoEditor: React.FC<ProfileInfoEditorProps> = ({ cardData, setCardData }) => {
    const [newLanguage, setNewLanguage] = useState('');

    const addLanguage = () => {
        if (newLanguage.trim()) {
            setCardData({ ...cardData, languages: [...cardData.languages, newLanguage.trim()] });
            setNewLanguage('');
        }
    };

    const removeLanguage = (lang: string) => {
        setCardData({ ...cardData, languages: cardData.languages.filter(l => l !== lang) });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">About</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Tell people about yourself
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        value={cardData.fullName}
                        onChange={(e) => setCardData({ ...cardData, fullName: e.target.value })}
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                        id="jobTitle"
                        value={cardData.jobTitle}
                        onChange={(e) => setCardData({ ...cardData, jobTitle: e.target.value })}
                        placeholder="Software Engineer"
                    />
                </div>

                <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                        id="company"
                        value={cardData.company}
                        onChange={(e) => setCardData({ ...cardData, company: e.target.value })}
                        placeholder="Acme Inc."
                    />
                </div>

                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={cardData.location}
                        onChange={(e) => setCardData({ ...cardData, location: e.target.value })}
                        placeholder="San Francisco, CA"
                    />
                </div>

                <div>
                    <Label htmlFor="about">About</Label>
                    <Textarea
                        id="about"
                        value={cardData.about}
                        onChange={(e) => setCardData({ ...cardData, about: e.target.value })}
                        placeholder="Tell your story..."
                        className="min-h-[120px]"
                    />
                </div>

                <div>
                    <Label htmlFor="pronunciation">Name Pronunciation</Label>
                    <Input
                        id="pronunciation"
                        value={cardData.pronunciation}
                        onChange={(e) => setCardData({ ...cardData, pronunciation: e.target.value })}
                        placeholder="jon doh"
                    />
                </div>

                <div>
                    <Label htmlFor="pronoun">Pronouns</Label>
                    <Input
                        id="pronoun"
                        value={cardData.pronoun}
                        onChange={(e) => setCardData({ ...cardData, pronoun: e.target.value })}
                        placeholder="he/him"
                    />
                </div>

                <div>
                    <Label>Languages</Label>
                    <div className="flex gap-2 mb-2">
                        <Input
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            placeholder="Add a language"
                            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                        />
                        <Button onClick={addLanguage} size="icon" variant="outline">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {cardData.languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="gap-1">
                                {lang}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                                    onClick={() => removeLanguage(lang)}
                                />
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={cardData.email}
                        onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={cardData.phone}
                        onChange={(e) => setCardData({ ...cardData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                    />
                </div>

                <div>
                    <Label htmlFor="contactForm">Contact Form URL</Label>
                    <Input
                        id="contactForm"
                        type="url"
                        value={cardData.contactForm}
                        onChange={(e) => setCardData({ ...cardData, contactForm: e.target.value })}
                        placeholder="https://..."
                    />
                </div>

                <div>
                    <Label htmlFor="calendar">Calendar Booking URL</Label>
                    <Input
                        id="calendar"
                        type="url"
                        value={cardData.calendar}
                        onChange={(e) => setCardData({ ...cardData, calendar: e.target.value })}
                        placeholder="https://calendly.com/..."
                    />
                </div>
            </div>
        </div>
    );
};
