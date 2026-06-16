/** Site-wide constants for Yugantar */

export const SITE_NAME = "Yugantar";
export const SITE_TAGLINE = "Where Ideas Become Movements";
export const SITE_DESCRIPTION =
  "Discover visionaries, innovators, leaders, and creators shaping tomorrow.";

/** Navigation links */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/cave", label: "The Atrium" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin Portal" },
] as const;

/** Stats display on homepage */
export const HERO_STATS = [
  { label: "Ideas Shared", value: 1000, suffix: "+" },
  { label: "Thinkers", value: 500, suffix: "+" },
  { label: "Talks", value: 250, suffix: "+" },
  { label: "Countries", value: 50, suffix: "+" },
] as const;

/** Featured speaker categories */
export const SPEAKER_CATEGORIES = [
  { label: "Visionaries", color: "primary" },
  { label: "Innovators", color: "secondary" },
  { label: "Leaders", color: "accent" },
  { label: "Creators", color: "primary" },
] as const;
