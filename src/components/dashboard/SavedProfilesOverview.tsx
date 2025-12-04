import React from 'react';
import { motion } from 'framer-motion';
import { Folder, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SavedProfilesOverviewProps {
    totalSaved: number;
    newThisWeek: number;
    onViewAll: () => void;
}

export const SavedProfilesOverview: React.FC<SavedProfilesOverviewProps> = ({
    totalSaved,
    newThisWeek,
    onViewAll
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">My Saved Profiles</h2>
                <Button variant="ghost" className="gap-2" onClick={onViewAll}>
                    View All <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Folder Card */}
                <Card className="md:col-span-2 overflow-hidden border-none shadow-md bg-gradient-to-br from-violet-500 to-purple-600 text-white relative group cursor-pointer" onClick={onViewAll}>
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <CardContent className="p-8 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl inline-flex mb-4">
                                    <Folder className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Profile Collection</h3>
                                <p className="text-white/80 max-w-md">
                                    Manage your saved business cards and connections. Access shared profiles and organize them into folders.
                                </p>
                            </div>
                            <div className="hidden md:block">
                                {/* 3D Folder Effect Placeholder */}
                                <div className="relative w-32 h-24 bg-white/10 rounded-lg border border-white/20 transform rotate-6 group-hover:rotate-12 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-white/10 rounded-lg transform -rotate-6 group-hover:-rotate-12 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <Users className="w-4 h-4" />
                                <span className="font-medium">{totalSaved} Saved</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <span className="text-green-300 font-bold">+{newThisWeek}</span>
                                <span className="font-medium">New this week</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Access / Recent */}
                <Card className="border-none shadow-md bg-card">
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 text-muted-foreground uppercase text-xs tracking-wider">Recent Saves</h3>
                        <div className="space-y-4">
                            {/* Placeholder for recent items */}
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                                        <span className="text-xs font-bold">JD</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">John Doe</p>
                                        <p className="text-xs text-muted-foreground">Software Engineer</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4" size="sm" onClick={onViewAll}>
                            View All History
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};
