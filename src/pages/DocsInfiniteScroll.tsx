import React, { useState, useEffect, useRef } from 'react';
import { DocsLayout } from '@/components/DocsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TreePine, 
  Leaf,
  Globe,
  Smartphone,
  Zap,
  Shield,
  Users,
  User,
  Palette,
  CheckCircle2
} from 'lucide-react';

const sections = [
  'introduction',
  'quick-start',
  'why-patra',
  'avatar',
  'username',
  'templates',
  'custom-css',
  'banner'
];

export const DocsInfiniteScroll: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
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
  }, []);

  const handleSectionChange = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <DocsLayout activeSection={activeSection} onSectionChange={handleSectionChange}>
      <div className="space-y-24">
        {/* Introduction */}
        <section
          ref={(el) => (sectionRefs.current['introduction'] = el)}
          data-section-id="introduction"
          className="scroll-mt-24"
        >
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
        </section>

        {/* Quick Start */}
        <section
          ref={(el) => (sectionRefs.current['quick-start'] = el)}
          data-section-id="quick-start"
          className="scroll-mt-24"
        >
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
        </section>

        {/* Why Patra */}
        <section
          ref={(el) => (sectionRefs.current['why-patra'] = el)}
          data-section-id="why-patra"
          className="scroll-mt-24"
        >
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
        </section>

        {/* Avatar */}
        <section
          ref={(el) => (sectionRefs.current['avatar'] = el)}
          data-section-id="avatar"
          className="scroll-mt-24"
        >
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
        </section>

        {/* Add remaining sections similarly */}
      </div>
    </DocsLayout>
  );
};
