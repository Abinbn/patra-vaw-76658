import React from 'react';
import {
    FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaYoutube,
    FaTiktok, FaDiscord, FaWhatsapp, FaTelegram, FaReddit, FaMedium,
    FaDribbble, FaBehance, FaPinterest, FaTwitch, FaPaypal,
    FaCashRegister, FaPatreon, FaBitcoin, FaEthereum
} from "react-icons/fa";
import { SiLitecoin, SiDogecoin } from "react-icons/si";
import {
    Mail,
    Verified,
    Link2,
    Award,
    MessageSquare,
    Heart,
    ImageIcon,
    Globe,
    MapPin
} from 'lucide-react';

export const socialPlatforms = [
    { name: 'GitHub', icon: <FaGithub className="text-lg" /> },
    { name: 'LinkedIn', icon: <FaLinkedin className="text-lg text-blue-700" /> },
    { name: 'Twitter', icon: <FaTwitter className="text-lg text-sky-500" /> },
    { name: 'Instagram', icon: <FaInstagram className="text-lg text-pink-500" /> },
    { name: 'Facebook', icon: <FaFacebook className="text-lg text-blue-600" /> },
    { name: 'YouTube', icon: <FaYoutube className="text-lg text-red-600" /> },
    { name: 'TikTok', icon: <FaTiktok className="text-lg" /> },
    { name: 'Discord', icon: <FaDiscord className="text-lg text-indigo-500" /> },
    { name: 'WhatsApp', icon: <FaWhatsapp className="text-lg text-green-500" /> },
    { name: 'Telegram', icon: <FaTelegram className="text-lg text-sky-400" /> },
    { name: 'Reddit', icon: <FaReddit className="text-lg text-orange-500" /> },
    { name: 'Medium', icon: <FaMedium className="text-lg" /> },
    { name: 'Dribbble', icon: <FaDribbble className="text-lg text-pink-400" /> },
    { name: 'Behance', icon: <FaBehance className="text-lg text-blue-500" /> },
    { name: 'Pinterest', icon: <FaPinterest className="text-lg text-red-500" /> },
    { name: 'Twitch', icon: <FaTwitch className="text-lg text-purple-500" /> },
];

export const paymentPlatforms = [
    { name: 'PayPal', icon: <FaPaypal className="text-lg text-sky-600" /> },
    { name: 'CashApp', icon: <FaCashRegister className="text-lg text-green-500" /> },
    { name: 'Patreon', icon: <FaPatreon className="text-lg text-orange-500" /> },
    { name: 'Bitcoin', icon: <FaBitcoin className="text-lg text-orange-400" /> },
    { name: 'Ethereum', icon: <FaEthereum className="text-lg text-gray-400" /> },
    { name: 'Litecoin', icon: <SiLitecoin className="text-lg text-blue-400" /> },
    { name: 'Dogecoin', icon: <SiDogecoin className="text-lg text-yellow-500" /> },
];

export const cardThemes = [
    { id: 'default', name: 'Default', preview: 'bg-gradient-to-br from-blue-50 to-indigo-100' },
    { id: 'modern', name: 'Modern Dark', preview: 'bg-gradient-to-br from-gray-900 to-gray-800' },
    { id: 'vibrant', name: 'Vibrant', preview: 'bg-gradient-to-br from-purple-400 to-pink-600' },
    { id: 'professional', name: 'Professional', preview: 'bg-gradient-to-br from-slate-100 to-gray-200' },
    { id: 'minimal', name: 'Minimal', preview: 'bg-white border-2 border-gray-200' },
];

export const CARD_DEFINITIONS = [
    { id: 'contact', label: 'Contact Information', icon: Mail },
    { id: 'verified', label: 'Verified Accounts', icon: Verified },
    { id: 'links', label: 'Custom Links', icon: Link2 },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'languages', label: 'Languages', icon: Globe },
    { id: 'location', label: 'Location', icon: MapPin },
];
