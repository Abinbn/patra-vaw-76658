import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Calendar,
  ArrowLeft,
  Activity,
  MousePointerClick,
  Share2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { format, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';

interface AnalyticsData {
  id: string;
  event_type: string;
  device_type: string;
  country: string;
  city: string;
  created_at: string;
  card_id: string;
}

interface DigitalCard {
  id: string;
  title: string;
  vanity_url: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch user's cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('digital_cards')
        .select('id, title, vanity_url')
        .eq('owner_user_id', user.id);

      if (cardsError) throw cardsError;
      setCards(cardsData || []);

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('card_analytics')
        .select('*')
        .in('card_id', cardsData?.map(card => card.id) || [])
        .order('created_at', { ascending: false });

      if (analyticsError) throw analyticsError;
      setAnalytics(analyticsData || []);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalytics = useMemo(() => {
    return selectedCard === 'all'
      ? analytics
      : analytics.filter(item => item.card_id === selectedCard);
  }, [selectedCard, analytics]);

  // --- Data Processing for Charts ---

  const timeSeriesData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);

      const views = filteredAnalytics.filter(item =>
        item.event_type === 'view' && isSameDay(parseISO(item.created_at), date)
      ).length;

      const interactions = filteredAnalytics.filter(item =>
        item.event_type !== 'view' && isSameDay(parseISO(item.created_at), date)
      ).length;

      data.push({
        date: format(date, 'MMM dd'),
        views,
        interactions
      });
    }
    return data;
  }, [filteredAnalytics]);

  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAnalytics.forEach(item => {
      const device = item.device_type || 'Unknown';
      counts[device] = (counts[device] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredAnalytics]);

  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAnalytics.forEach(item => {
      if (item.country) {
        counts[item.country] = (counts[item.country] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredAnalytics]);

  // --- Stats Helpers ---

  const getTotalViews = () => filteredAnalytics.filter(item => item.event_type === 'view').length;
  const getTotalTaps = () => filteredAnalytics.filter(item => item.event_type === 'tap').length;
  const getTotalShares = () => filteredAnalytics.filter(item => item.event_type === 'share').length;

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/editor')} className="rounded-full hover:bg-muted">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-primary" />
                  Analytics Dashboard
                </h1>
              </div>
            </div>

            {/* Card Filter Dropdown could go here, but using tabs below for better visibility */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">

        {/* Card Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
          <Button
            variant={selectedCard === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCard('all')}
            className="rounded-full"
            size="sm"
          >
            All Cards
          </Button>
          {cards.map((card) => (
            <Button
              key={card.id}
              variant={selectedCard === card.id ? 'default' : 'outline'}
              onClick={() => setSelectedCard(card.id)}
              className="rounded-full"
              size="sm"
            >
              {card.title}
            </Button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Views"
            value={getTotalViews()}
            icon={Users}
            color="text-blue-500"
            bg="bg-blue-500/10"
            trend="+12% this week" // Placeholder trend
          />
          <StatCard
            title="NFC Taps"
            value={getTotalTaps()}
            icon={MousePointerClick}
            color="text-purple-500"
            bg="bg-purple-500/10"
          />
          <StatCard
            title="Shares"
            value={getTotalShares()}
            icon={Share2}
            color="text-pink-500"
            bg="bg-pink-500/10"
          />
          <StatCard
            title="Total Interactions"
            value={filteredAnalytics.length}
            icon={BarChart3}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Views vs. Interactions over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        name="Page Views"
                      />
                      <Area
                        type="monotone"
                        dataKey="interactions"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorInteractions)"
                        name="Interactions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Device Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  Device Usage
                </CardTitle>
                <CardDescription>What devices your visitors use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full relative">
                  {deviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <PieChartIcon className="w-12 h-12 mb-2 opacity-20" />
                      <p>No device data</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  Top Locations
                </CardTitle>
                <CardDescription>Where your traffic is coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  {countryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="hsl(var(--foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={80}
                        />
                        <RechartsTooltip
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MapPin className="w-12 h-12 mb-2 opacity-20" />
                      <p>No location data</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest real-time interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                  {filteredAnalytics.length > 0 ? (
                    filteredAnalytics.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${item.event_type === 'view' ? 'bg-blue-500/10 text-blue-500' :
                              item.event_type === 'tap' ? 'bg-purple-500/10 text-purple-500' :
                                'bg-pink-500/10 text-pink-500'
                            }`}>
                            {item.event_type === 'view' ? <Users className="w-3 h-3" /> :
                              item.event_type === 'tap' ? <MousePointerClick className="w-3 h-3" /> :
                                <Share2 className="w-3 h-3" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">{item.event_type}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {getDeviceIcon(item.device_type)}
                              <span>{item.device_type || 'Unknown'}</span>
                              {item.city && (
                                <>
                                  <span>•</span>
                                  <span>{item.city}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Helper Component for Stat Cards
const StatCard = ({ title, value, icon: Icon, color, bg, trend }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
        <Icon className="w-24 h-24 -mr-8 -mt-8" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bg} ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </Badge>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);