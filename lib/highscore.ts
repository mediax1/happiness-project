const KEY = "happiness_highscore";

export function getHighScore(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(KEY) ?? "0", 10);
}

export function saveHighScore(score: number): boolean {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem(KEY, String(score));
    return true;
  }
  return false;
}