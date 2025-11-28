import React, { useState } from 'react';
import { CardData } from './types';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Check, Share2, ChevronLeft, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AiProfileEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
    aiEnabled: boolean;
    handleAIToggle: (enabled: boolean) => void;
}

export const AiProfileEditor: React.FC<AiProfileEditorProps> = ({ cardData, setCardData, aiEnabled, handleAIToggle }) => {
    const [aiProfileExpanded, setAiProfileExpanded] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">AI Profile</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Enable AI chat and export your profile for AI assistants
                </p>
            </div>

            {/* Enable AI Toggle */}
            <div className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Enable Your AI</h3>
                        <p className="text-sm text-muted-foreground">Allow visitors to chat with your AI clone</p>
                    </div>
                    <Switch
                        checked={aiEnabled}
                        onCheckedChange={handleAIToggle}
                    />
                </div>
            </div>

            {aiEnabled && (
                <div className="p-4 border border-green-500/20 rounded-lg bg-green-500/5">
                    <p className="text-sm flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>AI is enabled! Visitors can now chat with your AI at <code className="text-xs bg-muted px-1 rounded">/{cardData.vanityUrl}/ai</code></span>
                    </p>
                </div>
            )}

            <hr className="my-6" />

            {/* Collapsible AI Profile Builder */}
            <div>
                <button
                    onClick={() => setAiProfileExpanded(!aiProfileExpanded)}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">AI Profile Builder</h3>
                    </div>
                    <ChevronLeft className={`w-5 h-5 transition-transform ${aiProfileExpanded ? '-rotate-90' : 'rotate-0'}`} />
                </button>

                {aiProfileExpanded && (
                    <div className="mt-4 space-y-6 animate-fade-in">
                        <div className="p-6 border border-border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
                            <p className="text-sm text-muted-foreground mb-4">
                                Generate a custom AI prompt that tells chatbots like ChatGPT, Claude, Gemini, and Perplexity exactly who you are. This helps AI assistants provide more personalized and relevant responses.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span>Tailored AI responses based on your background and expertise</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span>No need to repeat yourself in every conversation</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span>Better recommendations aligned with your interests</span>
                                </div>
                            </div>
                        </div>

                        {/* Generated AI Prompt */}
                        <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm">Your AI Profile Prompt</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const aiPrompt = `I'm ${cardData.fullName || 'a user'}, ${cardData.jobTitle || 'professional'}${cardData.company ? ` at ${cardData.company}` : ''}. ${cardData.about || ''}\n\nMy background:\n- Location: ${cardData.location || 'Not specified'}\n- Languages: ${cardData.languages.join(', ') || 'Not specified'}\n- Interests: ${cardData.interests.join(', ') || 'Not specified'}\n\n${cardData.achievements.length > 0 ? `Achievements:\n${cardData.achievements.map(a => `- ${a.title} from ${a.issuer} (${a.date})`).join('\n')}\n\n` : ''}When assisting me, please consider my background, expertise, and interests to provide personalized and relevant responses. You can view my full profile at: patra.me/${cardData.vanityUrl || 'username'}`;

                                        navigator.clipboard.writeText(aiPrompt);
                                        toast({
                                            title: "Copied!",
                                            description: "AI profile prompt copied to clipboard. Paste it into any AI chatbot!",
                                        });
                                    }}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Prompt
                                </Button>
                            </div>
                            <div className="bg-muted p-4 rounded-lg text-sm overflow-auto scrollbar-thin max-h-96 whitespace-pre-wrap">
                                {`I'm ${cardData.fullName || 'a user'}, ${cardData.jobTitle || 'professional'}${cardData.company ? ` at ${cardData.company}` : ''}. ${cardData.about || ''}

My background:
- Location: ${cardData.location || 'Not specified'}
- Languages: ${cardData.languages.join(', ') || 'Not specified'}
- Interests: ${cardData.interests.join(', ') || 'Not specified'}

${cardData.achievements.length > 0 ? `Achievements:
${cardData.achievements.map(a => `- ${a.title} from ${a.issuer} (${a.date})`).join('\n')}

` : ''}When assisting me, please consider my background, expertise, and interests to provide personalized and relevant responses. You can view my full profile at: patra.me/${cardData.vanityUrl || 'username'}`}
                            </div>
                        </div>

                        {/* How to Use */}
                        <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <h4 className="font-semibold text-sm mb-3">How to use:</h4>
                            <ol className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <span className="font-semibold text-foreground">1.</span>
                                    <span>Click "Copy Prompt" above to copy your AI profile to clipboard</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold text-foreground">2.</span>
                                    <span>Open your preferred AI chatbot (ChatGPT, Claude, Gemini, Perplexity)</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold text-foreground">3.</span>
                                    <span>Paste the prompt at the start of your conversation</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold text-foreground">4.</span>
                                    <span>Enjoy personalized AI responses tailored to your profile!</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
