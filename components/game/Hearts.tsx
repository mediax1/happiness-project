"use client";

interface HeartsProps {
  lives: number;
  max: number;
}

export default function Hearts({ lives, max }: HeartsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="text-2xl transition-all duration-300"
          style={{ opacity: i < lives ? 1 : 0.2, transform: i < lives ? "scale(1)" : "scale(0.8)" }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}