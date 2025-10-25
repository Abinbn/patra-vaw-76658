import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  ArrowLeft, 
  Menu,
  BookOpen,
  Rocket,
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
  FileText
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  subsections?: { id: string; title: string }[];
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Rocket className="w-4 h-4" />,
    subsections: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quick-start', title: 'Quick Start' },
      { id: 'why-patra', title: 'Why Patra?' }
    ]
  },
  {
    id: 'profile-sections',
    title: 'Profile Sections',
    icon: <BookOpen className="w-4 h-4" />,
    subsections: [
      { id: 'avatar', title: 'Avatar & Profile Photo' },
      { id: 'username', title: 'Username & URL' },
      { id: 'bio', title: 'Bio & About' },
      { id: 'contact', title: 'Contact Information' }
    ]
  },
  {
    id: 'features',
    title: 'Features',
    icon: <FileText className="w-4 h-4" />,
    subsections: [
      { id: 'social-links', title: 'Social Links' },
      { id: 'custom-links', title: 'Custom Links' },
      { id: 'achievements', title: 'Achievements' },
      { id: 'testimonials', title: 'Testimonials' },
      { id: 'gallery', title: 'Photo Gallery' },
      { id: 'languages', title: 'Languages' },
      { id: 'location', title: 'Location & Map' }
    ]
  },
  {
    id: 'customization',
    title: 'Customization',
    icon: <Palette className="w-4 h-4" />,
    subsections: [
      { id: 'templates', title: 'Using Templates' },
      { id: 'custom-css', title: 'Custom CSS' },
      { id: 'banner', title: 'Banner Customization' }
    ]
  }
];

interface DocsLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({ 
  children, 
  activeSection,
  onSectionChange 
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Documentation</h2>
        <div className="space-y-1">
          {docSections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => {
                  onSectionChange?.(section.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {section.icon}
                {section.title}
              </button>
              {section.subsections && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.subsections.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        onSectionChange?.(sub.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-1.5 text-xs rounded-lg transition-colors ${
                        activeSection === sub.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {sub.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu - Left side */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <ScrollArea className="h-full">
                  <SidebarContent />
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Patra Documentation</h1>
              <p className="text-sm text-muted-foreground">Complete guide to using Patra</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <SidebarContent />
              </ScrollArea>
            </div>
          </aside>

          {/* Main Content - Centered */}
          <main className="flex-1 max-w-4xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
