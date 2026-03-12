"use client";

export type FallingItemData = {
  id: string;
  emoji: string;
  positive: boolean;
  rare?: boolean;
  x: number;
  y: number;
  speed: number;
};

interface FallingItemProps {
  item: FallingItemData;
}

export default function FallingItem({ item }: FallingItemProps) {
  return (
    <div
      className="absolute select-none pointer-events-none"
      style={{
        left: item.x,
        top: item.y,
        fontSize: item.rare ? "2.8rem" : "2rem",
        filter: item.rare ? "drop-shadow(0 0 8px #facc15) drop-shadow(0 0 16px #f59e0b)" : undefined,
        animation: item.rare ? "golden-pulse 0.8s ease-in-out infinite alternate" : undefined,
      }}
    >
      {item.emoji}
    </div>
  );
}