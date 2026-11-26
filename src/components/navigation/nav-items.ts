import {
  Compass,
  Heart,
  History,
  Home,
  Library,
  ListMusic,
  Podcast,
  Search,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  mobilePrimary: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/", icon: Home, mobilePrimary: true },
  { label: "Discover", href: "/discover", icon: Compass, mobilePrimary: false },
  { label: "Search", href: "/search", icon: Search, mobilePrimary: true },
  {
    label: "Your Library",
    href: "/library",
    icon: Library,
    mobilePrimary: true,
  },
  {
    label: "Playlists",
    href: "/playlists",
    icon: ListMusic,
    mobilePrimary: false,
  },
  {
    label: "Recently Played",
    href: "/recent",
    icon: History,
    mobilePrimary: false,
  },
  { label: "Liked Songs", href: "/liked", icon: Heart, mobilePrimary: false },
  { label: "Podcasts", href: "/podcasts", icon: Podcast, mobilePrimary: true },
];
