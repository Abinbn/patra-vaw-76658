import React, { useState } from 'react';
import { CardData, Photo } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Video, Volume2, ImageIcon, Upload, Trash2, Plus, Film, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PhotoGalleryEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const PhotoGalleryEditor: React.FC<PhotoGalleryEditorProps> = ({ cardData, setCardData }) => {
    const { user } = useAuth();
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [newPhotoCaption, setNewPhotoCaption] = useState('');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Gallery & Media</h2>
                <p className="text-muted-foreground text-sm">
                    Showcase your work with photos, videos, and audio.
                </p>
            </div>

            <Tabs defaultValue="photos" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="photos" className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Photos
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center gap-2">
                        <Film className="w-4 h-4" /> Video
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="flex items-center gap-2">
                        <Music className="w-4 h-4" /> Audio
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="photos" className="space-y-6">
                    {/* Photos Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Photo Gallery ({cardData.photos.length}/5)</h3>
                        </div>

                        {/* Photo Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {cardData.photos.map((photo, index) => (
                                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                                    <img
                                        src={photo.url}
                                        alt={photo.caption || 'Photo'}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                        {photo.caption && (
                                            <p className="text-xs text-white truncate mb-2">{photo.caption}</p>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="w-full h-8"
                                            onClick={() => {
                                                setCardData({
                                                    ...cardData,
                                                    photos: cardData.photos.filter((_, i) => i !== index)
                                                });
                                                toast({ title: "Photo deleted" });
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Photo Button */}
                            {cardData.photos.length < 5 && (
                                <div className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/50 transition-all flex flex-col items-center justify-center p-4 text-center">
                                    <Label htmlFor="photo-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
                                            {uploadingPhoto ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div> : <Plus className="w-5 h-5" />}
                                        </div>
                                        <span className="text-sm font-medium">Add Photo</span>
                                        <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
                                    </Label>
                                    <Input
                                        id="photo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingPhoto}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file || !user) return;

                                            setUploadingPhoto(true);
                                            try {
                                                const fileExt = file.name.split('.').pop();
                                                const fileName = `${user.id}/photos/${Math.random()}.${fileExt}`;

                                                const { error: uploadError } = await supabase.storage
                                                    .from('avatars')
                                                    .upload(fileName, file);

                                                if (uploadError) throw uploadError;

                                                const { data: { publicUrl } } = supabase.storage
                                                    .from('avatars')
                                                    .getPublicUrl(fileName);

                                                const newPhoto: Photo = {
                                                    id: Math.random().toString(),
                                                    url: publicUrl,
                                                    caption: newPhotoCaption
                                                };

                                                setCardData({ ...cardData, photos: [...cardData.photos, newPhoto] });
                                                setNewPhotoCaption('');

                                                toast({
                                                    title: "Photo uploaded!",
                                                    description: "Added to your gallery.",
                                                });
                                            } catch (error: any) {
                                                toast({
                                                    title: "Upload failed",
                                                    description: error.message,
                                                    variant: "destructive"
                                                });
                                            } finally {
                                                setUploadingPhoto(false);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Caption Input for next upload */}
                        <div className="pt-4 border-t border-border">
                            <Label htmlFor="photo-caption">Caption for next photo (Optional)</Label>
                            <Input
                                id="photo-caption"
                                value={newPhotoCaption}
                                onChange={(e) => setNewPhotoCaption(e.target.value)}
                                placeholder="e.g., At the conference..."
                                className="mt-1.5"
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-6">
                    <div className="space-y-4 p-6 border border-border rounded-xl bg-card">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <Video className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Video Introduction</h3>
                                <p className="text-sm text-muted-foreground">Add a YouTube or Vimeo link</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="video-url">Video URL</Label>
                                <Input
                                    id="video-url"
                                    type="url"
                                    value={cardData.videoIntro}
                                    onChange={(e) => setCardData({ ...cardData, videoIntro: e.target.value })}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="mt-1.5"
                                />
                            </div>

                            {cardData.videoIntro && (
                                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-border shadow-sm">
                                    {cardData.videoIntro.includes('youtube') || cardData.videoIntro.includes('vimeo') ? (
                                        <iframe
                                            src={cardData.videoIntro.replace('watch?v=', 'embed/')}
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video src={cardData.videoIntro} controls className="w-full h-full" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-6">
                    <div className="space-y-4 p-6 border border-border rounded-xl bg-card">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Volume2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Name Pronunciation</h3>
                                <p className="text-sm text-muted-foreground">Help people say your name correctly</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label htmlFor="audio-upload">Audio File</Label>
                                    <div className="flex gap-2 mt-1.5">
                                        <Input
                                            value={cardData.audioPronunciation}
                                            onChange={(e) => setCardData({ ...cardData, audioPronunciation: e.target.value })}
                                            placeholder="Audio URL..."
                                            readOnly={uploadingMedia}
                                        />
                                        <Label htmlFor="audio-file-upload" className="cursor-pointer">
                                            <Button variant="outline" disabled={uploadingMedia} asChild>
                                                <span>
                                                    <Upload className="w-4 h-4" />
                                                </span>
                                            </Button>
                                        </Label>
                                        <Input
                                            id="audio-file-upload"
                                            type="file"
                                            accept="audio/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file || !user) return;

                                                setUploadingMedia(true);
                                                try {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${user.id}/audio/${Math.random()}.${fileExt}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('avatars')
                                                        .upload(fileName, file);

                                                    if (uploadError) throw uploadError;

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('avatars')
                                                        .getPublicUrl(fileName);

                                                    setCardData({ ...cardData, audioPronunciation: publicUrl });
                                                    toast({ title: "Audio uploaded!" });
                                                } catch (error: any) {
                                                    toast({
                                                        title: "Upload failed",
                                                        description: error.message,
                                                        variant: "destructive"
                                                    });
                                                } finally {
                                                    setUploadingMedia(false);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {cardData.audioPronunciation && (
                                <div className="p-4 bg-muted rounded-lg flex items-center justify-center">
                                    <audio controls className="w-full">
                                        <source src={cardData.audioPronunciation} />
                                        Your browser does not support audio playback.
                                    </audio>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
