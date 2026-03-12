export type ItemType = {
  emoji: string;
  label: string;
  points: number;
  positive: boolean;
  rare?: boolean;
};

export const ITEMS: ItemType[] = [
  { emoji: "😊", label: "Joy", points: 10, positive: true },
  { emoji: "🌟", label: "Hope", points: 15, positive: true },
  { emoji: "💛", label: "Love", points: 20, positive: true },
  { emoji: "🌸", label: "Peace", points: 10, positive: true },
  { emoji: "☀️", label: "Sun", points: 15, positive: true },
  { emoji: "🍀", label: "Luck", points: 25, positive: true },
  { emoji: "🎵", label: "Music", points: 10, positive: true },
  { emoji: "😢", label: "Sadness", points: -15, positive: false },
  { emoji: "⚡", label: "Stress", points: -20, positive: false },
  { emoji: "🌧️", label: "Rain", points: -10, positive: false },
  { emoji: "💔", label: "Hurt", points: -20, positive: false },
  { emoji: "😤", label: "Anger", points: -15, positive: false },
];

export const GOLDEN_ITEM: ItemType = {
  emoji: "⭐",
  label: "Golden Star",
  points: 100,
  positive: true,
  rare: true,
};