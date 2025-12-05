import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, Shield, BarChart3, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionCardProps {
    id: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    gradient: string;
    onClick: () => void;
    delay: number;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
    title,
    subtitle,
    icon: Icon,
    gradient,
    onClick,
    delay
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
    >
        <Card
            className="h-full cursor-pointer overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group relative"
            onClick={onClick}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            <CardContent className="p-6 flex flex-col items-start justify-between h-full relative z-10">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1 w-full">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                </div>

                <div className="mt-4 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Button variant="secondary" size="sm" className="w-full bg-white/50 hover:bg-white/80 backdrop-blur-sm">
                        Open
                    </Button>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

interface QuickAccessPanelProps {
    onShare: () => void;
    onScan: () => void;
    onCreate: () => void;
    onAnalytics: () => void;
}

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({
    onShare,
    onScan,
    onCreate,
    onAnalytics
}) => {
    const actions = [
        {
            id: 'share',
            title: 'Share Your Card',
            subtitle: 'Generate QR code',
            icon: QrCode,
            gradient: 'from-blue-500 to-cyan-600',
            onClick: onShare,
        },
        {
            id: 'scan',
            title: 'Scan QR Code',
            subtitle: 'Save a profile',
            icon: Camera,
            gradient: 'from-emerald-500 to-green-600',
            onClick: onScan,
        },
        {
            id: 'create',
            title: 'My Connections',
            subtitle: 'View saved profiles',
            icon: Shield,
            gradient: 'from-purple-500 to-pink-600',
            onClick: onCreate,
        },
        {
            id: 'analytics',
            title: 'View Analytics',
            subtitle: 'Track performance',
            icon: BarChart3,
            gradient: 'from-orange-500 to-red-600',
            onClick: onAnalytics,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {actions.map((action, index) => (
                <QuickActionCard
                    key={action.id}
                    {...action}
                    delay={index * 0.1}
                />
            ))}
        </div>
    );
};
