import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Activity, Users, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: {
        value: number;
        isPositive: boolean;
        label: string;
    };
    chartData?: any[];
    chartColor?: string;
    delay: number;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    chartData,
    chartColor = "#3b82f6",
    delay
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
    >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h3 className="text-2xl font-bold mt-1">{value}</h3>
                    </div>
                    <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${chartColor}20` }}>
                        <Icon className="w-4 h-4" style={{ color: chartColor }} />
                    </div>
                </div>

                {trend && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                        <span className={`flex items-center px-2 py-0.5 rounded text-xs font-medium ${trend.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {trend.isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                            {Math.abs(trend.value)}%
                        </span>
                        <span className="text-muted-foreground text-xs">{trend.label}</span>
                    </div>
                )}

                {chartData && (
                    <div className="h-[50px] -mx-6 -mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={chartColor}
                                    fillOpacity={1}
                                    fill={`url(#gradient-${title})`}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

interface EnhancedStatsProps {
    stats: {
        totalViews: number;
        activeCards: number;
        savedProfiles: number;
        connections: number;
        viewsTrend: number;
        profilesTrend: number;
    };
    viewData: any[];
    activityData: any[];
}

export const EnhancedStats: React.FC<EnhancedStatsProps> = ({ stats, viewData, activityData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Total Views"
                value={stats.totalViews.toLocaleString()}
                icon={Eye}
                trend={{
                    value: stats.viewsTrend,
                    isPositive: stats.viewsTrend >= 0,
                    label: "vs last week"
                }}
                chartData={viewData}
                chartColor="#3b82f6" // Blue
                delay={0}
            />

            <StatCard
                title="Active Cards"
                value={stats.activeCards}
                icon={Activity}
                chartData={activityData}
                chartColor="#10b981" // Green
                delay={0.1}
            />

            <StatCard
                title="Saved Profiles"
                value={stats.savedProfiles}
                icon={Users}
                trend={{
                    value: stats.profilesTrend,
                    isPositive: stats.profilesTrend >= 0,
                    label: "new this week"
                }}
                chartColor="#8b5cf6" // Purple
                delay={0.2}
            />

            <StatCard
                title="Connections"
                value={stats.connections}
                icon={LinkIcon}
                chartColor="#f59e0b" // Amber
                delay={0.3}
            />
        </div>
    );
};
