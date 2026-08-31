export const APP_NAME = 'Smart Farming AI Pakistan';

export const NAV_ITEMS = [
  { label: 'nav.dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'nav.diseaseDetection', path: '/disease', icon: 'Microscope' },
  { label: 'nav.mandiPrices', path: '/mandi-prices', icon: 'BadgeIndianRupee' },
  { label: 'nav.weedManagement', path: '/weeds', icon: 'Leaf' },
  { label: 'nav.aiAssistant', path: '/assistant', icon: 'MessageCircle' },
  { label: 'nav.agricultureMap', path: '/map', icon: 'Map' },
  { label: 'nav.about', path: '/about', icon: 'Info' },
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'en' as const, label: 'English', shortLabel: 'EN' },
  { code: 'ur' as const, label: 'اردو', shortLabel: 'UR' },
  { code: 'roman-urdu' as const, label: 'Roman Urdu', shortLabel: 'RU' },
] as const;
