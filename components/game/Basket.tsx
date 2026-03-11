"use client";

interface BasketProps {
  x: number;
  basketWidth: number;
  bottomOffset: number;
  platformHeight: number;
}

export default function Basket({ x, basketWidth, bottomOffset, platformHeight }: BasketProps) {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: x, bottom: bottomOffset, width: basketWidth }}
    >
      <span className="text-4xl leading-none">🧺</span>
      <div
        className="w-full rounded-full bg-amber-500/60 mt-1 shadow-lg shadow-amber-500/20"
        style={{ height: platformHeight }}
      />
    </div>
  );
}