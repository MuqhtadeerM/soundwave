"use client";

import type { CSSProperties } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { usePlayerStore } from "@/store/player-store";

export function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const level = muted ? 0 : volume;
  const Icon = level === 0 ? VolumeX : level < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-1">
      <IconButton label={muted ? "Unmute" : "Mute"} onClick={toggleMute}>
        <Icon className="size-5" aria-hidden />
      </IconButton>
      <input
        type="range"
        className="range w-24"
        min={0}
        max={1}
        step={0.01}
        value={level}
        aria-label="Volume"
        style={{ "--fill": `${level * 100}%` } as CSSProperties}
        onChange={(e) => setVolume(Number(e.target.value))}
      />
    </div>
  );
}
