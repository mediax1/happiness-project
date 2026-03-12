"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import { getHighScore } from "../lib/highscore";

const FALLING_ITEMS = [
  { emoji: "😊", top: "8%", left: "12%", delay: "0s", duration: "6s" },
  { emoji: "🌟", top: "15%", left: "78%", delay: "1.2s", duration: "7s" },
  { emoji: "💛", top: "5%", left: "45%", delay: "0.5s", duration: "5.5s" },
  { emoji: "🌸", top: "20%", left: "60%", delay: "2s", duration: "8s" },
  { emoji: "☀️", top: "3%", left: "30%", delay: "1s", duration: "6.5s" },
  { emoji: "😢", top: "10%", left: "88%", delay: "0.8s", duration: "7.5s" },
  { emoji: "⚡", top: "18%", left: "5%", delay: "1.5s", duration: "6s" },
  { emoji: "🍀", top: "25%", left: "50%", delay: "0.3s", duration: "7s" },
  { emoji: "💔", top: "6%", left: "70%", delay: "2.2s", duration: "5s" },
];

export default function HomePage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    setHighScore(getHighScore());
    const audio = new Audio("/sounds/bg.mp3");
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;
    audio.play().catch(() => {});
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, [muted]);

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#78350f22_0%,_transparent_70%)]" />

      {FALLING_ITEMS.map((item) => (
        <span
          key={item.emoji + item.left}
          className="absolute text-3xl select-none opacity-20 animate-bounce"
          style={{ top: item.top, left: item.left, animationDelay: item.delay, animationDuration: item.duration }}
        >
          {item.emoji}
        </span>
      ))}

      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute top-4 right-4 z-20 text-xl text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      <div className="relative z-10 flex flex-col items-center gap-6 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl px-12 py-14 shadow-2xl max-w-md w-full mx-4">

        <div className="flex flex-col items-center gap-1">
          <span className="text-6xl animate-bounce" style={{ animationDuration: "2s" }}>🧺</span>
          <h1 className="text-5xl font-black tracking-tight text-amber-400 mt-2" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>
            Happiness
          </h1>
          <p className="text-sm font-medium text-amber-600/70 uppercase tracking-widest mt-1">
            Catch the good stuff
          </p>
          {highScore > 0 && (
            <div className="mt-2 flex items-center gap-2 bg-zinc-800 px-4 py-1.5 rounded-full">
              <span className="text-sm">🏆</span>
              <span className="text-sm font-bold text-yellow-400">Best: {highScore}</span>
            </div>
          )}
        </div>

        <div className="w-16 h-px bg-zinc-700" />

        <ul className="text-sm text-zinc-400 space-y-3 w-full">
          <li className="flex items-center gap-3">
            <span className="text-xl">😊</span>
            <span>Catch positive items to score points</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl">⭐</span>
            <span>Rare golden stars are worth <strong className="text-yellow-400">100 pts</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl">😢</span>
            <span>Negative items cost you a heart ❤️</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl">🔥</span>
            <span>Chain catches for a <strong className="text-amber-400">combo multiplier</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <span>Game gets harder every <strong className="text-white">10 seconds</strong></span>
          </li>
        </ul>

        <div className="w-16 h-px bg-zinc-700" />

        <Button onClick={() => router.push("/game")}>Start Game</Button>

        <p className="text-xs text-zinc-600">Use ← → arrow keys or move your mouse</p>
      </div>
    </main>
  );
}