import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { QrCode, Camera, Sun, Copy, Check, X, Smartphone, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CardDropModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'send' | 'receive';
    cards: any[]; // Pass user's cards for selection
    userProfile: any;
}

export const CardDropModal: React.FC<CardDropModalProps> = ({
    isOpen,
    onClose,
    initialMode = 'send',
    cards,
    userProfile
}) => {
    const [mode, setMode] = useState<'send' | 'receive'>(initialMode);
    const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
    const [brightnessBoosted, setBrightnessBoosted] = useState(false);
    const [manualEntry, setManualEntry] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState<any | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // For QR Scanner
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Confetti
    const { width, height } = useWindowSize();

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            if (cards.length > 0 && !selectedCardId) {
                setSelectedCardId(cards[0].id);
            }
        } else {
            // Cleanup on close
            stopScanner();
            setScannedData(null);
            setSaveSuccess(false);
        }
    }, [isOpen, initialMode, cards]);

    // Brightness simulation
    useEffect(() => {
        if (isOpen && mode === 'send') {
            setBrightnessBoosted(true);
            // In a real native app, we would call a bridge to increase screen brightness
        } else {
            setBrightnessBoosted(false);
        }
    }, [isOpen, mode]);

    // Initialize Scanner when entering Receive mode
    useEffect(() => {
        if (isOpen && mode === 'receive' && !scannedData) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => stopScanner();
    }, [isOpen, mode, scannedData]);

    const startScanner = () => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            const element = document.getElementById('qr-reader');
            if (element && !scannerRef.current) {
                try {
                    const scanner = new Html5QrcodeScanner(
                        "qr-reader",
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            videoConstraints: {
                                facingMode: "environment"
                            }
                        },
            /* verbose= */ false
                    );

                    scanner.render(onScanSuccess, onScanFailure);
                    scannerRef.current = scanner;
                    setIsScanning(true);
                } catch (e) {
                    console.error("Error starting scanner:", e);
                    setScanError("Could not start camera. Please check permissions.");
                }
            }
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.clear().catch(console.error);
            } catch (e) {
                console.error("Error clearing scanner:", e);
            }
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
        // Handle the scanned code
        console.log(`Code matched = ${decodedText}`, decodedResult);
        stopScanner();

        // Parse the URL to get username or card ID
        // Expected format: https://patra.app/:username?card=:cardId
        // Or simple: :username?card=:cardId

        // For now, let's simulate fetching profile data based on the scanned text
        // In a real implementation, we would parse the URL and fetch from API

        handleScannedCode(decodedText);
    };

    const onScanFailure = (error: any) => {
        // console.warn(`Code scan error = ${error}`);
    };

    const handleScannedCode = async (code: string) => {
        // Check for self-scan
        const isSelf =
            code.includes(userProfile?.username) ||
            code === userProfile?.username ||
            cards.some(c => code.includes(c.vanity_url));

        if (isSelf) {
            toast({
                title: "Cannot Save Own Profile",
                description: "You can't save your profile to the folder, Check the spelling or rescan the qr code",
                variant: "destructive"
            });
            setTimeout(() => {
                if (mode === 'receive' && !scannedData) {
                    startScanner();
                }
            }, 2000);
            return;
        }

        try {
            // Parse the scanned code to extract vanity URL
            // Expected formats:
            // - https://patra.app/vanity_url
            // - @vanity_url (with @ prefix)
            // - vanity_url (direct input)
            let identifier = code.trim();

            // Remove @ prefix if present
            if (identifier.startsWith('@')) {
                identifier = identifier.substring(1);
            }

            // Extract vanity URL from full URL if needed
            if (identifier.includes('patra.app/')) {
                const urlParts = identifier.split('patra.app/');
                identifier = urlParts[1]?.split('?')[0] || identifier;
            }

            // Fetch the card and its owner's profile from Supabase
            const { data: cardData, error: cardError } = await supabase
                .from('digital_cards')
                .select(`
                    id,
                    vanity_url,
                    title,
                    owner_user_id,
                    profiles!digital_cards_owner_user_id_fkey (
                        id,
                        user_id,
                        display_name,
                        job_title,
                        avatar_url
                    )
                `)
                .eq('vanity_url', identifier)
                .eq('is_active', true)
                .maybeSingle();

            if (cardError || !cardData || !cardData.profiles) {
                toast({
                    title: "Card Not Found",
                    description: "Could not find an active card with that URL. Please check and try again.",
                    variant: "destructive"
                });
                setTimeout(() => {
                    if (mode === 'receive' && !scannedData) {
                        startScanner();
                    }
                }, 2000);
                return;
            }

            const profileData = Array.isArray(cardData.profiles) ? cardData.profiles[0] : cardData.profiles;

            // Check if already saved
            const { data: existingSave } = await supabase
                .from('saved_profiles')
                .select('id')
                .eq('user_id', userProfile.user_id)
                .eq('saved_user_id', profileData.user_id)
                .maybeSingle();

            if (existingSave) {
                toast({
                    title: "Already Saved",
                    description: `You already have ${profileData.display_name}'s card in your connections.`,
                });
                setTimeout(() => {
                    if (mode === 'receive' && !scannedData) {
                        startScanner();
                    }
                }, 2000);
                return;
            }

            setScannedData({
                username: cardData.vanity_url,
                displayName: profileData.display_name || 'User',
                jobTitle: profileData.job_title || 'Professional',
                avatarUrl: profileData.avatar_url,
                userId: profileData.user_id,
                cardId: cardData.id
            });
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            toast({
                title: "Error",
                description: "Failed to load card. Please try again.",
                variant: "destructive"
            });
            setTimeout(() => {
                if (mode === 'receive' && !scannedData) {
                    startScanner();
                }
            }, 2000);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualEntry.trim()) return;
        handleScannedCode(manualEntry);
    };

    const handleSaveProfile = async () => {
        if (!scannedData) return;

        setIsSaving(true);

        try {
            // Save to saved_profiles table
            const { error: saveError } = await supabase
                .from('saved_profiles')
                .insert({
                    user_id: userProfile.user_id,
                    saved_user_id: scannedData.userId,
                    saved_at: new Date().toISOString()
                });

            if (saveError) throw saveError;

            // Create profile_access record (bidirectional access)
            const { error: accessError } = await supabase
                .from('profile_access')
                .insert({
                    owner_user_id: scannedData.userId,
                    viewer_user_id: userProfile.user_id,
                    sharing_method: 'qr_scan',
                    shared_at: new Date().toISOString()
                });

            if (accessError) {
                console.warn('Access record creation failed:', accessError);
                // Don't fail the whole operation if access record fails
            }

            setIsSaving(false);
            setSaveSuccess(true);
            toast({
                title: "Profile Saved!",
                description: `You have successfully connected with ${scannedData.displayName}.`,
            });
        } catch (error: any) {
            console.error('Error saving profile:', error);
            setIsSaving(false);
            toast({
                title: "Error",
                description: "Failed to save profile. Please try again.",
                variant: "destructive"
            });
        }
    };

    const selectedCard = cards.find(c => c.id === selectedCardId);
    const qrValue = selectedCard
        ? `https://patra.app/${selectedCard.vanity_url}?source=qr`
        : `https://patra.app/u/${userProfile?.username}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md md:max-w-lg bg-card border-border p-0 overflow-hidden gap-0">
                {saveSuccess && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}

                <div className="flex flex-col h-full max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 pb-2">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center">Card Drop</DialogTitle>
                            <DialogDescription className="text-center">
                                Share your digital card or scan to connect
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 pt-2">
                        {!scannedData ? (
                            <Tabs value={mode} onValueChange={(v) => setMode(v as 'send' | 'receive')} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="send" className="gap-2">
                                        <QrCode className="w-4 h-4" /> Send
                                    </TabsTrigger>
                                    <TabsTrigger value="receive" className="gap-2">
                                        <Camera className="w-4 h-4" /> Receive
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="send" className="space-y-6">
                                    <div className="flex flex-col items-center justify-center space-y-6">
                                        {/* Card Selection */}
                                        {cards.length > 1 && (
                                            <div className="w-full">
                                                <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a card to share" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {cards.map(card => (
                                                            <SelectItem key={card.id} value={card.id}>
                                                                {card.title} ({card.vanity_url})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* QR Code Display */}
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative group"
                                        >
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                            <div className="relative bg-white p-6 rounded-xl shadow-xl">
                                                <QRCodeSVG
                                                    value={qrValue}
                                                    size={200}
                                                    level="H"
                                                    includeMargin={true}
                                                    imageSettings={{
                                                        src: "/favicon.ico", // Replace with app logo
                                                        x: undefined,
                                                        y: undefined,
                                                        height: 24,
                                                        width: 24,
                                                        excavate: true,
                                                    }}
                                                />
                                            </div>

                                            {/* Brightness Indicator */}
                                            {brightnessBoosted && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="absolute -bottom-12 left-0 right-0 flex justify-center"
                                                >
                                                    <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                                                        <Sun className="w-3 h-3" />
                                                        <span>Brightness boosted</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>

                                        <div className="text-center space-y-2 pt-4">
                                            <p className="font-mono text-sm bg-muted px-3 py-1 rounded-md select-all">
                                                @{selectedCard?.vanity_url || userProfile?.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Point camera at this code to connect
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="receive" className="space-y-4">
                                    <div className="relative overflow-hidden rounded-xl bg-black aspect-square flex items-center justify-center shadow-inner">
                                        <div id="qr-reader" className="w-full h-full object-cover"></div>

                                        {!isScanning && !scanError && (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                            </div>
                                        )}

                                        {scanError && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center bg-black/80">
                                                <Camera className="w-12 h-12 mb-2 opacity-50" />
                                                <p className="text-sm mb-4">{scanError}</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                    onClick={startScanner}
                                                >
                                                    Retry Camera
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <form onSubmit={handleManualSubmit} className="flex gap-2">
                                            <Input
                                                placeholder="Enter card URL (e.g., @abc123 or abc123)"
                                                value={manualEntry}
                                                onChange={(e) => setManualEntry(e.target.value)}
                                                className="bg-muted/50"
                                            />
                                            <Button type="submit" disabled={!manualEntry.trim()}>
                                                Connect
                                            </Button>
                                        </form>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            // Scanned Profile View
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center space-y-6 py-4"
                            >
                                <div className="relative">
                                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                        <AvatarImage src={scannedData.avatarUrl} />
                                        <AvatarFallback className="text-2xl">{scannedData.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {saveSuccess && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg"
                                        >
                                            <Check className="w-5 h-5" />
                                        </motion.div>
                                    )}
                                </div>

                                <div className="text-center space-y-1">
                                    <h3 className="text-2xl font-bold">{scannedData.displayName}</h3>
                                    <p className="text-muted-foreground">{scannedData.jobTitle}</p>
                                    <p className="text-sm text-primary font-medium">@{scannedData.username}</p>
                                </div>

                                {!saveSuccess ? (
                                    <div className="w-full space-y-3">
                                        <Button
                                            className="w-full gap-2 text-lg h-12"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                            Save to Dashboard
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setScannedData(null);
                                                setMode('receive');
                                            }}
                                        >
                                            Scan Another
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-3">
                                        <div className="bg-green-500/10 text-green-600 p-4 rounded-xl text-center text-sm font-medium">
                                            Profile saved successfully! You can now view it in your dashboard.
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={onClose}
                                        >
                                            Done
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
