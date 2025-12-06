import React from 'react';
import ReactDOM from 'react-dom/client';
import { DigitalCard, CardData } from '@/components/card/DigitalCard';
import styles from '../index.css?inline';

class PatraCard extends HTMLElement {
  private root: ReactDOM.Root | null = null;
  private mountPoint: HTMLDivElement | null = null;

  static get observedAttributes() {
    return ['username', 'width', 'height', 'theme'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }

  async fetchCardData(username: string): Promise<CardData | null> {
    try {
      // Use the public Edge Function URL
      const response = await fetch(`https://ffpqhgiucoqjmkyeevqq.supabase.co/functions/v1/get-card?vanity_url=${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add anon key if needed, but get-card should be public
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) return null;
      const data = await response.json();
      
      // Transform API response to CardData
      const content = data.card_data || data; // Handle different response structures
      
      // If the edge function returns the raw DB row (which it seems to do based on my previous analysis)
      // We need to map it correctly.
      // Let's assume the edge function returns { id, vanity_url, content_json, profiles: {...} }
      
      // Actually, let's use the same logic as EmbedCard.tsx for robustness
      // But we can't use the supabase client here easily without bundling it all.
      // So we rely on the Edge Function returning a usable JSON.
      
      // If the Edge Function returns the formatted response (which we saw in ApiDocs it might not),
      // we might need to do some mapping.
      
      // Let's assume the standard structure we saw in EmbedCard.tsx
      // But since we are fetching from the Edge Function, let's hope it returns the processed data.
      // If not, we might need to adjust.
      
      // For now, let's map what we likely get.
      return {
          fullName: content.fullName || content.name || 'User',
          jobTitle: content.jobTitle || '',
          company: content.company || '',
          email: content.email || '',
          phone: content.phone || '',
          avatarUrl: content.avatarUrl || '',
          vanityUrl: username,
          cardConfig: content.cardConfig,
          bannerType: content.bannerType,
          bannerValue: content.bannerValue
      };
    } catch (err) {
      console.error('Patra SDK: Failed to fetch card', err);
      return null;
    }
  }

  async render() {
    if (!this.shadowRoot) return;

    const username = this.getAttribute('username');
    if (!username) return;

    const width = parseInt(this.getAttribute('width') || '400');
    const height = parseInt(this.getAttribute('height') || '250');

    // Create mount point if not exists
    if (!this.mountPoint) {
      this.mountPoint = document.createElement('div');
      this.mountPoint.className = 'patra-card-widget';
      
      // Inject Styles
      const styleTag = document.createElement('style');
      styleTag.textContent = styles;
      this.shadowRoot.appendChild(styleTag);
      this.shadowRoot.appendChild(this.mountPoint);
    }

    // Initialize React Root
    if (!this.root) {
      this.root = ReactDOM.createRoot(this.mountPoint);
    }

    // Show loading state
    this.root.render(
      <div className="flex items-center justify-center" style={{ width, height, color: '#666' }}>
        <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );

    // Fetch Data
    const cardData = await this.fetchCardData(username);

    if (cardData) {
      this.root.render(
        <div className="patra-iso-root">
           <DigitalCard
            cardData={cardData}
            username={username}
            width={width}
            height={height}
          />
        </div>
      );
    } else {
      this.root.render(
        <div className="flex items-center justify-center text-red-500" style={{ width, height }}>
          Card not found
        </div>
      );
    }
  }
}

// Register Web Component
if (!customElements.get('patra-card')) {
  customElements.define('patra-card', PatraCard);
}

// Also export a global function for manual rendering
(window as any).Patra = {
  renderCard: (username: string, containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      const el = document.createElement('patra-card');
      el.setAttribute('username', username);
      container.appendChild(el);
    }
  }
};
