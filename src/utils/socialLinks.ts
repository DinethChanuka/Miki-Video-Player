/**
 * Curated Social Media Portals with direct browsing & stream integration
 */

export interface SocialPortalItem {
  id: string;
  name: string;
  url: string;
  browseUrl: string;
  logoUrl: string;
  badge: string;
  description: string;
  accentColor: string;
}

export const SOCIAL_LINKS: SocialPortalItem[] = [
  {
    id: 'tiktok',
    name: 'TikTok Video Feed',
    url: 'https://www.tiktok.com',
    browseUrl: 'https://www.tiktok.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=128',
    badge: 'Short Video',
    description: 'Trending vertical short-form video feed, creators, viral challenges, and live broadcasts.',
    accentColor: 'from-cyan-400 via-rose-500 to-amber-400',
  },
  {
    id: 'instagram',
    name: 'Instagram Reels & Stories',
    url: 'https://www.instagram.com',
    browseUrl: 'https://www.instagram.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128',
    badge: 'Reels & Stories',
    description: 'Explore trending Instagram Reels, visual video storytelling, and creator portfolios.',
    accentColor: 'from-purple-500 via-pink-500 to-amber-500',
  },
  {
    id: 'facebook',
    name: 'Facebook Watch & Video',
    url: 'https://www.facebook.com/watch',
    browseUrl: 'https://www.facebook.com/watch',
    logoUrl: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=128',
    badge: 'Social Streams',
    description: 'Popular viral videos, creator streams, community series, and global news broadcasts.',
    accentColor: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'youtube',
    name: 'YouTube Global',
    url: 'https://www.youtube.com',
    browseUrl: 'https://www.youtube.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
    badge: 'Google Video',
    description: 'World-leading video streaming platform with 4K streams, podcasts, music, and creators.',
    accentColor: 'from-red-600 to-rose-600',
  },
];
