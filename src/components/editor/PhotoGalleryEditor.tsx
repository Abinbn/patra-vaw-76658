import React, { useState } from 'react';
import { CardData, Photo } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Video, Volume2, ImageIcon, Upload, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
                <h2 className="text-2xl font-bold mb-2">Gallery</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Add videos, photos, and audio to showcase your work
                </p>
            </div>

            <div className="space-y-6">
                {/* Video Introduction */}
                <div className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Video className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Video Introduction</h3>
                    </div>
                    <div>
                        <Label htmlFor="video-upload">Upload Video or Paste URL</Label>
                        <div className="flex gap-2">
                            <Input
                                id="video-url"
                                type="url"
                                value={cardData.videoIntro}
                                onChange={(e) => setCardData({ ...cardData, videoIntro: e.target.value })}
                                placeholder="Paste video URL or upload below"
                                readOnly={uploadingMedia}
                            />
                            <Label htmlFor="video-file-upload" className="cursor-pointer">
                                <Button variant="outline" disabled={uploadingMedia} asChild>
                                    <span>
                                        <Upload className="w-4 h-4 mr-2" />
                                        {uploadingMedia ? 'Uploading...' : 'Upload'}
                                    </span>
                                </Button>
                            </Label>
                            <Input
                                id="video-file-upload"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file || !user) return;

                                    setUploadingMedia(true);
                                    try {
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `${user.id}/videos/${Math.random()}.${fileExt}`;

                                        const { error: uploadError } = await supabase.storage
                                            .from('avatars')
                                            .upload(fileName, file);

                                        if (uploadError) throw uploadError;

                                        const { data: { publicUrl } } = supabase.storage
                                            .from('avatars')
                                            .getPublicUrl(fileName);

                                        setCardData({ ...cardData, videoIntro: publicUrl });

                                        toast({
                                            title: "Video uploaded!",
                                            description: "Video has been added.",
                                        });
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Upload a video file or paste a URL
                        </p>
                    </div>
                    {cardData.videoIntro && (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden scrollbar-thin">
                            {cardData.videoIntro.includes('youtube') || cardData.videoIntro.includes('vimeo') ? (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <Video className="w-12 h-12 text-muted-foreground" />
                                </div>
                            ) : (
                                <video src={cardData.videoIntro} controls className="w-full h-full" />
                            )}
                        </div>
                    )}
                </div>

                {/* Audio Pronunciation */}
                <div className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Audio Pronunciation</h3>
                    </div>
                    <div>
                        <Label htmlFor="audio-upload">Upload Audio File</Label>
                        <div className="flex gap-2">
                            <Input
                                value={cardData.audioPronunciation}
                                onChange={(e) => setCardData({ ...cardData, audioPronunciation: e.target.value })}
                                placeholder="Audio URL or upload below"
                                readOnly={uploadingMedia}
                            />
                            <Label htmlFor="audio-file-upload" className="cursor-pointer">
                                <Button variant="outline" disabled={uploadingMedia} asChild>
                                    <span>
                                        <Upload className="w-4 h-4 mr-2" />
                                        {uploadingMedia ? 'Uploading...' : 'Upload'}
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

                                        toast({
                                            title: "Audio uploaded!",
                                            description: "Pronunciation has been added.",
                                        });
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Record how to pronounce your name (MP3, WAV)
                        </p>
                    </div>
                    {cardData.audioPronunciation && (
                        <audio controls className="w-full">
                            <source src={cardData.audioPronunciation} />
                            Your browser does not support audio playback.
                        </audio>
                    )}
                </div>

                {/* Photos Section */}
                <div className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Photos ({cardData.photos.length}/5)</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="photo-caption">Photo Caption (Optional)</Label>
                            <Input
                                id="photo-caption"
                                value={newPhotoCaption}
                                onChange={(e) => setNewPhotoCaption(e.target.value)}
                                placeholder="Add a caption for this photo"
                            />
                        </div>
                        <Label htmlFor="photo-upload" className="cursor-pointer">
                            <Button variant="outline" disabled={uploadingPhoto || cardData.photos.length >= 5} asChild className="w-full">
                                <span>
                                    <Upload className="w-4 h-4 mr-2" />
                                    {uploadingPhoto ? 'Uploading...' : cardData.photos.length >= 5 ? 'Maximum 5 photos' : 'Upload Photo'}
                                </span>
                            </Button>
                        </Label>
                        <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !user) return;

                                // Check photo limit
                                if (cardData.photos.length >= 5) {
                                    toast({
                                        title: "Upload limit reached",
                                        description: "Maximum 5 photos allowed",
                                        variant: "destructive"
                                    });
                                    return;
                                }

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
                                        description: `Photo ${cardData.photos.length + 1}/5 added to your gallery.`,
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

                    {/* Photo Gallery */}
                    {cardData.photos.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <h4 className="font-medium text-sm">Your Photos</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {cardData.photos.map((photo, index) => (
                                    <div key={photo.id} className="relative group">
                                        <img
                                            src={photo.url}
                                            alt={photo.caption || 'Photo'}
                                            className="w-full aspect-square object-cover rounded-lg"
                                        />
                                        {photo.caption && (
                                            <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setCardData({
                                                    ...cardData,
                                                    photos: cardData.photos.filter((_, i) => i !== index)
                                                });
                                                toast({ title: "Photo deleted" });
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
