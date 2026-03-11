import { useEffect, useRef } from "react";

export function useBgSound(src: string, playing: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, [src]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing]);
}

export function useSfx(src: string) {
  const play = () => {
    const audio = new Audio(src);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };
  return play;
}