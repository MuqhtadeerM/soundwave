"use client";

import {
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { usePlayerStore } from "@/store/player-store";

const REPEAT_LABEL = {
  off: "Repeat off",
  all: "Repeat all",
  one: "Repeat one",
} as const;

export function PlaybackControls() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const status = usePlayerStore((s) => s.status);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  const buffering = isPlaying && status === "loading";
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <span className="hidden md:inline-flex">
        <IconButton
          label="Shuffle"
          active={shuffle}
          aria-pressed={shuffle}
          onClick={toggleShuffle}
        >
          <Shuffle className="size-5" aria-hidden />
        </IconButton>
      </span>
      <IconButton label="Previous track" onClick={previous}>
        <SkipBack className="size-5 fill-current" aria-hidden />
      </IconButton>
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="grid size-11 place-items-center rounded-full bg-fg text-bg transition-transform hover:scale-105 active:scale-95"
      >
        {buffering ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : isPlaying ? (
          <Pause className="size-5 fill-current" aria-hidden />
        ) : (
          <Play className="size-5 translate-x-px fill-current" aria-hidden />
        )}
      </button>
      <IconButton label="Next track" onClick={next}>
        <SkipForward className="size-5 fill-current" aria-hidden />
      </IconButton>
      <span className="hidden md:inline-flex">
        <IconButton
          label={REPEAT_LABEL[repeat]}
          active={repeat !== "off"}
          onClick={cycleRepeat}
        >
          <RepeatIcon className="size-5" aria-hidden />
        </IconButton>
      </span>
    </div>
  );
}
