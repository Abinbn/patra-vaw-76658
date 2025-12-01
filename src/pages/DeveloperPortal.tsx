import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Code,
    Key,
    Copy,
    Check,
    Trash2,
    Plus,
    ExternalLink,
    BookOpen,
    Terminal,
    ChevronRight,
    Eye,
    EyeOff,
    RefreshCw,
    Activity,
    Zap,
    Globe,
    Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ApiKey {
    id: string;
    name: string;
    key: string;
    created_at: string;
    last_used?: string;
    requests_count: number;
}

export const DeveloperPortal: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
    const [generatedKey, setGeneratedKey] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        // Simulated API keys for demo
        setApiKeys([
            {
                id: '1',
                name: 'Production API',
                key: 'sk_live_4eC39HqLyjWDarjtT1zdp7dc',
                created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                requests_count: 12453
            },
            {
                id: '2',
                name: 'Development API',
                key: 'sk_test_BQokikJOvBiI2HlWgH4olfQ2',
                created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                last_used: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                requests_count: 3421
            }
        ]);
    };

    const generateApiKey = () => {
        const prefix = 'sk_live_';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = prefix;
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    };

    const handleCreateKey = () => {
        if (!newKeyName.trim()) {
            toast.error('Please enter a name for your API key');
            return;
        }

        const newKey = generateApiKey();
        const newApiKey: ApiKey = {
            id: Date.now().toString(),
            name: newKeyName,
            key: newKey,
            created_at: new Date().toISOString(),
            requests_count: 0
        };

        setApiKeys([...apiKeys, newApiKey]);
        setGeneratedKey(newKey);
        setNewKeyName('');
        toast.success('API key created successfully');
    };

    const handleDeleteKey = (id: string) => {
        setApiKeys(apiKeys.filter(k => k.id !== id));
        toast.success('API key revoked');
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleKeyVisibility = (id: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisibleKeys(newVisible);
    };

    const maskKey = (key: string) => {
        const prefix = key.substring(0, 8);
        const suffix = key.substring(key.length - 4);
        return `${prefix}${'•'.repeat(20)}${suffix}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/settings')}
                                className="hover:bg-primary/10"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
                                    <Terminal className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        Developer Portal
                                    </h1>
                                    <p className="hidden sm:block text-sm text-muted-foreground">
                                        Manage API keys and integrations
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/api-docs')}
                            className="gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">Documentation</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
                <div className="space-y-8">
                    {/* Stats Overview */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Requests</p>
                                        <p className="text-2xl font-bold">
                                            {apiKeys.reduce((sum, key) => sum + key.requests_count, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Active Keys</p>
                                        <p className="text-2xl font-bold">{apiKeys.length}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Key className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Rate Limit</p>
                                        <p className="text-2xl font-bold">1,000/hr</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* API Keys Management */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5 text-primary" />
                                        API Keys
                                    </CardTitle>
                                    <CardDescription>
                                        Create and manage your API keys for authentication
                                    </CardDescription>
                                </div>
                                <AlertDialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
                                    <AlertDialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            Create New Key
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Create New API Key</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Give your API key a descriptive name to help you identify it later.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="keyName">Key Name</Label>
                                                <Input
                                                    id="keyName"
                                                    placeholder="e.g., Production API, Development"
                                                    value={newKeyName}
                                                    onChange={(e) => setNewKeyName(e.target.value)}
                                                />
                                            </div>
                                            {generatedKey && (
                                                <div className="space-y-2">
                                                    <Label>Your New API Key</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={generatedKey}
                                                            readOnly
                                                            className="font-mono text-sm"
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => handleCopy(generatedKey, 'new-key')}
                                                        >
                                                            {copiedId === 'new-key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-destructive">
                                                        ⚠️ Save this key now. You won't be able to see it again!
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => {
                                                setGeneratedKey('');
                                                setNewKeyName('');
                                            }}>
                                                {generatedKey ? 'Close' : 'Cancel'}
                                            </AlertDialogCancel>
                                            {!generatedKey && (
                                                <AlertDialogAction onClick={handleCreateKey}>
                                                    Generate Key
                                                </AlertDialogAction>
                                            )}
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {apiKeys.length === 0 ? (
                                <div className="text-center py-12">
                                    <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-4">No API keys yet</p>
                                    <Button onClick={() => setShowNewKeyDialog(true)} className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Create Your First Key
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {apiKeys.map((apiKey) => (
                                        <div
                                            key={apiKey.id}
                                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-semibold">{apiKey.name}</h3>
                                                        <Badge variant={apiKey.key.startsWith('sk_live') ? 'default' : 'secondary'}>
                                                            {apiKey.key.startsWith('sk_live') ? 'Live' : 'Test'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded flex-1 truncate">
                                                            {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                                                        </code>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => toggleKeyVisibility(apiKey.id)}
                                                        >
                                                            {visibleKeys.has(apiKey.id) ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleCopy(apiKey.key, apiKey.id)}
                                                        >
                                                            {copiedId === apiKey.id ? (
                                                                <Check className="w-4 h-4" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <span>Created {formatDate(apiKey.created_at)}</span>
                                                        {apiKey.last_used && (
                                                            <span>Last used {formatRelativeTime(apiKey.last_used)}</span>
                                                        )}
                                                        <span>{apiKey.requests_count.toLocaleString()} requests</span>
                                                    </div>
                                                </div>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently revoke the API key "{apiKey.name}".
                                                                Any applications using this key will stop working immediately.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteKey(apiKey.id)}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                Revoke Key
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/api-docs')}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">API Documentation</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Explore endpoints, examples, and integration guides
                                        </p>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                        <Shield className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">Security Best Practices</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Learn how to keep your API keys secure
                                        </p>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security Notice */}
                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <Shield className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Keep Your Keys Secure</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Never share your API keys publicly or commit them to version control</li>
                                        <li>• Use environment variables to store keys in your applications</li>
                                        <li>• Rotate keys regularly and revoke unused keys immediately</li>
                                        <li>• Use different keys for development and production environments</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
