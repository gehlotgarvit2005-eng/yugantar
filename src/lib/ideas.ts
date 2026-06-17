/** Cave paintings — ideas etched into the walls of Yugantar */

export type IdeaEra = "fire" | "night" | "sun";

export interface Idea {
  id: string;
  text: string;
  author: string;
  era: IdeaEra;
  date: string;
  featured: boolean;
  upvotes: number;
  ai_explanation?: string | null;
  created_at?: string;
  status?: string;
  review_notes?: string;
  review_history?: any[];
  deleted_at?: string | null;
  email?: string | null;
  college?: string | null;
  school?: string | null;
  mobile?: string | null;
}

export const IDEAS: Idea[] = [
  {
    id: "mammoth-1",
    text: "The fire remembers what the ice forgot.",
    author: "Cave Shaman",
    era: "fire",
    date: "Era of Embers",
    featured: true,
    upvotes: 142,
  },
  {
    id: "mammoth-2",
    text: "Between two eras lies the bravest step.",
    author: "Ember Walker",
    era: "night",
    date: "Era of Shadows",
    featured: true,
    upvotes: 98,
  },
  {
    id: "mammoth-3",
    text: "A mammoth does not ask permission to cross the plain.",
    author: "Tusk King",
    era: "sun",
    date: "Era of Dawn",
    featured: true,
    upvotes: 211,
  },
  {
    id: "mammoth-4",
    text: "Night is not the enemy — night is the womb of stars.",
    author: "Moon Listener",
    era: "night",
    date: "Era of Shadows",
    featured: true,
    upvotes: 176,
  },
  {
    id: "mammoth-5",
    text: "Gold is just fire that learned patience.",
    author: "Sun Forger",
    era: "sun",
    date: "Era of Dawn",
    featured: true,
    upvotes: 203,
  },
  {
    id: "mammoth-6",
    text: "The cave wall holds more truth than the open sky.",
    author: "Deep Painter",
    era: "night",
    date: "Era of Shadows",
    featured: false,
    upvotes: 67,
  },
  {
    id: "mammoth-7",
    text: "Each ending is a spark looking for tinder.",
    author: "Ash Collector",
    era: "fire",
    date: "Era of Embers",
    featured: false,
    upvotes: 89,
  },
  {
    id: "mammoth-8",
    text: "Strong ideas walk on four feet.",
    author: "Mammoth Rider",
    era: "sun",
    date: "Era of Dawn",
    featured: false,
    upvotes: 134,
  },
  {
    id: "mammoth-9",
    text: "Darkness is not empty — it is full of beginning.",
    author: "Void Seeker",
    era: "night",
    date: "Era of Shadows",
    featured: false,
    upvotes: 112,
  },
  {
    id: "mammoth-10",
    text: "The tribe that paints together thinks together.",
    author: "Cave Elder",
    era: "fire",
    date: "Era of Embers",
    featured: false,
    upvotes: 55,
  },
  {
    id: "mammoth-11",
    text: "Your skull is a cave. Fill it with fire, not smoke.",
    author: "Flame Teacher",
    era: "fire",
    date: "Era of Embers",
    featured: true,
    upvotes: 157,
  },
  {
    id: "mammoth-12",
    text: "What burns brightest leaves the deepest shadow.",
    author: "Duality Keeper",
    era: "night",
    date: "Era of Shadows",
    featured: false,
    upvotes: 91,
  },
];

/** Get featured ideas sorted by upvotes */
export function getFeaturedIdeas(): Idea[] {
  return IDEAS.filter((i) => i.featured).sort(
    (a, b) => b.upvotes - a.upvotes,
  );
}

/** Get all ideas sorted by upvotes */
export function getAllIdeas(): Idea[] {
  return [...IDEAS].sort((a, b) => b.upvotes - a.upvotes);
}

/** Era display config — uses new premium color system */
export const ERA_CONFIG: Record<IdeaEra, { label: string; icon: string; color: string; ring: string; bg: string; hoverBorder: string; selectedBorder: string }> = {
  fire: {
    label: "Gold",
    icon: "✦",
    color: "primary",
    ring: "ring-primary/30",
    bg: "bg-primary/5",
    hoverBorder: "hover:border-primary/40",
    selectedBorder: "border-primary/40",
  },
  night: {
    label: "Platinum",
    icon: "◇",
    color: "secondary",
    ring: "ring-secondary/30",
    bg: "bg-secondary/5",
    hoverBorder: "hover:border-secondary/40",
    selectedBorder: "border-secondary/40",
  },
  sun: {
    label: "Champagne",
    icon: "✦",
    color: "accent",
    ring: "ring-accent/30",
    bg: "bg-accent/5",
    hoverBorder: "hover:border-accent/40",
    selectedBorder: "border-accent/40",
  },
};
