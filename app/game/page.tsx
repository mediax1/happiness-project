"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Basket from "../../components/game/Basket";
import FallingItem, { FallingItemData } from "../../components/game/FallingItem";
import ScorePopup, { ScorePopupData } from "../../components/game/ScorePopup";
import Hearts from "../../components/game/Hearts";
import { ITEMS, GOLDEN_ITEM } from "../../lib/items";
import { useBgSound, useSfx } from "../../hooks/useSound";
import { getHighScore, saveHighScore } from "../../lib/highscore";

const BASKET_WIDTH = 72;
const BASKET_HEIGHT = 48;
const MOVE_STEP = 24;
const ITEM_SIZE = 40;
const TICK = 30;
const MAX_LIVES = 3;
const PLATFORM_HEIGHT = 12;
const BOTTOM_OFFSET = 32;
const GOLDEN_CHANCE = 0.02;
const GOLDEN_INTERVAL = 30000;

const LEVEL_COLORS = [
  "#78350f18",
  "#14532d18",
  "#1e3a5f18",
  "#4c1d9518",
  "#7f1d1d18",
];

const LEVEL_LABELS = ["🌤 Calm", "🌿 Rising", "🌊 Flowing", "⚡ Intense", "🔥 Chaos"];

function getLevelIndex(elapsed: number) {
  return Math.min(Math.floor(elapsed / 10), LEVEL_COLORS.length - 1);
}

function getSpeedMultiplier(elapsed: number) {
  return 1 + elapsed * 0.04;
}

function getSpawnInterval(elapsed: number) {
  return Math.max(400, 1200 - elapsed * 18);
}

function randomItem(multiplier: number): Omit<FallingItemData, "id" | "x" | "y"> {
  const template = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  return {
    emoji: template.emoji,
    positive: template.positive,
    rare: false,
    speed: (2.5 + Math.random() * 2) * multiplier,
  };
}

export default function GamePage() {
  const router = useRouter();
  const areaRef = useRef<HTMLDivElement>(null);
  const [areaWidth, setAreaWidth] = useState(0);
  const [areaHeight, setAreaHeight] = useState(0);
  const [basketX, setBasketX] = useState(0);
  const [fallingItems, setFallingItems] = useState<FallingItemData[]>([]);
  const [popups, setPopups] = useState<ScorePopupData[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [combo, setCombo] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState<"positive" | "negative" | "golden" | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const basketXRef = useRef(0);
  const runningRef = useRef(true);
  const elapsedRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const spawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const caughtIds = useRef<Set<string>>(new Set());

  useBgSound("/sounds/bg.mp3", running);
  const playCatch = useSfx("/sounds/catch.mp3");
  const playMiss = useSfx("/sounds/miss.mp3");

  useEffect(() => { setHighScore(getHighScore()); }, []);
  useEffect(() => { basketXRef.current = basketX; }, [basketX]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    if (!areaRef.current) return;
    const w = areaRef.current.clientWidth;
    const h = areaRef.current.clientHeight;
    setAreaWidth(w);
    setAreaHeight(h);
    const startX = w / 2 - BASKET_WIDTH / 2;
    setBasketX(startX);
    basketXRef.current = startX;
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!runningRef.current) return;
      if (e.key === "ArrowLeft")
        setBasketX((prev) => {
          const next = Math.max(0, prev - MOVE_STEP);
          basketXRef.current = next;
          return next;
        });
      if (e.key === "ArrowRight")
        setBasketX((prev) => {
          const next = Math.min(areaWidth - BASKET_WIDTH, prev + MOVE_STEP);
          basketXRef.current = next;
          return next;
        });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [areaWidth]);

  useEffect(() => {
    if (areaWidth === 0) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!runningRef.current || !areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left - BASKET_WIDTH / 2;
      const clamped = Math.max(0, Math.min(areaWidth - BASKET_WIDTH, relX));
      setBasketX(clamped);
      basketXRef.current = clamped;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!runningRef.current || !areaRef.current) return;
      const touch = e.touches[0];
      const rect = areaRef.current.getBoundingClientRect();
      const relX = touch.clientX - rect.left - BASKET_WIDTH / 2;
      const clamped = Math.max(0, Math.min(areaWidth - BASKET_WIDTH, relX));
      setBasketX(clamped);
      basketXRef.current = clamped;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [areaWidth]);

  useEffect(() => {
    if (!running || areaWidth === 0) return;
    const scheduleSpawn = () => {
      const interval = getSpawnInterval(elapsedRef.current);
      spawnRef.current = setTimeout(() => {
        if (!runningRef.current) return;
        const multiplier = getSpeedMultiplier(elapsedRef.current);
        const x = Math.random() * (areaWidth - ITEM_SIZE);
        const isGolden = Math.random() < GOLDEN_CHANCE;
        const template = isGolden ? GOLDEN_ITEM : null;
        setFallingItems((prev) => [
          ...prev,
          template
            ? { id: crypto.randomUUID(), x, y: 0, emoji: template.emoji, positive: true, rare: true, speed: (2 + Math.random()) * multiplier }
            : { id: crypto.randomUUID(), x, y: 0, ...randomItem(multiplier) },
        ]);
        scheduleSpawn();
      }, interval);
    };
    scheduleSpawn();
    return () => { if (spawnRef.current) clearTimeout(spawnRef.current); };
  }, [running, areaWidth]);

  useEffect(() => {
    if (!running || areaWidth === 0) return;
    const goldenId = setInterval(() => {
      if (!runningRef.current) return;
      const multiplier = getSpeedMultiplier(elapsedRef.current);
      const x = Math.random() * (areaWidth - ITEM_SIZE);
      setFallingItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), x, y: 0, emoji: GOLDEN_ITEM.emoji, positive: true, rare: true, speed: (1.5 + Math.random()) * multiplier },
      ]);
    }, GOLDEN_INTERVAL);
    return () => clearInterval(goldenId);
  }, [running, areaWidth]);

  useEffect(() => {
    if (!running || areaHeight === 0) return;
    const catchY = areaHeight - BOTTOM_OFFSET - PLATFORM_HEIGHT - BASKET_HEIGHT;
    const id = setInterval(() => {
      setFallingItems((prev) => {
        const bx = basketXRef.current;
        const survived: FallingItemData[] = [];
        for (const item of prev) {
          const nextY = item.y + item.speed;
          if (caughtIds.current.has(item.id)) continue;
          const caught =
            nextY + ITEM_SIZE >= catchY &&
            nextY <= catchY + BASKET_HEIGHT &&
            item.x + ITEM_SIZE >= bx &&
            item.x <= bx + BASKET_WIDTH;
          if (caught) {
            caughtIds.current.add(item.id);
            if (item.rare) {
              const newCombo = comboRef.current + 1;
              comboRef.current = newCombo;
              setCombo(newCombo);
              setScore((s) => s + GOLDEN_ITEM.points);
              setPopups((p) => [...p, { id: crypto.randomUUID(), x: item.x, y: catchY - 20, points: GOLDEN_ITEM.points, combo: undefined, golden: true }]);
              setFlash("golden");
              setTimeout(() => setFlash(null), 400);
              playCatch();
            } else if (item.positive) {
              const newCombo = comboRef.current + 1;
              const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
              const finalPts = (ITEMS.find((i) => i.emoji === item.emoji)?.points ?? 10) * multiplier;
              comboRef.current = newCombo;
              setCombo(newCombo);
              setScore((s) => s + finalPts);
              setPopups((p) => [...p, { id: crypto.randomUUID(), x: item.x, y: catchY - 20, points: finalPts, combo: multiplier > 1 ? multiplier : undefined }]);
              setFlash("positive");
              setTimeout(() => setFlash(null), 200);
              playCatch();
            } else {
              comboRef.current = 0;
              setCombo(0);
              const pts = ITEMS.find((i) => i.emoji === item.emoji)?.points ?? -10;
              const newLives = livesRef.current - 1;
              livesRef.current = newLives;
              setLives(newLives);
              setPopups((p) => [...p, { id: crypto.randomUUID(), x: item.x, y: catchY - 20, points: pts }]);
              setFlash("negative");
              setTimeout(() => setFlash(null), 300);
              playMiss();
              if (newLives <= 0) {
                const isNew = saveHighScore(scoreRef.current);
                setIsNewHighScore(isNew);
                setHighScore(getHighScore());
                setRunning(false);
                setGameOver(true);
              }
            }
          } else if (nextY <= areaHeight) {
            survived.push({ ...item, y: nextY });
          }
        }
        return survived;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [running, areaHeight]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const removePopup = useCallback((id: string) => {
    setPopups((p) => p.filter((x) => x.id !== id));
  }, []);

  const levelIndex = getLevelIndex(elapsed);
  const glowColor = LEVEL_COLORS[levelIndex];
  const levelLabel = LEVEL_LABELS[levelIndex];

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <div
        className="pointer-events-none fixed inset-0 transition-all duration-1000"
        style={{ background: `radial-gradient(ellipse at top, ${glowColor} 0%, transparent 60%)` }}
      />

      <div className="relative z-10 flex flex-col w-full max-w-2xl h-[94vh] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/60 shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Score</span>
            <span className="text-3xl font-black text-amber-400">{score}</span>
            {highScore > 0 && (
              <span className="text-xs text-zinc-600">best {highScore}</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">{levelLabel}</span>
            <Hearts lives={lives} max={MAX_LIVES} />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Combo</span>
            <span className={`text-3xl font-black transition-colors ${combo >= 5 ? "text-orange-400" : combo >= 3 ? "text-yellow-400" : "text-zinc-500"}`}>
              {combo >= 5 ? "x3 🔥" : combo >= 3 ? "x2 ⚡" : `×${combo}`}
            </span>
          </div>
        </header>

        <div ref={areaRef} className="relative flex-1 w-full overflow-hidden">
          {flash === "positive" && <div className="absolute inset-0 bg-green-400/10 z-10 pointer-events-none" />}
          {flash === "negative" && <div className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none" />}
          {flash === "golden" && <div className="absolute inset-0 bg-yellow-400/20 z-10 pointer-events-none" />}

          {fallingItems.map((item) => (
            <FallingItem key={item.id} item={item} />
          ))}
          {popups.map((p) => (
            <ScorePopup key={p.id} popup={p} onDone={removePopup} />
          ))}
          {areaWidth > 0 && (
            <Basket x={basketX} basketWidth={BASKET_WIDTH} bottomOffset={BOTTOM_OFFSET} platformHeight={PLATFORM_HEIGHT} />
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-5 bg-zinc-900 border border-zinc-800 rounded-3xl px-12 py-12 shadow-2xl">
                <span className="text-5xl">🧺</span>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">Game Over</span>
                  <span className="text-6xl font-black text-amber-400">{score}</span>
                  {isNewHighScore && (
                    <span className="text-sm font-bold text-yellow-400 animate-bounce">🏆 New High Score!</span>
                  )}
                  {!isNewHighScore && highScore > 0 && (
                    <span className="text-xs text-zinc-500">best: {highScore}</span>
                  )}
                  <span className="text-sm text-zinc-400 mt-1">survived {elapsed}s · reached {levelLabel}</span>
                </div>
                <div className="w-16 h-px bg-zinc-700" />
                <div className="flex gap-3">
                  <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all active:scale-95">
                    Play Again
                  </button>
                  <button onClick={() => router.push("/")} className="px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm transition-all active:scale-95">
                    Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}