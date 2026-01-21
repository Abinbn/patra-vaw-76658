import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/navigation';
import { useNavigate } from 'react-router-dom';
import { HeroButton } from '@/components/ui/hero-button';
import { MorphText } from '@/components/MorphText';
import { Sparkles, Zap, Share2, Smartphone, Users, BarChart3, Shield, Palette, QrCode, Globe, CreditCard, Layers, ArrowRight, Play, ChevronRight, Star, Award, Check, Eye, MousePointer2, Wifi, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [scrollY, setScrollY] = useState(0);
  const [activeCard, setActiveCard] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const cardDesigns = [
    {
      type: 'gradient',
      classes: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600',
      accentColor: 'violet'
    },
    {
      type: 'glassmorphism',
      classes: 'bg-slate-900/90 backdrop-blur-xl border-2 border-white/10',
      accentColor: 'emerald'
    },
    {
      type: 'pattern',
      classes: 'bg-white border-2 border-slate-200',
      accentColor: 'orange'
    }
  ];
  const testimonials = [{
    name: "Sarah Chen",
    role: "CEO, TechStart",
    quote: "Revolutionized our networking",
    rating: 5
  }, {
    name: "Marcus Webb",
    role: "Designer",
    quote: "Beautiful and functional",
    rating: 5
  }, {
    name: "Lisa Park",
    role: "Sales Director",
    quote: "Closed 3x more deals",
    rating: 5
  }];
  const stats = [{
    number: "10K+",
    label: "Cards Created",
    icon: CreditCard
  }, {
    number: "500+",
    label: "Companies",
    icon: Users
  }, {
    number: "98%",
    label: "Satisfaction",
    icon: Star
  }, {
    number: "2M+",
    label: "Profile Views",
    icon: Eye
  }];
  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
      }}></div>

      <div className="fixed top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{
        animationDelay: '1s'
      }}></div>

      <Navigation />

      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-16 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-lg animate-fade-in">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-700">Trusted by 500+ companies worldwide</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight animate-slide-up">
                <span className="text-slate-900">
                  Your <MorphText
                    words={['Visiting', 'Business', 'ID', 'Personal']}
                    baseText=""
                    className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  /> Card
                </span>
                <br />
                <span className="text-slate-900">
                  for the modern age
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{
                animationDelay: '0.1s'
              }}>
                Create stunning digital business cards in minutes. Share with a tap, track engagement, and leave a lasting impression.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{
                animationDelay: '0.2s'
              }}>
                <button className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden" onClick={() => window.location.href = '/auth'}>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Create Your Card
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button onClick={() => setIsVideoPlaying(true)} className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="relative max-w-md mx-auto">
              <div className="absolute -top-8 -left-6 sm:-left-8 animate-float">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg shadow-xl flex items-center justify-center border border-slate-200">
                  <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" />
                </div>
              </div>
              <div className="absolute -top-6 -right-4 sm:-right-6 animate-float" style={{
                animationDelay: '1s'
              }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg shadow-xl flex items-center justify-center border border-slate-200">
                  <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
              <div className="absolute -bottom-6 left-1/4 animate-float" style={{
                animationDelay: '2s'
              }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg shadow-xl flex items-center justify-center border border-slate-200">
                  <Share2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </div>

              <div className="relative perspective-1000">
                <div className="relative w-full max-w-md mx-auto transition-transform duration-500" style={{
                  transform: `rotateY(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) * 0.005}deg) rotateX(${-(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) * 0.005}deg)`
                }}>
                  {/* Shadows */}
                  <div className="absolute inset-0 bg-slate-300/30 rounded-2xl blur-sm transform translate-y-2 translate-x-1"></div>
                  <div className="absolute inset-0 bg-slate-200/30 rounded-2xl blur-sm transform translate-y-1 translate-x-0.5"></div>

                  {/* Card Container - All cards absolutely positioned */}
                  <div className="relative w-full aspect-[1.586/1]">
                    {/* Card Design 1: Gradient Modern */}
                    <div className={`absolute inset-0 ${cardDesigns[0].classes} rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden transform transition-all duration-500 ${activeCard === 0 ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'}`}>
                      {/* Noise Texture */}
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
                      }}></div>

                      {/* Header */}
                      <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-sm sm:text-base font-bold tracking-wide">Patra</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-white rotate-90" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-lg sm:text-2xl font-bold text-white shadow-xl flex-shrink-0">
                          JD
                        </div>

                        <div className="flex-1 text-white space-y-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold truncate">John Doe</h3>
                          <p className="text-xs sm:text-sm text-white/90 truncate">Product Designer</p>
                          <p className="text-xs text-white/70 mb-1 sm:mb-2 truncate">Patra Inc.</p>

                          <div className="grid grid-cols-2 gap-1.5 text-xs pt-1">
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-0">
                              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Globe className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-white/90 truncate">john@patra.com</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-0">
                              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Smartphone className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-white/90 truncate">+1 (555) 123-4567</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
                    </div>

                    {/* Card Design 2: Glassmorphism Dark */}
                    <div className={`absolute inset-0 ${cardDesigns[1].classes} rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden transform transition-all duration-500 ${activeCard === 1 ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'}`}>
                      {/* Animated Background Mesh */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-teal-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>

                      {/* Header */}
                      <div className="relative flex justify-between items-start mb-4 sm:mb-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-sm sm:text-base font-bold tracking-wide">Patra</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30">
                          <span className="text-emerald-300 text-xs font-semibold">PRO</span>
                        </div>
                      </div>

                      {/* Content - Different Layout */}
                      <div className="relative space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-lg sm:text-2xl font-bold text-white shadow-2xl border-2 border-white/20 flex-shrink-0">
                            JD
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-white truncate">John Doe</h3>
                            <p className="text-xs sm:text-sm text-emerald-300 truncate">Product Designer</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-2.5 py-2 border border-white/10 hover:bg-white/10 transition-colors min-w-0">
                            <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              <Globe className="w-3 h-3 text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white/50 text-[10px]">Email</p>
                              <p className="text-white text-xs truncate">john@patra.com</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-2.5 py-2 border border-white/10 hover:bg-white/10 transition-colors min-w-0">
                            <div className="w-6 h-6 rounded-md bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                              <Smartphone className="w-3 h-3 text-teal-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white/50 text-[10px]">Phone</p>
                              <p className="text-white text-xs truncate">+1 (555) 123-4567</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Design 3: Pattern Minimal */}
                    <div className={`absolute inset-0 ${cardDesigns[2].classes} rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden transform transition-all duration-500 ${activeCard === 2 ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'}`}>
                      {/* Decorative Pattern */}
                      <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: `
                        linear-gradient(45deg, #f97316 25%, transparent 25%),
                        linear-gradient(-45deg, #f97316 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #f97316 75%),
                        linear-gradient(-45deg, transparent 75%, #f97316 75%)
                      `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}></div>

                      {/* Accent Corner */}
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-500 opacity-10 rounded-bl-full"></div>
                      </div>

                      {/* Header */}
                      <div className="relative flex justify-between items-start mb-4 sm:mb-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900 text-sm sm:text-base font-bold tracking-wide">Patra</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                        </div>
                      </div>

                      {/* Content - Bento Style Layout */}
                      <div className="relative grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-base sm:text-xl font-bold text-white shadow-lg flex-shrink-0">
                              JD
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">John Doe</h3>
                              <p className="text-xs sm:text-sm text-slate-600 truncate">Product Designer</p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-0">
                              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center flex-shrink-0">
                                <Globe className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-slate-700 text-xs truncate">john@patra.com</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-0">
                              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                                <Smartphone className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-slate-700 text-xs truncate">+1 (555) 123-4567</span>
                            </div>
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-col justify-center items-center gap-2">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200 border-dashed">
                            <QrCode className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
                          </div>
                          <p className="text-[10px] text-slate-500 text-center">Scan to connect</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-8">
                {[0, 1, 2].map(index => <button key={index} onClick={() => setActiveCard(index)} className={`h-2 rounded-full transition-all duration-300 ${activeCard === index ? 'w-8 bg-slate-900' : 'w-2 bg-slate-300'}`} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => <div key={stat.label} className="text-center group cursor-pointer" style={{
              animationDelay: `${index * 0.1}s`
            }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-8 h-8 text-violet-600" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>)}
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-gradient-to-b from-[#fafafa] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Everything you need,
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                beautifully designed
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From creation to analytics, every feature is crafted to perfection
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-violet-300 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Drag & Drop Editor</h3>
                <p className="text-slate-600 leading-relaxed">
                  Intuitive WYSIWYG editor with AI-powered layout suggestions. Design your perfect card in minutes.
                </p>
                <div className="mt-6 flex items-center text-violet-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Explore</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Instant Sharing</h3>
                <p className="text-slate-600 leading-relaxed">
                  Share via QR codes, NFC taps, or custom URLs. Update your details instantly across all platforms.
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Advanced Analytics</h3>
                <p className="text-slate-600 leading-relaxed">
                  Track views, clicks, and engagement. Understand your networking impact with detailed insights.
                </p>
                <div className="mt-6 flex items-center text-emerald-600 font-semibold group-hover:gap-2 transition-all">
                  <span>See analytics</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div
              className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-amber-300 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => navigate('/pricing')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">NFC Integration</h3>
                <p className="text-slate-600 leading-relaxed">
                  Premium cards with built-in NFC chips. Share your details with a single tap on any smartphone.
                </p>
                <div className="mt-6 flex items-center text-amber-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Order cards</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div
              className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-rose-300 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => navigate('/onboarding')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Team Management</h3>
                <p className="text-slate-600 leading-relaxed">
                  Company profiles, bulk creation from CSV, approval workflows, and team collaboration tools.
                </p>
                <div className="mt-6 flex items-center text-rose-600 font-semibold group-hover:gap-2 transition-all">
                  <span>For teams</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div
              className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => navigate('/editor?new=true')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Premium Templates</h3>
                <p className="text-slate-600 leading-relaxed">
                  Curated marketplace of professional templates. CRM integrations with Salesforce and HubSpot.
                </p>
                <div className="mt-6 flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Browse templates</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-slate-900 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Loved by professionals
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                around the world
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => <div key={testimonial.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105" style={{
              animationDelay: `${index * 0.1}s`
            }}>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div>
                <div className="font-semibold text-white">{testimonial.name}</div>
                <div className="text-white/60 text-sm">{testimonial.role}</div>
              </div>
            </div>)}
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-gradient-to-b from-white to-violet-50 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-8">
              <Award className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-900">Start Free - No Credit Card Required</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Ready to make your
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                first impression count?
              </span>
            </h2>

            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
              Join thousands of professionals who've already transformed their networking game with <span className="text-violet-400">P</span>atra.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group relative px-10 py-5 bg-slate-900 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create Your Card Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button className="flex items-center gap-2 px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <MousePointer2 className="w-5 h-5" />
                Explore Examples
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-32 h-32 bg-violet-200/30 rounded-full blur-2xl animate-float pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl animate-float pointer-events-none" style={{
          animationDelay: '2s'
        }}></div>
      </section>

      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 max-w-6xl mx-auto">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-violet-400">P</span>atra
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                The most sophisticated platform for creating and managing digital business cards.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 <span className="text-violet-400">P</span>atra. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <Dialog open={isVideoPlaying} onOpenChange={setIsVideoPlaying}>
        <DialogContent className="max-w-4xl p-0 bg-slate-900">
          <div className="relative w-full aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Patra Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};