"use client";

import { ListMusic, Plus } from "lucide-react";
import { PlaylistCard } from "@/components/playlists/playlist-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreatePlaylist } from "@/hooks/use-create-playlist";
import { useHydrationStore } from "@/store/hydration-store";
import { usePlaylistStore } from "@/store/playlist-store";

const GRID =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

export default function PlaylistsPage() {
  const hydrated = useHydrationStore((s) => s.hydrated);
  const playlists = usePlaylistStore((s) => s.playlists);
  const create = useCreatePlaylist();

  const createButton = (
    <button
      type="button"
      onClick={create}
      className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
    >
      <Plus className="size-4" aria-hidden />
      New playlist
    </button>
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Playlists"
          description="Create and manage your playlists."
        />
        {createButton}
      </div>

      {!hydrated ? (
        <div className={GRID}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="rounded-2xl bg-surface p-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No playlists yet"
          description="Create your first playlist, then add songs from the ⋯ menu or by dragging them in."
        >
          {createButton}
        </EmptyState>
      ) : (
        <div className={GRID}>
          {playlists.map((p) => (
            <PlaylistCard key={p.id} playlist={p} />
          ))}
        </div>
      )}
    </>
  );
}
