export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'card' | 'profile';
  style: {
    layout: 'classic' | 'modern' | 'minimal' | 'bento' | 'magazine' | 'creative' | 'portrait';
    colorScheme?: string;
    cardStyle?: React.CSSProperties;
    headerStyle?: React.CSSProperties;
    sectionStyle?: React.CSSProperties;
    customCSS?: string;
    hasFrontBack?: boolean;
  };
  features: string[];
  isPremium?: boolean;
}

export const defaultCardTemplates: CardTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional professional design with clean layout',
    thumbnail: '/templates/classic.png',
    category: 'card',
    style: {
      layout: 'classic',
      customCSS: `
        .card-container { 
          background: linear-gradient(to bottom, hsl(var(--background)), hsl(var(--muted)));
        }
        .card-section {
          border-radius: 0.5rem;
          padding: 1.5rem;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          margin-bottom: 1rem;
        }
        .card-header {
          text-align: center;
          padding: 2rem;
        }
      `
    },
    features: ['Clean Layout', 'Professional', 'Easy to Read']
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold colors and gradients with modern aesthetics',
    thumbnail: '/templates/modern.png',
    category: 'card',
    style: {
      layout: 'modern',
      customCSS: `
        .card-container { 
          background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1));
        }
        .card-section {
          border-radius: 1rem;
          padding: 1.5rem;
          background: hsl(var(--card) / 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid hsl(var(--border) / 0.5);
          margin-bottom: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .card-header {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          color: white;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
        }
      `
    },
    features: ['Bold Gradients', 'Glass Morphism', 'Eye-catching']
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple with focus on content',
    thumbnail: '/templates/minimal.png',
    category: 'card',
    style: {
      layout: 'minimal',
      customCSS: `
        .card-container { 
          background: hsl(var(--background));
          max-width: 600px;
          margin: 0 auto;
        }
        .card-section {
          padding: 1rem 0;
          border-bottom: 1px solid hsl(var(--border) / 0.3);
          margin-bottom: 1rem;
        }
        .card-section:last-child {
          border-bottom: none;
        }
        .card-header {
          text-align: left;
          padding: 2rem 0;
          border-bottom: 2px solid hsl(var(--primary));
          margin-bottom: 2rem;
        }
      `
    },
    features: ['Ultra Clean', 'Content First', 'Lightweight']
  },
  {
    id: 'portrait',
    name: 'Portrait ID Card',
    description: 'Professional ID card style with front and back layout',
    thumbnail: '/templates/classic.png',
    category: 'card',
    style: {
      layout: 'portrait',
      hasFrontBack: true,
      customCSS: `
        .card-container { 
          background: hsl(var(--background));
          padding: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .portrait-card {
          width: 85.6mm;
          height: 53.98mm;
          background: hsl(var(--card));
          border-radius: 0.75rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
        }
        .portrait-card-front {
          padding: 1rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .portrait-card-back {
          padding: 1rem;
          height: 100%;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--accent) / 0.05));
        }
        .portrait-header {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: white;
          text-align: center;
        }
        .portrait-avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto;
          border: 3px solid hsl(var(--primary));
          border-radius: 0.5rem;
        }
        .portrait-info {
          font-size: 0.75rem;
          line-height: 1.3;
        }
        @media (max-width: 768px) {
          .portrait-card {
            width: 90vw;
            max-width: 350px;
            height: auto;
            aspect-ratio: 1.586;
          }
        }
      `
    },
    features: ['ID Card Style', 'Front & Back', 'Compact Design']
  },
  {
    id: 'bento',
    name: 'Bento Grid',
    description: 'Modern grid layout inspired by bento boxes',
    thumbnail: '/templates/bento.png',
    category: 'profile',
    style: {
      layout: 'bento',
      customCSS: `
        .card-container { 
          background: hsl(var(--background));
          padding: 2rem;
        }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          grid-auto-flow: dense;
        }
        .card-section {
          border-radius: 1rem;
          padding: 1.5rem;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          transition: all 0.3s ease;
        }
        .card-section:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.2);
        }
        .card-section.featured {
          grid-column: span 2;
          grid-row: span 2;
        }
        .card-header {
          grid-column: 1 / -1;
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1));
          border-radius: 1rem;
        }
      `
    },
    features: ['Grid Layout', 'Interactive', 'Modern Design'],
    isPremium: true
  }
];

export const defaultProfileTemplates: CardTemplate[] = [
  ...defaultCardTemplates,
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Editorial-style layout with visual hierarchy',
    thumbnail: '/templates/magazine.png',
    category: 'profile',
    style: {
      layout: 'magazine',
      customCSS: `
        .card-container { 
          background: hsl(var(--background));
          max-width: 1200px;
          margin: 0 auto;
        }
        .magazine-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          padding: 2rem;
        }
        .magazine-sidebar {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }
        .card-section {
          border-radius: 0.5rem;
          padding: 2rem;
          background: hsl(var(--card));
          border-left: 4px solid hsl(var(--primary));
          margin-bottom: 2rem;
        }
        .card-header {
          padding: 3rem;
          background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)));
          color: white;
          margin-bottom: 2rem;
        }
        @media (max-width: 768px) {
          .magazine-layout {
            grid-template-columns: 1fr;
          }
        }
      `
    },
    features: ['Editorial Style', 'Two Column', 'Sticky Sidebar'],
    isPremium: true
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Experimental layout with unique patterns',
    thumbnail: '/templates/creative.png',
    category: 'profile',
    style: {
      layout: 'creative',
      customCSS: `
        .card-container { 
          background: 
            radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, hsl(var(--accent) / 0.1) 0%, transparent 50%),
            hsl(var(--background));
          position: relative;
        }
        .card-section {
          border-radius: 2rem;
          padding: 2rem;
          background: hsl(var(--card) / 0.9);
          backdrop-filter: blur(20px);
          border: 2px solid hsl(var(--border) / 0.5);
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }
        .card-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.05), transparent);
          pointer-events: none;
        }
        .card-header {
          text-align: center;
          padding: 4rem 2rem;
          position: relative;
          overflow: hidden;
        }
        .card-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            repeating-linear-gradient(
              45deg,
              hsl(var(--primary) / 0.1),
              hsl(var(--primary) / 0.1) 10px,
              transparent 10px,
              transparent 20px
            );
          animation: slide 20s linear infinite;
        }
        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `
    },
    features: ['Unique Patterns', 'Animated Background', 'Bold Design'],
    isPremium: true
  }
];
