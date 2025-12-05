import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  BookOpen,
  Zap,
  CreditCard,
  MapPin,
  BarChart3,
  Smartphone,
  Share2,
  Settings,
  Code,
  History,
  Menu,
  Globe,
  Shield,
  LayoutDashboard,
  Wifi
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Docs() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');
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

  const menuItems = [
    {
      title: "Getting Started",
      items: [
        { id: 'getting-started', label: 'Welcome to Patra', icon: BookOpen },
        { id: 'create-profile', label: 'Creating Your Profile', icon: UserPlus },
        { id: 'customization', label: 'Customization & Themes', icon: Palette },
      ]
    },
    {
      title: "Core Features",
      items: [
        { id: 'card-drop', label: 'Card Drop', icon: MapPin },
        { id: 'smart-sharing', label: 'Smart Sharing (NFC/QR)', icon: Wifi },
        { id: 'dashboard', label: 'Dashboard & Analytics', icon: LayoutDashboard },
      ]
    },
    {
      title: "Advanced",
      items: [
        { id: 'api-embeds', label: 'API & Embeds', icon: Code },
        { id: 'security', label: 'Privacy & Security', icon: Shield },
      ]
    },
    {
      title: "Updates",
      items: [
        { id: 'changelog', label: 'Changelog', icon: History },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="py-4">
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Documentation
        </h2>
        <p className="text-xs text-muted-foreground mt-1">User Guide & Resources</p>
      </div>
      <ScrollArea className="h-[calc(100vh-120px)] px-2">
        <div className="space-y-6">
          {menuItems.map((group, idx) => (
            <div key={idx} className="px-2">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 ${activeSection === item.id ? "bg-primary/10 text-primary hover:bg-primary/15" : ""}`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b p-4 flex items-center justify-between bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-bold">Documentation</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 border-r bg-muted/10 h-screen sticky top-0">
        <div className="p-4 border-b flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="Go Back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold">Back to App</span>
        </div>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-screen">
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          
          {/* Getting Started */}
          {activeSection === 'getting-started' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-4xl font-bold mb-4">Welcome to Patra</h1>
                <p className="text-xl text-muted-foreground">
                  The next-generation digital identity platform. Create, share, and manage your professional presence with style.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Quick Start
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ready to dive in? Create your first digital card in under 2 minutes.
                    </p>
                    <Button onClick={() => setActiveSection('create-profile')}>
                      Start Guide
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-blue-500" />
                      For Developers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Integrate Patra into your apps using our robust API.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/api-docs')}>
                      View API Docs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'create-profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold mb-4">Creating Your Profile</h1>
                <p className="text-lg text-muted-foreground">
                  Your profile is your digital handshake. Here's how to make it memorable.
                </p>
              </div>

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-3">1. The Basics</h2>
                  <p className="text-muted-foreground mb-4">
                    Navigate to the <strong>Editor</strong>. This is your command center. Start by uploading a high-quality profile picture—this is the first thing people see.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Name & Title:</strong> Use your professional name and current role.</li>
                    <li><strong>Bio:</strong> Keep it punchy. A short sentence about what you do is better than a paragraph.</li>
                    <li><strong>Location:</strong> Helps with local networking.</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">2. Contact Information</h2>
                  <p className="text-muted-foreground mb-4">
                    Add your email, phone number, and website. You can choose which details are public.
                  </p>
                  <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm">
                      <strong>Pro Tip:</strong> Use the "Save Contact" button on your profile to let others instantly save your details to their phone's address book (vCard).
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">3. Social Links</h2>
                  <p className="text-muted-foreground">
                    Connect your digital ecosystem. Add links to LinkedIn, Twitter, GitHub, Instagram, and more. We support over 20+ platforms with automatic icon detection.
                  </p>
                </section>
              </div>
            </div>
          )}

          {activeSection === 'customization' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold mb-4">Customization & Themes</h1>
                <p className="text-lg text-muted-foreground">
                  Make your card truly yours with our powerful design tools.
                </p>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Themes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Choose from our curated themes like <strong>Modern Dark</strong>, <strong>Vibrant</strong>, or <strong>Professional Minimalist</strong>. Themes automatically adjust fonts, colors, and layout spacing.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom CSS (Advanced)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      For total control, use the Custom CSS block in the Editor. You can target any element on your card.
                    </p>
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm">
                      <pre>{`.card-container {
  border: 2px solid gold;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}`}</pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Features */}
          {activeSection === 'card-drop' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-3xl font-bold">Card Drop</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Networking reimagined. Share your card with everyone nearby, instantly.
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">What is Card Drop?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Card Drop is a location-based feature that allows you to "drop" your digital card at your current physical location. Any other Patra user within a <strong>100-meter radius</strong> can discover your card in their "Nearby" tab.
                </p>
                <p className="text-muted-foreground">
                  It's perfect for conferences, meetups, and networking events where you want to make your presence known without physically handing out cards to everyone.
                </p>
              </section>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">1. Drop</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Go to Dashboard {'>'} Card Drop. Click "Drop Card" to broadcast your profile for 1 hour.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">2. Discover</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      See who else is around you. View their profiles and save connections instantly.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">3. Connect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Saved connections appear in your "Access Management" tab for later follow-up.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'smart-sharing' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold mb-4">Smart Sharing</h1>
                <p className="text-lg text-muted-foreground">
                  Multiple ways to share your identity.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">NFC (Near Field Communication)</h3>
                    <p className="text-muted-foreground mt-2">
                      Write your profile URL to any NFC tag or card. Then, simply tap your tag against a compatible smartphone to instantly open your profile. No app required for the receiver.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">QR Codes</h3>
                    <p className="text-muted-foreground mt-2">
                      Every profile comes with a unique QR code. You can download it from your Dashboard and print it on flyers, stickers, or physical business cards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold mb-4">Dashboard & Analytics</h1>
                <p className="text-lg text-muted-foreground">
                  Track your performance and manage your network.
                </p>
              </div>

              <div className="grid gap-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-3">Analytics</h2>
                  <p className="text-muted-foreground mb-4">
                    Gain insights into how your card is performing.
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    <li className="bg-muted/50 p-4 rounded-lg">
                      <span className="font-semibold block mb-1">Total Views</span>
                      <span className="text-sm text-muted-foreground">How many times your profile has been opened.</span>
                    </li>
                    <li className="bg-muted/50 p-4 rounded-lg">
                      <span className="font-semibold block mb-1">Unique Visitors</span>
                      <span className="text-sm text-muted-foreground">The number of distinct people viewing your card.</span>
                    </li>
                    <li className="bg-muted/50 p-4 rounded-lg">
                      <span className="font-semibold block mb-1">Click-Through Rate</span>
                      <span className="text-sm text-muted-foreground">Percentage of visitors who clicked on your links.</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">My Connections</h2>
                  <p className="text-muted-foreground">
                    The <strong>Access Management</strong> tab acts as your digital rolodex. When you save someone's card (or they save yours via Card Drop), they appear here. You can export this list or view their details anytime.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* Advanced */}
          {activeSection === 'api-embeds' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold mb-4">API & Embeds</h1>
                <p className="text-lg text-muted-foreground">
                  Extend Patra's functionality to your own websites.
                </p>
              </div>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Embedding Your Card</h2>
                <p className="text-muted-foreground mb-4">
                  You can embed a mini-version of your card on your personal website or portfolio.
                </p>
                <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`<iframe src="https://patra.app/yourname?card&embed=true" width="400" height="250"></iframe>`}</pre>
                </div>
                <Button variant="link" className="px-0 mt-2" onClick={() => navigate('/api-docs')}>
                  Go to Embed Generator <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                </Button>
              </section>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold mb-4">Privacy & Security</h1>
                <p className="text-lg text-muted-foreground">
                  Your data is yours. We prioritize your privacy.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Public vs. Private:</strong> By default, your card is public so it can be shared. However, you can toggle specific sections (like phone number or address) to be hidden or password-protected in future updates.
                </p>
                <p className="text-muted-foreground">
                  <strong>Data Encryption:</strong> All data is encrypted at rest and in transit using industry-standard protocols.
                </p>
              </div>
            </div>
          )}

          {/* Changelog */}
          {activeSection === 'changelog' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold mb-4">Changelog</h1>
                <p className="text-lg text-muted-foreground">
                  Latest updates, improvements, and fixes.
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  {loadingChangelog ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
                    </div>
                  ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown>{changelog}</ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Helper icons
function UserPlus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="25" y2="8" />
      <line x1="22" y1="5" x2="22" y2="11" />
    </svg>
  )
}

function Palette(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )
}