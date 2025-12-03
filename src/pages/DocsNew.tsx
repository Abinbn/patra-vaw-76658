import React, { useState, useEffect, useRef } from 'react';
import { DocsLayout } from '@/components/DocsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import {
  TreePine,
  Leaf,
  Globe,
  Heart,
  Smartphone,
  Zap,
  Shield,
  Users,
  Image,
  User,
  Link,
  Award,
  MessageSquare,
  Camera,
  Languages,
  MapPin,
  Palette,
  Code,
  Rocket,
  CheckCircle2
} from 'lucide-react';
import { parseMarkdown } from '@/lib/markdown';

// Default static sections
const defaultSections = [
  'introduction',
  'quick-start',
  'dashboard',
  'analytics',
  'editor',
  'settings',
  'public-profile',
  'api',
  'why-patra',
  'avatar',
  'username',
  'templates',
  'custom-css',
  'banner'
];

export const DocsNew: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [customDocs, setCustomDocs] = useState<any[]>([]);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    loadCustomDocs();
  }, []);

  useEffect(() => {
    // Set up intersection observer for infinite scroll
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-100px 0px -60% 0px'
      }
    );

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [customDocs]);

  const loadCustomDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('documentation_pages')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setCustomDocs(data);
    } catch (error) {
      console.error('Error loading documentation:', error);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderDefaultContent = (sectionId: string) => {
    switch (sectionId) {
      case 'introduction':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Welcome to Patra</h1>
              <p className="text-lg text-muted-foreground">
                The modern, eco-friendly way to share your professional identity
              </p>
            </div>

            <Card className="border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center mb-4">
                  <div>
                    <Leaf className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">500+</div>
                    <div className="text-sm text-muted-foreground">Trees saved per 10,000 users</div>
                  </div>
                  <div>
                    <TreePine className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">85%</div>
                    <div className="text-sm text-muted-foreground">Less carbon footprint</div>
                  </div>
                  <div>
                    <Globe className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">100%</div>
                    <div className="text-sm text-muted-foreground">Digital = Zero waste</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every digital card you create helps protect our planet by eliminating paper waste and reducing carbon emissions.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'quick-start':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Quick Start Guide</h1>
              <p className="text-lg text-muted-foreground">
                Get your digital card up and running in minutes
              </p>
            </div>

            <div className="space-y-4">
              {[
                { step: 1, title: 'Create Your Account', description: 'Sign up with your email or Google account', icon: User },
                { step: 2, title: 'Add Your Information', description: 'Fill in your name, job title, and contact details', icon: Smartphone },
                { step: 3, title: 'Customize Your Design', description: 'Choose a template and personalize your card', icon: Palette },
                { step: 4, title: 'Share Your Card', description: 'Get your unique URL and QR code to share', icon: Link }
              ].map((item) => (
                <Card key={item.step}>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        <item.icon className="w-5 h-5" />
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Your central command center for managing your digital presence
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Dashboard (<code>/dashboard</code>) is your home base in Patra. It provides a comprehensive overview of your digital card's performance and quick access to key features.
                </p>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-3">Key Features</h4>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <BarChart3 className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Quick Stats</div>
                        <div className="text-sm text-muted-foreground">View total views, unique visitors, and engagement metrics at a glance</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Card Gallery</div>
                        <div className="text-sm text-muted-foreground">Browse and manage all your digital cards in one place</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Rocket className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Quick Actions</div>
                        <div className="text-sm text-muted-foreground">Create new cards, access editor, view analytics, and more</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Analytics</h1>
              <p className="text-lg text-muted-foreground">
                Track your performance and understand your audience
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Analytics page (<code>/analytics</code>) offers deep insights into how your card is performing. Make data-driven decisions to optimize your digital presence.
                </p>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-3">Metrics Available</h4>
                  <div className="grid gap-2">
                    <div className="flex items-start gap-2 p-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>Total Views:</strong> <span className="text-muted-foreground">Track how many times your profile has been viewed</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>Unique Visitors:</strong> <span className="text-muted-foreground">Number of distinct people who visited your profile</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>Click-through Rate:</strong> <span className="text-muted-foreground">Percentage of visitors who clicked on your links</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>Device Breakdown:</strong> <span className="text-muted-foreground">See if your visitors are using Mobile or Desktop</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>Geographic Data:</strong> <span className="text-muted-foreground">Understand where your audience is located</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <strong>Time-based Trends:</strong> <span className="text-muted-foreground">View performance over time with interactive charts</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>💡 Pro Tip:</strong> Check your analytics regularly to understand peak engagement times and optimize when you share your card.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'editor':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Profile Editor</h1>
              <p className="text-lg text-muted-foreground">
                Customize every aspect of your digital card
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  The Editor (<code>/editor</code>) is where you build your profile. Each section has its own direct URL for quick access:
                </p>
                <div className="grid gap-3">
                  {[
                    { label: 'Avatar', url: '/editor?tab=avatar', desc: 'Upload your profile picture' },
                    { label: 'About', url: '/editor?tab=about', desc: 'Add your bio and personal details' },
                    { label: 'Location', url: '/editor?tab=location', desc: 'Set your physical location' },
                    { label: 'Social Accounts', url: '/editor?tab=verified', desc: 'Connect your social media profiles' },
                    { label: 'Wallet', url: '/editor?tab=wallet', desc: 'Add payment links and UPI' },
                    { label: 'Links', url: '/editor?tab=links', desc: 'Add custom links and groups' },
                    { label: 'Interests', url: '/editor?tab=interests', desc: 'Share your hobbies and interests' },
                    { label: 'Achievements', url: '/editor?tab=achievements', desc: 'Showcase your awards and certifications' },
                    { label: 'Testimonials', url: '/editor?tab=testimonials', desc: 'Display reviews and recommendations' },
                    { label: 'Gallery', url: '/editor?tab=gallery', desc: 'Upload photos to your gallery' },
                    { label: 'Design', url: '/editor?tab=design', desc: 'Choose themes and colors' },
                    { label: 'Card Layout', url: '/editor?tab=cardlayout', desc: 'Reorder or hide sections' },
                    { label: 'AI Profile', url: '/editor?tab=aiprofile', desc: 'Configure your AI assistant' }
                  ].map((tab) => (
                    <div key={tab.label} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-semibold">{tab.label}</div>
                        <div className="text-sm text-muted-foreground">{tab.desc}</div>
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{tab.url}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Settings</h1>
              <p className="text-lg text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Access your account settings at <code>/settings</code>. Here you can:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Update your email and password</li>
                  <li>Manage your subscription</li>
                  <li>Configure notification preferences</li>
                  <li>View billing history</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case 'public-profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Public Profile</h1>
              <p className="text-lg text-muted-foreground">
                Your digital identity shared with the world
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Profile View</h3>
                    <code className="block bg-muted p-3 rounded-lg mb-2">/:username</code>
                    <p className="text-sm text-muted-foreground">
                      This is your main profile page (e.g., <code>patra.me/john</code>). It displays your full profile, including all sections like About, Links, Gallery, and more.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Card View</h3>
                    <code className="block bg-muted p-3 rounded-lg mb-2">/:username?card</code>
                    <p className="text-sm text-muted-foreground">
                      A simplified, 3D-style digital card view. This is perfect for quick sharing and serves as the visual representation of your physical card.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
              <p className="text-lg text-muted-foreground">
                Build with Patra
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-6">
                  Developers can integrate with Patra using our comprehensive API. Access profile data, generate cards programmatically, and more.
                </p>
                <a
                  href="/api-docs"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  View API Documentation
                  <Globe className="ml-2 h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          </div>
        );

      case 'why-patra':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Why Choose Patra?</h1>
              <p className="text-lg text-muted-foreground">
                The modern alternative to traditional business cards
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { icon: Smartphone, title: 'Always Accessible', description: 'Your card is available 24/7, anywhere in the world' },
                { icon: Zap, title: 'Instant Updates', description: 'Update once and everyone sees the latest information' },
                { icon: Shield, title: 'Privacy Control', description: 'Full control over what information you share' },
                { icon: Users, title: 'Professional Networking', description: 'Integrate all your links and portfolios in one place' },
                { icon: Globe, title: 'Eco-Friendly', description: 'Go paperless and reduce your carbon footprint' }
              ].map((benefit) => (
                <Card key={benefit.title}>
                  <CardContent className="flex items-start gap-3 pt-6">
                    <benefit.icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'avatar':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Avatar & Profile Photo</h1>
              <p className="text-lg text-muted-foreground">
                Make a great first impression with your profile photo
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Image Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Recommended
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Square format (1:1 ratio)</li>
                      <li>• Minimum 400x400 pixels</li>
                      <li>• JPEG or PNG format</li>
                      <li>• File size under 2MB</li>
                      <li>• Clear, well-lit photo</li>
                      <li>• Professional appearance</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Tips for Best Results</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Use a solid background</li>
                      <li>• Face should be clearly visible</li>
                      <li>• Good lighting is essential</li>
                      <li>• Avoid busy patterns</li>
                      <li>• Smile and look approachable</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'username':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Username & Custom URL</h1>
              <p className="text-lg text-muted-foreground">
                Create your unique digital identity
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Username Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Username Rules</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• 3-30 characters long</li>
                    <li>• Only letters, numbers, hyphens, and underscores</li>
                    <li>• Must start with a letter or number</li>
                    <li>• Case insensitive (stored as lowercase)</li>
                    <li>• Cannot contain spaces or special characters</li>
                    <li>• Reserved words and inappropriate terms are blocked</li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Your Custom URL</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Once you choose a username, your card will be accessible at:
                  </p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    https://patra.app/<span className="text-primary">your-username</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Using Templates</h1>
              <p className="text-lg text-muted-foreground">
                Beautiful designs ready to use
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { name: 'Classic', description: 'Traditional professional design with clean layout', free: true },
                    { name: 'Modern', description: 'Bold gradients and glass morphism effects', free: true },
                    { name: 'Minimal', description: 'Ultra-clean with focus on content', free: true },
                    { name: 'Bento Grid', description: 'Modern grid layout for profiles', premium: true },
                    { name: 'Magazine', description: 'Editorial-style two-column layout', premium: true },
                    { name: 'Creative', description: 'Experimental with animated patterns', premium: true }
                  ].map((template) => (
                    <div key={template.name} className="flex items-start justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {template.name}
                          {template.premium && <Badge variant="secondary">Premium</Badge>}
                        </h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">How to Apply</h4>
                  <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                    <li>Go to Templates from your dashboard</li>
                    <li>Browse Card or Profile templates</li>
                    <li>Click to select a template</li>
                    <li>Click "Apply Template" to save</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'custom-css':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Custom CSS</h1>
              <p className="text-lg text-muted-foreground">
                Advanced styling for developers
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>CSS Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">CSS Class Names</h4>
                  <div className="bg-muted p-4 rounded-lg font-mono text-xs space-y-1">
                    <div><span className="text-primary">.card-container</span> - Main wrapper</div>
                    <div><span className="text-primary">.card-header</span> - Header with avatar</div>
                    <div><span className="text-primary">.card-section</span> - Content sections</div>
                    <div><span className="text-primary">.bento-grid</span> - Grid layout</div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Theme Variables</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Always use HSL color variables:
                  </p>
                  <div className="bg-muted p-4 rounded-lg font-mono text-xs space-y-1">
                    <div>background: hsl(var(--background));</div>
                    <div>color: hsl(var(--foreground));</div>
                    <div>border: 1px solid hsl(var(--border));</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'banner':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">Banner Customization</h1>
              <p className="text-lg text-muted-foreground">
                Personalize your card header
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Banner Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { type: 'Gradient', description: 'Default smooth gradient background' },
                    { type: 'Solid Color', description: 'Pick from preset colors or use custom hex' },
                    { type: 'Image', description: 'Upload a custom banner image' },
                    { type: 'Blurred Profile', description: 'Use your profile photo as blurred background' },
                    { type: 'Pattern', description: 'Choose from dots, lines, waves, or grid patterns' }
                  ].map((option) => (
                    <div key={option.type} className="p-3 border rounded-lg">
                      <h4 className="font-semibold">{option.type}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>💡 Tip:</strong> For best results, use high-contrast colors that make your avatar and text stand out.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div>
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-lg text-muted-foreground">
              Select a topic from the sidebar to learn more
            </p>
          </div>
        );
    }
  };

  return (
    <DocsLayout activeSection={activeSection} onSectionChange={handleSectionChange}>
      <div className="space-y-24">
        {/* Render default sections with infinite scroll */}
        {defaultSections.map((sectionId) => (
          <section
            key={sectionId}
            ref={(el) => (sectionRefs.current[sectionId] = el)}
            data-section-id={sectionId}
            className="scroll-mt-24"
          >
            {renderDefaultContent(sectionId)}
          </section>
        ))}



        {/* Render custom documentation from database */}
        {customDocs.map((doc) => (
          <section
            key={doc.page_id}
            ref={(el) => (sectionRefs.current[doc.page_id] = el)}
            data-section-id={doc.page_id}
            className="scroll-mt-24"
          >
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{doc.title}</h1>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(doc.content) }}
                  />
                </CardContent>
              </Card>
            </div>
          </section>
        ))}
      </div>
    </DocsLayout>
  );
};
