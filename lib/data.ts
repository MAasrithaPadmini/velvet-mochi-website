// Static UI data — icons, filters, labels. No business data here.
import { BookOpen, Flame, Heart, Search, ShieldAlert, Sparkles, Star } from "lucide-react";

export const searchFilters = [
  { label: "Genre", icon: Search },
  { label: "Universe", icon: Sparkles },
  { label: "Heat", icon: Flame },
  { label: "Status", icon: Star },
  { label: "Warnings", icon: ShieldAlert },
  { label: "Favorites", icon: Heart },
];

export const navigation = [
  { label: "Library", href: "/library" },
  { label: "Bookshelf", href: "/bookshelf" },
  { label: "Author", href: "/about" },
  { label: "Dashboard", href: "/dashboard" },
];

export { BookOpen };
