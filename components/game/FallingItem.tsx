"use client";

export type FallingItemData = {
  id: string;
  emoji: string;
  positive: boolean;
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
      className="absolute text-3xl select-none pointer-events-none"
      style={{ left: item.x, top: item.y }}
    >
      {item.emoji}
    </div>
  );
}