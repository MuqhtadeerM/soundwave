"use client";

import { useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Artwork } from "@/components/ui/artwork";
import { isPlaylistDropData, isTrackDragData } from "@/lib/dnd/drag-data";
import { usePlaylistStore } from "@/store/playlist-store";
import { toast } from "@/store/toast-store";
import type { Track } from "@/types/music";

export function TrackDndProvider({ children }: { children: ReactNode }) {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = ({ active }: DragStartEvent): void => {
    const data: unknown = active.data.current;
    setActiveTrack(isTrackDragData(data) ? data.track : null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    setActiveTrack(null);
    const dragged: unknown = active.data.current;
    const target: unknown = over?.data.current;
    if (!isTrackDragData(dragged) || !isPlaylistDropData(target)) return;

    const { playlists, addTrack } = usePlaylistStore.getState();
    const playlist = playlists.find((p) => p.id === target.playlistId);
    if (!playlist) return;
    const result = addTrack(playlist.id, dragged.track.id);
    toast(
      result === "added"
        ? `Added to “${playlist.name}”`
        : `Already in “${playlist.name}”`,
    );
  };

  return (
    <DndContext
      id="track-dnd"
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTrack(null)}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeTrack ? (
          <div className="pointer-events-none flex items-center gap-2 rounded-xl border border-border bg-surface-2 py-1.5 pl-1.5 pr-4 shadow-xl">
            <Artwork
              src={activeTrack.coverUrl}
              alt=""
              className="size-8 rounded-md"
            />
            <span className="max-w-48 truncate text-sm font-medium">
              {activeTrack.title}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
