import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Copy,
  Check,
  Terminal,
  Globe,
  Code,
  Key,
  Search,
  BookOpen,
  Zap,
  Layout,
  Server
} from 'lucide-react';
import { toast } from 'sonner';

export const ApiDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interactive API State
  const [testUsername, setTestUsername] = useState('');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Embed Generator State
  const [embedUsername, setEmbedUsername] = useState('');
  const [embedTheme, setEmbedTheme] = useState<'light' | 'dark'>('light');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestApi = async () => {
    if (!testUsername) {
      toast.error('Please enter a username');
      return;
    }

    setIsLoading(true);
    setApiResponse(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const { data: card, error } = await supabase
        .from('digital_cards')
        .select(`
          *,
          profiles:owner_user_id (
            display_name,
            job_title,
            company_name,
            avatar_url,
            bio
          )
        `)
        .eq('vanity_url', testUsername)
        .single();

      if (error) {
        setApiResponse(JSON.stringify({ error: 'User not found', message: error.message }, null, 2));
      } else {
        // Transform to a cleaner API-like response
        const publicResponse = {
          id: card.id,
          username: card.vanity_url,
          displayName: card.profiles?.display_name,
          jobTitle: card.profiles?.job_title,
          company: card.profiles?.company_name,
          bio: card.profiles?.bio,
          avatarUrl: card.profiles?.avatar_url,
          cardTitle: card.title,
          qrCode: card.qr_code_url,
          updatedAt: card.updated_at
        };
        setApiResponse(JSON.stringify(publicResponse, null, 2));
      }
    } catch (err) {
      setApiResponse(JSON.stringify({ error: 'Internal Server Error' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: 'introduction', label: 'Introduction', icon: BookOpen },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'endpoints', label: 'Endpoints', icon: Server },
    { id: 'embedding', label: 'Embedding', icon: Globe },
    { id: 'sdks', label: 'SDKs & Libraries', icon: Code },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 hidden md:flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Terminal className="w-6 h-6" />
            <span>Patra API</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Developer Documentation v1.0
          </p>
        </div>
        <ScrollArea className="flex-1 py-4">
          <div className="space-y-1 px-4">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full gap-2" onClick={() => window.open('/dashboard', '_blank')}>
            <Layout className="w-4 h-4" />
            Developer Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-12">

          {/* Introduction */}
          {activeSection === 'introduction' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-4xl font-bold mb-4">Patra API Documentation</h1>
                <p className="text-xl text-muted-foreground">
                  Integrate powerful digital identity features into your applications.
                  Create users, fetch profiles, and embed cards with ease.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Fast Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Get up and running in minutes with our RESTful API and drop-in embed scripts.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      Universal Embedding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Display user cards on any website, blog, or app with a simple iframe or script tag.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Authentication */}
          {activeSection === 'authentication' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold">Authentication</h2>
              <p className="text-muted-foreground">
                Authenticate your requests using your API key. You can find your keys in the Developer Dashboard.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle>Authorization Header</CardTitle>
                  <CardDescription>Pass your API key in the header of your requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm relative group">
                    <code>Authorization: Bearer sk_live_xxxxxxxxxxxxx</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy('Authorization: Bearer sk_live_xxxxxxxxxxxxx', 'auth-header')}
                    >
                      {copiedId === 'auth-header' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Endpoints */}
          {activeSection === 'endpoints' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold mb-4">Endpoints</h2>
                <p className="text-muted-foreground">
                  Explore our core API endpoints. Use the interactive playground to test them in real-time.
                </p>
              </div>

              <Tabs defaultValue="get-user" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="get-user">Get User Details</TabsTrigger>
                  <TabsTrigger value="search">Search Users</TabsTrigger>
                </TabsList>

                <TabsContent value="get-user" className="mt-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">GET</Badge>
                    <code className="text-lg font-mono">/v1/cards/:username</code>
                  </div>

                  <p className="text-muted-foreground">
                    Retrieve public details for a specific user card using their vanity URL (username).
                  </p>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Try it out</CardTitle>
                      <CardDescription>Enter a username to fetch their details live from our database.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            placeholder="e.g. johndoe"
                            value={testUsername}
                            onChange={(e) => setTestUsername(e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleTestApi} disabled={isLoading}>
                            {isLoading ? 'Fetching...' : 'Send Request'}
                          </Button>
                        </div>
                      </div>

                      {apiResponse && (
                        <div className="mt-4">
                          <Label>Response</Label>
                          <div className="bg-slate-950 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96 relative group">
                            <pre>{apiResponse}</pre>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-2 right-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleCopy(apiResponse, 'api-response')}
                            >
                              {copiedId === 'api-response' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="search" className="mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">GET</Badge>
                    <code className="text-lg font-mono">/v1/cards/search</code>
                  </div>
                  <p className="text-muted-foreground">
                    Search for users by name, job title, or company. (Documentation only for this demo)
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Embedding */}
          {activeSection === 'embedding' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold">Embedding</h2>
              <p className="text-muted-foreground">
                Embed Patra cards directly into your website. Use our generator to create the code snippet.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle>Embed Code Generator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        placeholder="e.g. johndoe"
                        value={embedUsername}
                        onChange={(e) => setEmbedUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={embedTheme === 'light' ? 'default' : 'outline'}
                          onClick={() => setEmbedTheme('light')}
                          className="w-full"
                        >
                          Light
                        </Button>
                        <Button
                          variant={embedTheme === 'dark' ? 'default' : 'outline'}
                          onClick={() => setEmbedTheme('dark')}
                          className="w-full"
                        >
                          Dark
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Generated Code</Label>
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm relative group">
                      <pre className="whitespace-pre-wrap break-all">
                        {`<div class="patra-embed" 
     data-user="${embedUsername || 'USERNAME'}" 
     data-theme="${embedTheme}">
</div>
<script src="https://patra.app/embed.js" async></script>`}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(
                          `<div class="patra-embed" data-user="${embedUsername || 'USERNAME'}" data-theme="${embedTheme}"></div><script src="https://patra.app/embed.js" async></script>`,
                          'embed-code'
                        )}
                      >
                        {copiedId === 'embed-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">
                      Preview of how the card will appear would go here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SDKs */}
          {activeSection === 'sdks' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold">SDKs & Libraries</h2>
              <p className="text-muted-foreground">
                Official libraries to help you integrate faster.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Node.js
                    </CardTitle>
                    <CardDescription>npm install @patra/node</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Python
                    </CardTitle>
                    <CardDescription>pip install patra-python</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      React
                    </CardTitle>
                    <CardDescription>npm install @patra/react</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
