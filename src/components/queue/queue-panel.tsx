"use client";

import { useEffect, useRef } from "react";
import { ListMusic, Volume2, X } from "lucide-react";
import { Artwork } from "@/components/ui/artwork";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { SortableList } from "@/components/ui/sortable-list";
import { cn } from "@/lib/utils/cn";
import { usePlayerStore } from "@/store/player-store";
import { useUiStore } from "@/store/ui-store";
import type { QueueItem } from "@/types/player";
import type { ReactNode } from "react";

interface QueueRowProps {
  item: QueueItem;
  active: boolean;
  handle: ReactNode;
  onPlay: () => void;
  onRemove: () => void;
}

function QueueRow({ item, active, handle, onPlay, onRemove }: QueueRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { track } = item;

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-1 rounded-xl pr-1 transition-colors hover:bg-surface-2",
        active && "bg-accent/15",
      )}
    >
      {handle}
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play ${track.title} by ${track.artistName}`}
        aria-current={active ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left"
      >
        <Artwork
          src={track.coverUrl}
          alt=""
          className="size-10 shrink-0 rounded-md"
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm font-medium",
              active && "text-accent",
            )}
          >
            {track.title}
          </span>
          <span className="block truncate text-xs text-muted">
            {track.artistName}
          </span>
        </span>
        {active ? (
          <Volume2
            className="size-4 shrink-0 text-accent"
            aria-label="Now playing"
          />
        ) : null}
      </button>
      <IconButton
        label={`Remove ${track.title} from queue`}
        onClick={onRemove}
        className="size-8"
      >
        <X className="size-4" aria-hidden />
      </IconButton>
    </div>
  );
}

export function QueuePanel() {
  const open = useUiStore((s) => s.queueOpen);
  const setOpen = useUiStore((s) => s.setQueueOpen);

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playQueueIndex = usePlayerStore((s) => s.playQueueIndex);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const moveQueueItem = usePlayerStore((s) => s.moveQueueItem);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const handleMove = (activeUid: string, overUid: string): void => {
    const from = queue.findIndex((i) => i.uid === activeUid);
    const to = queue.findIndex((i) => i.uid === overUid);
    if (from !== -1 && to !== -1) moveQueueItem(from, to);
  };

  return (
    <aside
      aria-label="Queue"
      className="fixed inset-0 z-50 flex flex-col bg-surface md:static md:z-auto md:w-80 md:shrink-0 md:border-l md:border-border"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-lg font-bold">Queue</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearQueue}
            disabled={queue.length <= 1}
            title="Remove everything except the current track"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:text-fg disabled:opacity-40 disabled:hover:text-muted"
          >
            Clear
          </button>
          <IconButton label="Close queue" onClick={() => setOpen(false)}>
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>
      </header>

      {queue.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={ListMusic}
            title="Your queue is empty"
            description="Play a track, or use the ⋯ menu on any song to add it here."
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <SortableList
            id="queue-sort"
            items={queue}
            getId={(i) => i.uid}
            onMove={handleMove}
            renderItem={(item, index, handle) => (
              <QueueRow
                item={item}
                active={index === currentIndex}
                handle={handle}
                onPlay={() =>
                  index === currentIndex ? togglePlay() : playQueueIndex(index)
                }
                onRemove={() => removeFromQueue(item.uid)}
              />
            )}
          />
        </div>
      )}
    </aside>
  );
}
