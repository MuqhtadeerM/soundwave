"use client";

import { ListMusic } from "lucide-react";
import { Artwork } from "@/components/ui/artwork";
import { IconButton } from "@/components/ui/icon-button";
import { selectCurrentTrack, usePlayerStore } from "@/store/player-store";
import { useUiStore } from "@/store/ui-store";
import { PlaybackControls } from "./playback-controls";
import { SeekBar } from "./seek-bar";
import { VolumeControl } from "./volume-control";

function ProgressLine() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  return (
    <div className="h-0.5 w-full bg-fg/10 md:hidden" aria-hidden>
      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}

function QueueToggle() {
  const open = useUiStore((s) => s.queueOpen);
  const toggle = useUiStore((s) => s.toggleQueue);
  return (
    <IconButton
      label="Queue"
      active={open}
      aria-pressed={open}
      onClick={toggle}
    >
      <ListMusic className="size-5" aria-hidden />
    </IconButton>
  );
}

export function PlayerBar() {
  const track = usePlayerStore(selectCurrentTrack);
  const status = usePlayerStore((s) => s.status);
  const errorMessage = usePlayerStore((s) => s.errorMessage);
  const retry = usePlayerStore((s) => s.retry);
  const next = usePlayerStore((s) => s.next);

  if (!track) {
    return (
      <div className="hidden h-20 shrink-0 items-center justify-between border-t border-border bg-surface px-4 text-sm text-muted md:flex">
        <span className="mx-auto">Pick a track to start listening</span>
        <QueueToggle />
      </div>
    );
  }

  return (
    <section
      aria-label="Player"
      className="shrink-0 border-t border-border bg-surface"
    >
      {status === "error" ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 bg-red-500/10 px-4 py-2 text-sm text-red-500"
        >
          <span>{errorMessage}</span>
          <span className="flex shrink-0 gap-3 font-semibold">
            <button type="button" onClick={retry} className="underline">
              Try again
            </button>
            <button type="button" onClick={next} className="underline">
              Skip
            </button>
          </span>
        </div>
      ) : null}
      <ProgressLine />
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2 md:grid-cols-[1fr_minmax(0,2fr)_1fr] md:px-4 md:py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Artwork
            src={track.coverUrl}
            alt={`${track.albumTitle} cover`}
            className="size-12 shrink-0 rounded-lg md:size-14"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{track.title}</p>
            <p className="truncate text-xs text-muted">{track.artistName}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <PlaybackControls />
          <div className="hidden w-full max-w-xl md:block">
            <SeekBar />
          </div>
        </div>

        <div className="md:hidden">
          <QueueToggle />
        </div>

        <div className="hidden items-center justify-end gap-1 md:flex">
          <QueueToggle />
          <VolumeControl />
        </div>
      </div>
    </section>
  );
}
