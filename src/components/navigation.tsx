import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HeroButton } from '@/components/ui/hero-button';
import { Menu, X, CreditCard, ArrowLeft, Home } from 'lucide-react';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isLandingPage = location.pathname === '/';

  const handleBackClick = () => {
    if (user) {
      // Check if there's history to go back
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/editor');
      }
    } else {
      navigate('/auth');
    }
  };

  const handleLogoClick = () => {
    if (user) {
      navigate('/editor');
    } else {
      navigate('/');
    }
  };

  return <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
      <div className="container mx-auto px-4 bg-slate-50">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left aligned on landing, back button on other pages */}
          {isLandingPage ? (
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">Patra</span>
            </div>
          ) : (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {/* Center Logo (only on non-landing pages) */}
          {!isLandingPage && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">Patra</span>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/yourself-ai" className="text-foreground-muted hover:text-foreground transition-colors">
              Yourself AI
            </Link>
            <a href="#features" className="text-foreground-muted hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#templates" className="text-foreground-muted hover:text-foreground transition-colors">
              Templates
            </a>
            <a href="#pricing" className="text-foreground-muted hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-foreground-muted hover:text-foreground transition-colors">
              About
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <HeroButton variant="ghost" size="sm" onClick={() => window.location.href = '/auth'}>
              Sign In
            </HeroButton>
            <HeroButton variant="primary" size="sm" onClick={() => window.location.href = '/auth'}>
              Get Started
            </HeroButton>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-foreground-muted hover:text-foreground transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <div className="md:hidden py-4 border-t border-glass-border">
            <div className="flex flex-col space-y-4">
              <Link to="/yourself-ai" className="text-foreground-muted hover:text-foreground transition-colors px-4 py-2">
                Yourself AI
              </Link>
              <a href="#features" className="text-foreground-muted hover:text-foreground transition-colors px-4 py-2">
                Features
              </a>
              <a href="#templates" className="text-foreground-muted hover:text-foreground transition-colors px-4 py-2">
                Templates
              </a>
              <a href="#pricing" className="text-foreground-muted hover:text-foreground transition-colors px-4 py-2">
                Pricing
              </a>
              <a href="#about" className="text-foreground-muted hover:text-foreground transition-colors px-4 py-2">
                About
              </a>
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-glass-border">
                <HeroButton variant="ghost" size="sm" className="justify-start" onClick={() => window.location.href = '/auth'}>
                  Sign In
                </HeroButton>
                <HeroButton variant="primary" size="sm" onClick={() => window.location.href = '/auth'}>
                  Get Started
                </HeroButton>
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};