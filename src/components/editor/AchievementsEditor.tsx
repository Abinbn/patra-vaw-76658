import React, { useState } from 'react';
import { CardData, Achievement } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface AchievementsEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const AchievementsEditor: React.FC<AchievementsEditorProps> = ({ cardData, setCardData }) => {
    const [newAchievement, setNewAchievement] = useState<Achievement>({ title: '', issuer: '', date: '', url: '' });
    const [editingAchievementIndex, setEditingAchievementIndex] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Achievements</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Showcase your awards, certifications, and honors
                </p>
            </div>

            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="achievement-title">Title *</Label>
                        <Input
                            id="achievement-title"
                            value={newAchievement.title}
                            onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                            placeholder="Hackathon Winner 2025"
                        />
                    </div>
                    <div>
                        <Label htmlFor="achievement-issuer">Issuer *</Label>
                        <Input
                            id="achievement-issuer"
                            value={newAchievement.issuer}
                            onChange={(e) => setNewAchievement({ ...newAchievement, issuer: e.target.value })}
                            placeholder="Global Tech Summit"
                        />
                    </div>
                    <div>
                        <Label htmlFor="achievement-date">Date</Label>
                        <Input
                            id="achievement-date"
                            value={newAchievement.date}
                            onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                            placeholder="Dec 2024"
                        />
                    </div>
                    <div>
                        <Label htmlFor="achievement-url">URL (Optional)</Label>
                        <Input
                            id="achievement-url"
                            value={newAchievement.url || ''}
                            onChange={(e) => setNewAchievement({ ...newAchievement, url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <Button
                    onClick={() => {
                        if (!newAchievement.title || !newAchievement.issuer) {
                            toast({
                                title: "Error",
                                description: "Title and Issuer are required",
                                variant: "destructive"
                            });
                            return;
                        }

                        if (editingAchievementIndex !== null) {
                            const updated = [...cardData.achievements];
                            updated[editingAchievementIndex] = newAchievement;
                            setCardData({ ...cardData, achievements: updated });
                            setEditingAchievementIndex(null);
                        } else {
                            setCardData({ ...cardData, achievements: [...cardData.achievements, newAchievement] });
                        }

                        setNewAchievement({ title: '', issuer: '', date: '', url: '' });
                        toast({
                            title: "Success!",
                            description: editingAchievementIndex !== null ? "Achievement updated" : "Achievement added",
                        });
                    }}
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingAchievementIndex !== null ? 'Update Achievement' : 'Add Achievement'}
                </Button>

                {editingAchievementIndex !== null && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setEditingAchievementIndex(null);
                            setNewAchievement({ title: '', issuer: '', date: '', url: '' });
                        }}
                        className="w-full"
                    >
                        Cancel Edit
                    </Button>
                )}
            </div>

            {/* Existing Achievements - with Drag and Drop */}
            {cardData.achievements.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Your Achievements</h3>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event: DragEndEvent) => {
                            const { active, over } = event;
                            if (over && active.id !== over.id) {
                                const oldIndex = cardData.achievements.findIndex((_, i) => i.toString() === active.id);
                                const newIndex = cardData.achievements.findIndex((_, i) => i.toString() === over.id);
                                setCardData({ ...cardData, achievements: arrayMove(cardData.achievements, oldIndex, newIndex) });
                            }
                        }}
                    >
                        <SortableContext
                            items={cardData.achievements.map((_, i) => i.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            {cardData.achievements.map((achievement, index) => (
                                <SortableItem key={index} id={index.toString()}>
                                    <div className="flex-1 flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                                        <div>
                                            <h4 className="font-medium text-sm">{achievement.title}</h4>
                                            <p className="text-xs text-muted-foreground">{achievement.issuer} • {achievement.date}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setNewAchievement(achievement);
                                                    setEditingAchievementIndex(index);
                                                }}
                                                className="h-8 w-8"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setCardData({
                                                        ...cardData,
                                                        achievements: cardData.achievements.filter((_, i) => i !== index)
                                                    });
                                                    toast({ title: "Achievement deleted" });
                                                }}
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
};
