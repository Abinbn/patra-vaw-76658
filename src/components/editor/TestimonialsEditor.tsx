import React, { useState } from 'react';
import { CardData, Testimonial } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

interface TestimonialsEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({ cardData, setCardData }) => {
    const { user } = useAuth();
    const [newTestimonial, setNewTestimonial] = useState<Testimonial>({ name: '', role: '', content: '', avatar: '', socialUrl: '' });
    const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(null);
    const [uploadingTestimonialAvatar, setUploadingTestimonialAvatar] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Testimonials</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Add social proof with testimonials from colleagues or clients
                </p>
            </div>

            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="testimonial-name">Name *</Label>
                        <Input
                            id="testimonial-name"
                            value={newTestimonial.name}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                            placeholder="e.g., Jane Smith"
                        />
                    </div>
                    <div>
                        <Label htmlFor="testimonial-role">Role *</Label>
                        <Input
                            id="testimonial-role"
                            value={newTestimonial.role}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                            placeholder="e.g., CEO at TechCorp"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="testimonial-content">Content *</Label>
                    <Textarea
                        id="testimonial-content"
                        value={newTestimonial.content}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                        placeholder="What did they say about you?"
                        className="min-h-[80px]"
                    />
                </div>

                <div>
                    <Label htmlFor="testimonial-url">Social URL (Optional)</Label>
                    <Input
                        id="testimonial-url"
                        value={newTestimonial.socialUrl || ''}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, socialUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Link to their LinkedIn, Twitter, etc where this testimonial was given
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Profile Picture (Optional)</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            value={newTestimonial.avatar}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, avatar: e.target.value })}
                            placeholder="Image URL or upload below"
                        />
                        <Label htmlFor="testimonial-avatar-upload" className="cursor-pointer">
                            <Button variant="outline" disabled={uploadingTestimonialAvatar} asChild>
                                <span>
                                    <Upload className="w-4 h-4 mr-2" />
                                    {uploadingTestimonialAvatar ? 'Uploading...' : 'Upload'}
                                </span>
                            </Button>
                        </Label>
                        <Input
                            id="testimonial-avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !user) return;

                                setUploadingTestimonialAvatar(true);
                                try {
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `${user.id}/testimonials/${Math.random()}.${fileExt}`;

                                    const { error: uploadError } = await supabase.storage
                                        .from('avatars')
                                        .upload(fileName, file);

                                    if (uploadError) throw uploadError;

                                    const { data: { publicUrl } } = supabase.storage
                                        .from('avatars')
                                        .getPublicUrl(fileName);

                                    setNewTestimonial({ ...newTestimonial, avatar: publicUrl });

                                    toast({
                                        title: "Image uploaded!",
                                        description: "Avatar has been added.",
                                    });
                                } catch (error: any) {
                                    toast({
                                        title: "Upload failed",
                                        description: error.message,
                                        variant: "destructive"
                                    });
                                } finally {
                                    setUploadingTestimonialAvatar(false);
                                }
                            }}
                        />
                    </div>
                    {newTestimonial.avatar && (
                        <img
                            src={newTestimonial.avatar}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover border border-border mt-2"
                        />
                    )}
                </div>

                <Button
                    onClick={() => {
                        if (!newTestimonial.name || !newTestimonial.role || !newTestimonial.content) {
                            toast({
                                title: "Error",
                                description: "Please fill in all required fields",
                                variant: "destructive"
                            });
                            return;
                        }

                        if (editingTestimonialIndex !== null) {
                            const updated = [...cardData.testimonials];
                            updated[editingTestimonialIndex] = newTestimonial;
                            setCardData({ ...cardData, testimonials: updated });
                            setEditingTestimonialIndex(null);
                        } else {
                            setCardData({ ...cardData, testimonials: [...cardData.testimonials, newTestimonial] });
                        }

                        setNewTestimonial({ name: '', role: '', content: '', avatar: '', socialUrl: '' });
                        toast({
                            title: "Success!",
                            description: editingTestimonialIndex !== null ? "Testimonial updated" : "Testimonial added",
                        });
                    }}
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingTestimonialIndex !== null ? 'Update Testimonial' : 'Add Testimonial'}
                </Button>

                {editingTestimonialIndex !== null && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setEditingTestimonialIndex(null);
                            setNewTestimonial({ name: '', role: '', content: '', avatar: '', socialUrl: '' });
                        }}
                        className="w-full"
                    >
                        Cancel Edit
                    </Button>
                )}
            </div>

            {/* Existing Testimonials - with Drag and Drop */}
            {cardData.testimonials.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Your Testimonials</h3>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event: DragEndEvent) => {
                            const { active, over } = event;
                            if (over && active.id !== over.id) {
                                const oldIndex = cardData.testimonials.findIndex((_, i) => i.toString() === active.id);
                                const newIndex = cardData.testimonials.findIndex((_, i) => i.toString() === over.id);
                                setCardData({ ...cardData, testimonials: arrayMove(cardData.testimonials, oldIndex, newIndex) });
                            }
                        }}
                    >
                        <SortableContext
                            items={cardData.testimonials.map((_, i) => i.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            {cardData.testimonials.map((testimonial, index) => (
                                <SortableItem key={index} id={index.toString()}>
                                    <div className="flex-1 flex gap-3 p-3 border border-border rounded-lg bg-card">
                                        {testimonial.avatar && (
                                            <img
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <div>
                                                    <h4 className="font-medium text-sm">{testimonial.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground italic line-clamp-3">"{testimonial.content}"</p>
                                            {testimonial.socialUrl && (
                                                <a href={testimonial.socialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                                                    View on social media
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setNewTestimonial(testimonial);
                                                    setEditingTestimonialIndex(index);
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
                                                        testimonials: cardData.testimonials.filter((_, i) => i !== index)
                                                    });
                                                    toast({ title: "Testimonial deleted" });
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
