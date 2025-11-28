import React from 'react';
import { CardData } from './types';
import { paymentPlatforms } from './constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentLinksEditorProps {
    cardData: CardData;
    setCardData: (data: CardData) => void;
}

export const PaymentLinksEditor: React.FC<PaymentLinksEditorProps> = ({ cardData, setCardData }) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Payment Methods</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Add your payment links
                </p>
            </div>

            {/* UPI ID Section */}
            <div className="space-y-4 pb-6 border-b">
                <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                        id="upiId"
                        value={cardData.upiId}
                        onChange={(e) => setCardData({ ...cardData, upiId: e.target.value })}
                        placeholder="yourname@upi"
                        className="rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Your primary UPI payment ID
                    </p>
                </div>
            </div>

            {/* Other Payment Links */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Other Payment Links</h3>
                <div className="space-y-5">
                    {paymentPlatforms.map((platform) => {
                        const existingLink = cardData.paymentLinks.find(
                            (l) => l.platform === platform.name
                        );

                        return (
                            <div
                                key={platform.name}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 hover:bg-gray-100 p-3 rounded-xl shadow-sm transition-all"
                            >
                                {/* Label with Icon */}
                                <Label className="flex items-center gap-2 text-gray-700 font-medium">
                                    <span className="text-xl">{platform.icon}</span>
                                    <span>{platform.name}</span>
                                </Label>

                                {/* Input Field */}
                                <Input
                                    value={existingLink?.url || ""}
                                    onChange={(e) => {
                                        const newLinks = cardData.paymentLinks.filter(
                                            (l) => l.platform !== platform.name
                                        );
                                        if (e.target.value) {
                                            newLinks.push({
                                                platform: platform.name,
                                                url: e.target.value,
                                                icon: platform.name,
                                            });
                                        }
                                        setCardData({ ...cardData, paymentLinks: newLinks });
                                    }}
                                    placeholder={`Enter your ${platform.name} link`}
                                    className="w-full sm:w-2/3 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-100 transition"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
