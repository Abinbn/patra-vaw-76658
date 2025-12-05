import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Code, Zap, CreditCard, HelpCircle, History, Share2, Smartphone, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

export function Docs() {
  const navigate = useNavigate();
  const [changelog, setChangelog] = useState('');
  const [loadingChangelog, setLoadingChangelog] = useState(false);

  useEffect(() => {
    fetchChangelog();
  }, []);

  const fetchChangelog = async () => {
    setLoadingChangelog(true);
    try {
      const { data } = await supabase
        .from('documentation_pages')
        .select('content')
        .eq('slug', 'changelog')
        .maybeSingle();

      if (data) {
        setChangelog(data.content);
      } else {
        setChangelog('# No changelog found.\n\nCheck back later for updates!');
      }
    } catch (error) {
      console.error('Error fetching changelog:', error);
      setChangelog('Failed to load changelog.');
    } finally {
      setLoadingChangelog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Documentation</h1>
              <p className="text-sm text-muted-foreground">User Guide & Resources</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/api-docs')}>
              <Code className="w-4 h-4 mr-2" />
              API Docs
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">
        <Tabs defaultValue="getting-started" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="getting-started" className="gap-2">
              <Zap className="w-4 h-4" />
              Get Started
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-2">
              <History className="w-4 h-4" />
              Changelog
            </TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    1. Create Your Card
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Start by navigating to the <strong>Editor</strong>. Here you can fill in your personal details, job title, and contact information.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Add your profile picture and cover photo.</li>
                    <li>Choose a theme that fits your brand.</li>
                    <li>Add social links and custom URLs.</li>
                  </ul>
                  <Button variant="link" className="px-0 mt-2" onClick={() => navigate('/editor')}>
                    Go to Editor <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    2. Share Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Once your card is ready, share it with the world. You can share via:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li><strong>QR Code:</strong> Let others scan your code to view your profile.</li>
                    <li><strong>Link:</strong> Copy your unique vanity URL (patra.app/yourname).</li>
                    <li><strong>NFC:</strong> Write your link to an NFC tag for tap-to-share.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    3. Save Connections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    When you meet someone, scan their QR code to save their card to your <strong>Connections</strong>.
                  </p>
                  <p>
                    You can view all your saved contacts in the Dashboard under "My Connections".
                  </p>
                  <Button variant="link" className="px-0 mt-2" onClick={() => navigate('/dashboard/access')}>
                    View Connections <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
                <CardDescription>Everything you can do with Patra</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Settings className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Customization</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Full control over colors, fonts, and layout. Use Custom CSS for advanced styling.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Instant Updates</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Change your details anytime, and everyone with your link sees the update immediately.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Share2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Smart Sharing</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Share via QR, Email, SMS, or NFC. Compatible with all modern smartphones.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Code className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Developer API</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fetch card data programmatically to integrate with your own systems.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is Patra free to use?</AccordionTrigger>
                    <AccordionContent>
                      Yes, Patra offers a free tier that includes all essential features to create and share your digital business card.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I write to an NFC tag?</AccordionTrigger>
                    <AccordionContent>
                      You can use any NFC writing app on your phone (like "NFC Tools"). Simply copy your profile URL and write it as a URL/URI record to the tag.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Can I use my own domain?</AccordionTrigger>
                    <AccordionContent>
                      Custom domains are available on our Pro plan. Contact support for more details.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                    <AccordionContent>
                      You can delete your account from the Settings page. This action is irreversible.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Changelog</CardTitle>
                <CardDescription>Latest updates and improvements</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingChangelog ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{changelog}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}