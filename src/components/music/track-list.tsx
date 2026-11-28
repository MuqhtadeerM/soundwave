"use client";

import { Pause } from "lucide-react";
import { Artwork } from "@/components/ui/artwork";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/format";
import { usePlayerStore } from "@/store/player-store";
import type { Track } from "@/types/music";

export function TrackList({ tracks }: { tracks: readonly Track[] }) {
  const currentId = usePlayerStore((s) => s.queue[s.currentIndex]?.id ?? null);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  return (
    <ol className="flex flex-col">
      {tracks.map((track, i) => {
        const active = track.id === currentId;
        const playingNow = active && isPlaying;
        return (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => (active ? togglePlay() : playQueue(tracks, i))}
              aria-label={`${playingNow ? "Pause" : "Play"} ${track.title} by ${track.artistName}`}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-2"
            >
              <span className="grid w-6 place-items-center text-sm tabular-nums text-muted">
                {playingNow ? (
                  <Pause
                    className="size-4 fill-current text-accent"
                    aria-hidden
                  />
                ) : (
                  i + 1
                )}
              </span>
              <Artwork
                src={track.coverUrl}
                alt=""
                className="size-10 shrink-0 rounded-md"
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate font-medium",
                    active && "text-accent",
                  )}
                >
                  {track.title}
                </span>
                <span className="block truncate text-sm text-muted">
                  {track.artistName}
                </span>
              </span>
              <span className="text-sm tabular-nums text-muted">
                {formatTime(track.duration)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
