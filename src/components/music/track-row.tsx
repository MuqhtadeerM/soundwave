"use client";

import { useId, type ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Pause } from "lucide-react";
import { Artwork } from "@/components/ui/artwork";
import type { TrackDragData } from "@/lib/dnd/drag-data";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/format";
import { usePlayerStore } from "@/store/player-store";
import type { Track } from "@/types/music";
import { TrackMenu } from "./track-menu";

interface TrackRowProps {
  track: Track;
  index: number;
  context: readonly Track[]; // what becomes the queue when this row is played
  handle?: ReactNode; // sortable drag handle (playlists)
  onRemove?: () => void; // shows "Remove from this playlist" in the menu
  draggable?: boolean; // can be dragged onto a sidebar playlist
}

export function TrackRow({
  track,
  index,
  context,
  handle,
  onRemove,
  draggable = false,
}: TrackRowProps) {
  const dragId = useId();
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: `track:${dragId}`,
    data: { type: "track", track } satisfies TrackDragData,
    disabled: !draggable,
  });

  const currentId = usePlayerStore(
    (s) => s.queue[s.currentIndex]?.track.id ?? null,
  );
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const active = track.id === currentId;
  const playingNow = active && isPlaying;

  const onPlay = (): void => {
    if (active) togglePlay();
    else playQueue(context, index);
  };

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      className={cn(
        "flex items-center gap-1 rounded-xl pr-1 transition-colors focus-within:bg-surface-2 hover:bg-surface-2",
        isDragging && "opacity-40",
        draggable && "select-none",
      )}
    >
      {handle}
      <button
        type="button"
        onClick={onPlay}
        aria-label={`${playingNow ? "Pause" : "Play"} ${track.title} by ${track.artistName}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-2 pl-3 text-left"
      >
        <span className="grid w-6 shrink-0 place-items-center text-sm tabular-nums text-muted">
          {playingNow ? (
            <Pause className="size-4 fill-current text-accent" aria-hidden />
          ) : (
            index + 1
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
        <span className="hidden text-sm tabular-nums text-muted sm:block">
          {formatTime(track.duration)}
        </span>
      </button>
      <TrackMenu track={track} onRemove={onRemove} />
    </div>
  );
}
