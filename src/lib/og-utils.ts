/**
 * Utility functions for managing Open Graph meta tags
 */

interface MetaTagConfig {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}

/**
 * Updates Open Graph meta tags in the document head
 */
export const updateOGMetaTags = (config: MetaTagConfig) => {
  const metaTags = [
    { property: 'og:title', content: config.title },
    { property: 'og:description', content: config.description },
    { property: 'og:image', content: config.image },
    { property: 'og:url', content: config.url },
    { property: 'og:type', content: config.type || 'profile' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: config.title },
    { name: 'twitter:description', content: config.description },
    { name: 'twitter:image', content: config.image },
    { name: 'description', content: config.description },
  ];

  metaTags.forEach(({ property, name, content }) => {
    const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;

    if (!meta) {
      meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }

    meta.content = content;
  });

  // Update page title
  document.title = config.title;
};



/**
 * Generates share text for social media
 */
export const generateShareText = (
  fullName: string,
  ogDescription: string | null,
  url: string
): string => {
  if (ogDescription) {
    return `${ogDescription}\n\n${url}`;
  }

  // Fallback share text
  return `Hey! Check out ${fullName}'s Patra digital business card! 🚀\n\nThis card helped boost profile views and connections.\n\n${url}\n\nGet your own at Patra.me ✨`;
};

/**
 * Triggers share dialog or copies to clipboard
 */
export const shareProfile = async (
  title: string,
  text: string,
  url: string
): Promise<{ success: boolean; method: 'native' | 'clipboard' }> => {
  // Try Web Share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'native' };
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${text}`);
    return { success: true, method: 'clipboard' };
  } catch (err) {
    console.error('Clipboard write failed:', err);
    return { success: false, method: 'clipboard' };
  }
};

/**
 * Generates social media sharing URLs
 */
export const getSocialShareUrls = (text: string, url: string) => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    email: `mailto:?subject=Check out my Patra card&body=${encodedText}%0A%0A${encodedUrl}`,
  };
};
