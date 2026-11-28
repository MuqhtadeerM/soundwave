"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ImagePlus,
  ListMusic,
  Pencil,
  Play,
  Shuffle,
  Trash2,
} from "lucide-react";
import { TrackRow } from "@/components/music/track-row";
import { PlaylistCover } from "@/components/playlists/playlist-cover";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableList } from "@/components/ui/sortable-list";
import { getTrackById } from "@/data/tracks";
import { formatTotal } from "@/lib/utils/format";
import { fileToCoverDataUrl } from "@/lib/utils/image";
import { useHydrationStore } from "@/store/hydration-store";
import { usePlayerStore } from "@/store/player-store";
import { usePlaylistStore } from "@/store/playlist-store";
import { toast } from "@/store/toast-store";
import type { Track } from "@/types/music";

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const hydrated = useHydrationStore((s) => s.hydrated);
  const playlist = usePlaylistStore((s) =>
    s.playlists.find((p) => p.id === id),
  );
  const renamePlaylist = usePlaylistStore((s) => s.renamePlaylist);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
  const removeTrack = usePlaylistStore((s) => s.removeTrack);
  const moveTrack = usePlaylistStore((s) => s.moveTrack);
  const setCover = usePlaylistStore((s) => s.setCover);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const playShuffled = usePlayerStore((s) => s.playShuffled);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const cancelledRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tracks = useMemo<Track[]>(
    () =>
      playlist
        ? playlist.trackIds.flatMap((tid) => {
            const t = getTrackById(tid);
            return t ? [t] : [];
          })
        : [],
    [playlist],
  );

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-6 md:flex-row md:items-end">
        <Skeleton className="size-48 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <EmptyState
        icon={ListMusic}
        title="Playlist not found"
        description="It may have been deleted."
      >
        <Link
          href="/playlists"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to playlists
        </Link>
      </EmptyState>
    );
  }

  const totalSeconds = tracks.reduce((sum, t) => sum + t.duration, 0);

  const startEdit = (): void => {
    cancelledRef.current = false;
    setDraft(playlist.name);
    setEditing(true);
  };

  const commitEdit = (): void => {
    if (cancelledRef.current) return;
    const name = draft.trim();
    if (name && name !== playlist.name) renamePlaylist(playlist.id, name);
    setEditing(false);
  };

  const onCoverChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    try {
      setCover(playlist.id, await fileToCoverDataUrl(file));
      toast("Cover updated");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn’t use that image.");
    }
  };

  return (
    <>
      <header className="flex flex-col gap-6 md:flex-row md:items-end">
        <div className="group relative size-48 shrink-0 self-center md:self-auto">
          <PlaylistCover
            playlist={playlist}
            className="size-full rounded-2xl shadow-2xl"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Change playlist cover"
            className="absolute inset-0 grid place-items-center rounded-2xl bg-black/55 text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          >
            <span className="flex flex-col items-center gap-1 text-sm font-semibold">
              <ImagePlus className="size-7" aria-hidden />
              Change cover
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onCoverChange(e)}
            aria-hidden
            tabIndex={-1}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Playlist
          </p>
          {editing ? (
            <input
              autoFocus
              value={draft}
              maxLength={60}
              aria-label="Playlist name"
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") {
                  cancelledRef.current = true;
                  setEditing(false);
                }
              }}
              className="mt-1 w-full border-b-2 border-accent bg-transparent text-3xl font-bold tracking-tight outline-none md:text-5xl"
            />
          ) : (
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-5xl">
              <button
                type="button"
                onClick={startEdit}
                title="Rename playlist"
                className="group/name flex max-w-full items-center gap-3 text-left"
              >
                <span className="truncate">{playlist.name}</span>
                <Pencil
                  className="size-5 shrink-0 text-muted opacity-0 transition-opacity group-hover/name:opacity-100 group-focus-visible/name:opacity-100"
                  aria-hidden
                />
                <span className="sr-only">Rename</span>
              </button>
            </h1>
          )}
          <p className="mt-2 text-sm text-muted">
            {tracks.length} {tracks.length === 1 ? "song" : "songs"}
            {tracks.length > 0 ? ` · about ${formatTotal(totalSeconds)}` : ""}
          </p>
        </div>
      </header>

      <div className="my-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => playQueue(tracks, 0)}
          disabled={tracks.length === 0}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Play className="size-5 fill-current" aria-hidden />
          Play
        </button>
        <button
          type="button"
          onClick={() => playShuffled(tracks)}
          disabled={tracks.length === 0}
          className="flex items-center gap-2 rounded-full border border-border px-5 py-3 font-semibold transition-colors hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Shuffle className="size-5" aria-hidden />
          Shuffle
        </button>
        {playlist.coverUrl ? (
          <button
            type="button"
            onClick={() => setCover(playlist.id, null)}
            className="rounded-full px-4 py-3 text-sm font-semibold text-muted transition-colors hover:text-fg"
          >
            Remove cover
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Delete playlist"
          title="Delete playlist"
          className="ml-auto grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-red-500"
        >
          <Trash2 className="size-5" aria-hidden />
        </button>
      </div>

      {tracks.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="This playlist is empty"
          description="Add songs from the ⋯ menu on any track, or drag a track onto this playlist in the sidebar."
        >
          <Link
            href="/"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse music
          </Link>
        </EmptyState>
      ) : (
        <SortableList
          id="playlist-sort"
          items={tracks}
          getId={(t) => t.id}
          onMove={(activeId, overId) =>
            moveTrack(playlist.id, activeId, overId)
          }
          className="flex flex-col"
          renderItem={(track, index, handle) => (
            <TrackRow
              track={track}
              index={index}
              context={tracks}
              handle={handle}
              onRemove={() => {
                removeTrack(playlist.id, track.id);
                toast(`Removed from “${playlist.name}”`);
              }}
            />
          )}
        />
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete “${playlist.name}”?`}
        message="This removes the playlist but not the songs themselves."
        confirmLabel="Delete"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          deletePlaylist(playlist.id);
          toast("Playlist deleted");
          router.push("/playlists");
        }}
      />
    </>
  );
}
