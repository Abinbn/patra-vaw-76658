import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Copy,
  Check,
  Terminal,
  Globe,
  Code,
  Key,
  BookOpen,
  Server,
  ArrowLeft,
  Layout,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const ApiDocs: React.FC = () => {
  const navigate = useNavigate();
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
      toast.error('Please enter a username or vanity URL');
      return;
    }

    setIsLoading(true);
    setApiResponse(null);

    try {
      console.log('Attempting to invoke get-card function...');

      // 1. Try standard invoke
      const { data, error } = await supabase.functions.invoke('get-card', {
        body: { vanity_url: testUsername },
        method: 'POST'
      });

      if (!error) {
        setApiResponse(JSON.stringify(data, null, 2));
        return;
      }

      console.warn('Invoke failed, trying fallback fetch...', error);

      // 2. Fallback: Direct Fetch (useful for local dev or if invoke misbehaves)
      // Construct URL based on environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ffpqhgiucoqjmkyeevqq.supabase.co";
      const functionUrl = `${supabaseUrl}/functions/v1/get-card`;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmcHFoZ2l1Y29xam1reWVldnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjY3NjcsImV4cCI6MjA3NDMwMjc2N30.9Vb7U2X0nT1dG8PP0x9LtGy3iPEkYeVMhEyvB6ZqQ6Q";

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vanity_url: testUsername })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Fetch failed');
      }

      setApiResponse(JSON.stringify(result, null, 2));

    } catch (err: any) {
      console.error('API Error:', err);

      // 3. Last Resort: Direct DB Query (Simulation)
      // If the function is down, we can at least show what the data WOULD look like
      // This is helpful for the user to see the structure even if the API is broken
      try {
        console.log('Falling back to direct DB query simulation...');
        const { data: card } = await supabase
          .from('digital_cards')
          .select(`
            id, 
            title, 
            vanity_url, 
            content_json, 
            owner_user_id,
            profiles:owner_user_id (
              display_name,
              avatar_url,
              job_title
            )
          `)
          .eq('vanity_url', testUsername)
          .single();

        if (card) {
          const content = card.content_json as any;
          const profile = Array.isArray(card.profiles) ? card.profiles[0] : card.profiles;

          const simulatedResponse = {
            id: card.id,
            vanity_url: card.vanity_url,
            title: card.title,
            owner: {
              name: profile?.display_name || content.fullName,
              avatar_url: profile?.avatar_url || content.avatarUrl,
              job_title: profile?.job_title || content.jobTitle
            },
            card_data: {
              ...content,
              fullName: content.fullName || profile?.display_name,
              jobTitle: content.jobTitle || profile?.job_title,
              avatarUrl: content.avatarUrl || profile?.avatar_url
            },
            _note: "This is a simulated response from the database because the Edge Function is currently unreachable."
          };

          setApiResponse(JSON.stringify(simulatedResponse, null, 2));
          toast.warning('Displayed simulated data (Edge Function unreachable)');
          return;
        }
      } catch (dbErr) {
        console.error('DB Fallback failed:', dbErr);
      }

      setApiResponse(JSON.stringify({
        error: 'Request Failed',
        message: err.message || 'Failed to fetch data',
        hint: 'Ensure the "get-card" Edge Function is deployed and active.'
      }, null, 2));
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
          <div className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer" onClick={() => navigate('/')}>
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
        <div className="p-4 border-t space-y-2">
          <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/docs')}>
            <BookOpen className="w-4 h-4" />
            User Guide
          </Button>
          <Button variant="ghost" className="w-full gap-2" onClick={() => navigate('/dashboard')}>
            <Layout className="w-4 h-4" />
            Dashboard
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
                <div className="flex items-center gap-2 mb-4 md:hidden">
                  <Button variant="ghost" size="icon" onClick={() => navigate('/docs')}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-bold">API Docs</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">Patra API Documentation</h1>
                <p className="text-xl text-muted-foreground">
                  Integrate powerful digital identity features into your applications.
                  Fetch public card data, profile details, and more.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-500" />
                      REST API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Simple, standard HTTP endpoints to fetch user data.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-500" />
                      Public Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Fetch any public profile without complex authentication flows.
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
                For public endpoints, you can use your project's Anon Key. For private data, you'll need a Service Role key (server-side only).
              </p>

              <Card>
                <CardHeader>
                  <CardTitle>Authorization Header</CardTitle>
                  <CardDescription>Pass your API key in the header of your requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm relative group">
                    <code>Authorization: Bearer [YOUR_ANON_KEY]</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy('Authorization: Bearer [YOUR_ANON_KEY]', 'auth-header')}
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

              <Tabs defaultValue="get-card" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="get-card">Get Card</TabsTrigger>
                </TabsList>

                <TabsContent value="get-card" className="mt-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">GET</Badge>
                    <code className="text-lg font-mono">/functions/v1/get-card</code>
                  </div>

                  <p className="text-muted-foreground">
                    Retrieve public details for a specific user card using their vanity URL (username) or ID.
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Query Parameters</h3>
                    <div className="grid grid-cols-[1fr_2fr] gap-4 text-sm border-b pb-2">
                      <div className="font-mono text-primary">vanity_url</div>
                      <div className="text-muted-foreground">The unique username of the card owner (e.g., 'abin').</div>
                    </div>
                    <div className="grid grid-cols-[1fr_2fr] gap-4 text-sm border-b pb-2">
                      <div className="font-mono text-primary">id</div>
                      <div className="text-muted-foreground">The UUID of the card (optional if vanity_url is provided).</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Response Schema</h3>
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm">
                      <pre>{`{
  "id": "uuid",
  "vanity_url": "string",
  "title": "string",
  "owner": {
    "name": "string",
    "avatar_url": "url",
    "job_title": "string"
  },
  "card_data": {
    "fullName": "string",
    "jobTitle": "string",
    "company": "string",
    "email": "string",
    "phone": "string",
    "socialLinks": [],
    ...
  }
}`}</pre>
                    </div>
                  </div>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Interactive Playground
                      </CardTitle>
                      <CardDescription>Enter a username to fetch their details live from our database.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Tabs defaultValue="username" className="w-full">
                        <TabsList className="w-full grid grid-cols-2">
                          <TabsTrigger value="username">By Username</TabsTrigger>
                          <TabsTrigger value="id">By Card ID</TabsTrigger>
                        </TabsList>

                        <TabsContent value="username" className="space-y-4 mt-4">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <Label htmlFor="username">Username (Vanity URL)</Label>
                              <Input
                                id="username"
                                placeholder="e.g. abin"
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
                        </TabsContent>

                        <TabsContent value="id" className="space-y-4 mt-4">
                          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                            <p>Fetch a card using its unique UUID. Useful for internal tools.</p>
                            <div className="mt-2 flex gap-2">
                              <Input placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" disabled />
                              <Button disabled variant="secondary">Coming Soon</Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

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
                        {`<iframe src="https://patra.app/embed/${embedUsername || 'USERNAME'}" 
  width="400" 
  height="250" 
  frameborder="0" 
  scrolling="no" 
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>`}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(
                          `<iframe src="https://patra.app/embed/${embedUsername || 'USERNAME'}" width="400" height="250" frameborder="0" scrolling="no" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`,
                          'embed-code'
                        )}
                      >
                        {copiedId === 'embed-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SDKs */}
          {/* SDKs */}
          {activeSection === 'sdks' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold">Patra Web SDK</h2>
              <p className="text-muted-foreground">
                Easily embed digital cards into any website using our Web Component SDK.
              </p>

              <div className="space-y-4">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>Quick Start</CardTitle>
                    <CardDescription>Add the SDK script to your HTML page.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>1. Include the Script</Label>
                      <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm relative group">
                        <pre className="whitespace-pre-wrap break-all">
                          {`<script type="module" src="https://patra.app/patra-sdk.js"></script>`}
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(`<script type="module" src="https://patra.app/patra-sdk.js"></script>`, 'sdk-script')}
                        >
                          {copiedId === 'sdk-script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>2. Add the Component</Label>
                      <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm relative group">
                        <pre className="whitespace-pre-wrap break-all">
                          {`<patra-card username="${testUsername || 'username'}" width="400" height="250"></patra-card>`}
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(`<patra-card username="${testUsername || 'username'}" width="400" height="250"></patra-card>`, 'sdk-component')}
                        >
                          {copiedId === 'sdk-component' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Attributes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <code className="bg-muted px-1 rounded">username</code>
                          <span className="text-muted-foreground">Required. Vanity URL or ID.</span>
                        </li>
                        <li className="flex justify-between">
                          <code className="bg-muted px-1 rounded">width</code>
                          <span className="text-muted-foreground">Optional. Default: 400.</span>
                        </li>
                        <li className="flex justify-between">
                          <code className="bg-muted px-1 rounded">height</code>
                          <span className="text-muted-foreground">Optional. Default: 250.</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>JavaScript API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        You can also render cards programmatically:
                      </p>
                      <code className="block bg-muted p-2 rounded text-xs font-mono">
                        Patra.renderCard('username', 'container-id');
                      </code>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
