import React from 'react';
import { CardData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LocationEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const LocationEditor: React.FC<LocationEditorProps> = ({ cardData, setCardData }) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Location</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Set your address, map, and precise coordinates
                </p>
            </div>

            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <div>
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                        id="address"
                        value={cardData.address || ''}
                        onChange={(e) => setCardData({ ...cardData, address: e.target.value })}
                        placeholder="Building Number 21, Infocity, Chandaka Industrial Estate, Patia, Odisha, Bhubaneswar, 751024"
                        className="min-h-[60px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Enter your complete business address
                    </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium">Show map on profile</Label>
                        <p className="text-xs text-muted-foreground">
                            Display an interactive map with your location
                        </p>
                    </div>
                    <Switch
                        checked={cardData.showAddressMap || false}
                        onCheckedChange={(checked) => setCardData({ ...cardData, showAddressMap: checked })}
                        disabled={!cardData.address && !cardData.latitude && !cardData.longitude && !cardData.mapUrl}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Location Coordinates (Optional)</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (!navigator.geolocation) {
                                    toast({ title: 'Not Supported', description: 'Geolocation is not supported by your browser', variant: 'destructive' });
                                    return;
                                }
                                navigator.geolocation.getCurrentPosition(
                                    (pos) => {
                                        const lat = Number(pos.coords.latitude.toFixed(6));
                                        const lng = Number(pos.coords.longitude.toFixed(6));
                                        setCardData({ ...cardData, latitude: lat, longitude: lng });
                                        toast({ title: 'Location Fetched', description: 'Device location captured' });
                                    },
                                    (err) => {
                                        toast({ title: 'Error', description: err.message || 'Failed to get your location', variant: 'destructive' });
                                    },
                                    { enableHighAccuracy: true }
                                );
                            }}
                        >
                            <Navigation className="w-4 h-4 mr-2" />
                            Use My Location
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="any"
                                value={cardData.latitude ?? ''}
                                onChange={(e) => setCardData({ ...cardData, latitude: e.target.value === '' ? null : Number(e.target.value) })}
                                placeholder="e.g., 20.296059"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                value={cardData.longitude ?? ''}
                                onChange={(e) => setCardData({ ...cardData, longitude: e.target.value === '' ? null : Number(e.target.value) })}
                                placeholder="e.g., 85.824539"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Add precise coordinates if the map shows incorrect location.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mapUrl" className="text-sm font-medium">Google Maps URL (Optional)</Label>
                    <Input
                        id="mapUrl"
                        type="url"
                        value={cardData.mapUrl || ''}
                        onChange={(e) => setCardData({ ...cardData, mapUrl: e.target.value })}
                        placeholder="https://maps.google.com/?q=..."
                    />
                    <p className="text-xs text-muted-foreground">
                        Provide a Google Maps link if you prefer a specific place URL.
                    </p>
                </div>

            </div>
        </div>
    );
};
