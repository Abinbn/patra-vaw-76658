import React from 'react';

export interface SocialLink {
  platform: string;
  url: string;
  icon: string | React.ReactElement;
}

export interface PaymentLink {
  platform: string;
  url: string;
  icon: string | React.ReactElement;
}

export interface CustomLink {
  title: string;
  url: string;
  description: string;
  previewImage?: string;
  groupId?: string;
}

export interface LinkGroup {
  id: string;
  name: string;
}

export interface Achievement {
  title: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar?: string;
  socialUrl?: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export interface CardData {
  fullName: string;
  about: string;
  location: string;
  pronunciation: string;
  pronoun: string;
  audioPronunciation?: string;
  languages: string[];
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  contactForm: string;
  calendar: string;
  socialLinks: SocialLink[];
  paymentLinks: PaymentLink[];
  customLinks: CustomLink[];
  linkGroups: LinkGroup[];
  interests: string[];
  avatarUrl: string;
  vanityUrl: string;
  upiId: string;
  videoIntro?: string;
  achievements: Achievement[];
  testimonials: Testimonial[];
  theme?: string;
  customCSS?: string;
  photos: Photo[];
  cardOrder: string[];
  cardVisibility: {
    contact: boolean;
    verified: boolean;
    links: boolean;
    achievements: boolean;
    testimonials: boolean;
    interests: boolean;
    gallery: boolean;
    languages: boolean;
    location: boolean;
  };
  address?: string;
  showAddressMap?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string;
  bannerType?: 'gradient' | 'color' | 'image' | 'blurred' | 'pattern';
  bannerValue?: string;
}
