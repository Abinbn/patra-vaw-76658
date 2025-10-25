import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Shield,
  LayoutDashboard,
  Megaphone,
  Palette,
  Users,
  MessageSquare,
  FileText,
  Key,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'feedback', label: 'Feedback & Support', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'docs', label: 'Documentation', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Key },
  ];

  return (
    <>
      {/* Hamburger Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "min-h-screen bg-card border-r border-border sticky top-0 transition-all duration-300 z-40",
          isMobile ? (
            isExpanded ? "fixed left-0 w-64" : "fixed left-0 w-16"
          ) : (
            isExpanded ? "w-64" : "w-16"
          )
        )}
      >
        {/* Desktop Toggle */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-6 z-50 bg-card border border-border rounded-full shadow-md"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        )}

        <div className="p-4">
          <div className={cn("flex items-center gap-2 mb-8", !isExpanded && "justify-center")}>
            <Shield className="w-8 h-8 text-primary flex-shrink-0" />
            {isExpanded && (
              <div>
                <h2 className="font-bold text-xl">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">System Management</p>
              </div>
            )}
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    if (isMobile) setIsExpanded(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg text-left transition-all',
                    isExpanded ? 'px-4 py-3' : 'px-2 py-3 justify-center',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {isExpanded && (
            <div className="mt-8 pt-8 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit Admin
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
