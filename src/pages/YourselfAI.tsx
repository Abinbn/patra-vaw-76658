import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Share2, Zap } from 'lucide-react';

export const YourselfAI = () => {
  const navigate = useNavigate();
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const randomNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentNameIndex((prev) => {
          if (prev < randomNames.length - 1) {
            setIsVisible(true);
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 200);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 relative overflow-hidden">
      {/* Retro Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,transparent_calc(100%_-_1px),rgba(255,255,255,0.1)_100%),linear-gradient(90deg,transparent_0%,transparent_calc(100%_-_1px),rgba(255,255,255,0.1)_100%)] bg-[length:80px_80px] [perspective:500px] [transform-style:preserve-3d] after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-transparent after:to-purple-900/90" />
      
      {/* Retro Sun */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-yellow-300 via-orange-400 to-pink-500 blur-2xl opacity-40" />
      
      {/* Scan Lines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-cyan-400 rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-6 h-6 bg-pink-400 rounded-full animate-bounce" />
      <div className="absolute bottom-40 left-20 w-5 h-5 bg-yellow-400 rounded-full animate-ping" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black mb-8 text-white [text-shadow:_0_0_30px_rgb(255_255_255_/_50%),_0_0_60px_rgb(236_72_153_/_50%)]">
            Hi I'm{' '}
            <span className={`inline-block transition-all duration-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
              {currentNameIndex < randomNames.length ? randomNames[currentNameIndex] : 'YOU'}
            </span>
          </h1>

          <button
            onClick={() => navigate('/auth')}
            className="group relative inline-flex items-center gap-3 px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] [text-shadow:_0_2px_10px_rgb(0_0_0_/_50%)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Create the first yourself AI, the mini you <Sparkles className="w-6 h-6 animate-pulse" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Welcome Section */}
        <div className="text-center max-w-5xl mt-20 space-y-8">
          <h2 className="text-4xl md:text-6xl font-black text-white [text-shadow:_0_0_20px_rgb(255_255_255_/_40%),_0_0_40px_rgb(96_165_250_/_40%)]">
            Welcome to Patra
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-cyan-200 [text-shadow:_0_2px_10px_rgb(0_0_0_/_50%)]">
            Create the world's first only yourself AI and share it with people
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Brain className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Personality</h3>
            <p className="text-white/80">Train an AI that thinks and responds just like you</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Share2 className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Share Everywhere</h3>
            <p className="text-white/80">Share your AI persona with anyone, anywhere</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Instant Responses</h3>
            <p className="text-white/80">Your AI answers questions 24/7 instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
};
