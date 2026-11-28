import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTrackById } from "@/data/tracks";
import { moveItem } from "@/lib/utils/array";
import { makeUid } from "@/lib/utils/id";
import type { Playlist } from "@/types/playlist";

export type AddTrackResult = "added" | "exists" | "missing";

interface PlaylistState {
  playlists: Playlist[];
}

interface PlaylistActions {
  createPlaylist: (name?: string) => string;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addTrack: (id: string, trackId: string) => AddTrackResult;
  removeTrack: (id: string, trackId: string) => void;
  moveTrack: (id: string, activeTrackId: string, overTrackId: string) => void;
  setCover: (id: string, coverUrl: string | null) => void;
}

type PlaylistStore = PlaylistState & PlaylistActions;

function nextDefaultName(existing: readonly Playlist[]): string {
  const names = new Set(existing.map((p) => p.name));
  let n = existing.length + 1;
  while (names.has(`My Playlist #${n}`)) n += 1;
  return `My Playlist #${n}`;
}

function isPlaylist(v: unknown): v is Playlist {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    (r.coverUrl === null || typeof r.coverUrl === "string") &&
    Array.isArray(r.trackIds) &&
    r.trackIds.every((t) => typeof t === "string") &&
    typeof r.createdAt === "number" &&
    typeof r.updatedAt === "number"
  );
}

export const usePlaylistStore = create<PlaylistStore>()(
  persist(
    (set, get) => {
      const update = (id: string, fn: (p: Playlist) => Playlist): void =>
        set((s) => ({
          playlists: s.playlists.map((p) => (p.id === id ? fn(p) : p)),
        }));

      return {
        playlists: [],

        createPlaylist: (name) => {
          const now = Date.now();
          const playlist: Playlist = {
            id: makeUid(),
            name: name?.trim() || nextDefaultName(get().playlists),
            coverUrl: null,
            trackIds: [],
            createdAt: now,
            updatedAt: now,
          };
          set((s) => ({ playlists: [playlist, ...s.playlists] }));
          return playlist.id;
        },

        renamePlaylist: (id, name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          update(id, (p) => ({ ...p, name: trimmed, updatedAt: Date.now() }));
        },

        deletePlaylist: (id) =>
          set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),

        addTrack: (id, trackId) => {
          const playlist = get().playlists.find((p) => p.id === id);
          if (!playlist || !getTrackById(trackId)) return "missing";
          if (playlist.trackIds.includes(trackId)) return "exists";
          update(id, (p) => ({
            ...p,
            trackIds: [...p.trackIds, trackId],
            updatedAt: Date.now(),
          }));
          return "added";
        },

        removeTrack: (id, trackId) =>
          update(id, (p) => ({
            ...p,
            trackIds: p.trackIds.filter((t) => t !== trackId),
            updatedAt: Date.now(),
          })),

        moveTrack: (id, activeTrackId, overTrackId) =>
          update(id, (p) => {
            const from = p.trackIds.indexOf(activeTrackId);
            const to = p.trackIds.indexOf(overTrackId);
            if (from === -1 || to === -1) return p;
            return {
              ...p,
              trackIds: moveItem(p.trackIds, from, to),
              updatedAt: Date.now(),
            };
          }),

        setCover: (id, coverUrl) =>
          update(id, (p) => ({ ...p, coverUrl, updatedAt: Date.now() })),
      };
    },
    {
      name: "soundwave-playlists",
      skipHydration: true,
      partialize: (s) => ({ playlists: s.playlists }),
      merge: (persisted, current) => {
        const raw: unknown = (persisted as Partial<PlaylistState> | undefined)
          ?.playlists;
        const playlists = Array.isArray(raw) ? raw.filter(isPlaylist) : [];
        return { ...current, playlists };
      },
    },
  ),
);
