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
                        { fps: 10, qrbox: { width: 250, height: 250 } },
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
        // Mocking the fetch for now, replace with actual API call
        // Logic: 
        // 1. Parse code to get identifier
        // 2. Fetch profile from Supabase

        setScannedData({
            username: "john_doe",
            displayName: "John Doe",
            jobTitle: "Software Engineer",
            avatarUrl: null, // Replace with actual URL if available
            cardId: "mock-card-id",
            userId: "mock-user-id"
        });
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualEntry.trim()) return;

        // Simulate finding a user
        handleScannedCode(manualEntry);
    };

    const handleSaveProfile = async () => {
        if (!scannedData) return;

        setIsSaving(true);

        // Simulate API call to save profile
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            toast({
                title: "Profile Saved!",
                description: `You have successfully connected with ${scannedData.displayName}.`,
            });
        }, 1500);
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
                                    <div className="relative overflow-hidden rounded-xl bg-black aspect-square flex items-center justify-center">
                                        <div id="qr-reader" className="w-full h-full"></div>

                                        {!isScanning && !scanError && (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                            </div>
                                        )}

                                        {scanError && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                                                <Camera className="w-12 h-12 mb-2 opacity-50" />
                                                <p className="text-sm">{scanError}</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                    onClick={startScanner}
                                                >
                                                    Retry Camera
                                                </Button>
                                            </div>
                                        )}

                                        {/* Scanning Overlay Frame */}
                                        {isScanning && (
                                            <div className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary/50 rounded-lg">
                                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                                                </div>
                                                <motion.div
                                                    className="absolute top-1/2 left-1/2 w-64 h-0.5 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                                                    initial={{ y: -128, x: -128, opacity: 0.5 }}
                                                    animate={{ y: 128 }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                                        <Input
                                            placeholder="Enter username or code"
                                            value={manualEntry}
                                            onChange={(e) => setManualEntry(e.target.value)}
                                        />
                                        <Button type="submit" disabled={!manualEntry.trim()}>
                                            Connect
                                        </Button>
                                    </form>
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
