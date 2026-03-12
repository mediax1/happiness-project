"use client";

import { useEffect, useRef, useState } from "react";

export type ScorePopupData = {
  id: string;
  x: number;
  y: number;
  points: number;
  combo?: number;
  golden?: boolean;
};

interface ScorePopupProps {
  popup: ScorePopupData;
  onDone: (id: string) => void;
}

export default function ScorePopup({ popup, onDone }: ScorePopupProps) {
  const [visible, setVisible] = useState(true);
  const onDoneRef = useRef(onDone);
  const idRef = useRef(popup.id);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 500);
    const t2 = setTimeout(() => onDoneRef.current(idRef.current), 750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const color = popup.golden ? "#facc15" : popup.points >= 0 ? "#fbbf24" : "#f87171";

  return (
    <div
      className="absolute z-10 pointer-events-none flex flex-col items-center"
      style={{
        left: popup.x,
        top: popup.y,
        transition: "opacity 0.25s ease, transform 0.5s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px) scale(1.3)" : "translateY(-44px) scale(1)",
        filter: popup.golden ? "drop-shadow(0 0 6px #facc15)" : undefined,
      }}
    >
      <span className="font-black text-base" style={{ color }}>
        {popup.points >= 0 ? `+${popup.points}` : `${popup.points}`}
      </span>
      {popup.golden && <span className="text-xs font-bold text-yellow-300">⭐ rare!</span>}
      {!popup.golden && popup.combo && popup.combo > 1 && (
        <span className="text-xs font-bold text-orange-400">{popup.combo}x combo!</span>
      )}
    </div>
  );
}