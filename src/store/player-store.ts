import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAudio, tryPlay } from "@/lib/audio/audio-engine";
import { moveItem } from "@/lib/utils/array";
import { makeUid } from "@/lib/utils/id";
import type { Track } from "@/types/music";
import type { PlayerStatus, QueueItem, RepeatMode } from "@/types/player";

interface PlayerState {
  queue: QueueItem[];
  currentIndex: number; // -1 when nothing is loaded
  isPlaying: boolean; // user intent; the controller applies it to the audio element
  status: PlayerStatus;
  errorMessage: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  loadToken: number; // bump to force the current track to (re)load
}

interface PlayerActions {
  playQueue: (tracks: readonly Track[], startIndex?: number) => void;
  playShuffled: (tracks: readonly Track[]) => void;
  playQueueIndex: (index: number) => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (uid: string) => void;
  clearQueue: () => void;
  moveQueueItem: (from: number, to: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  handleEnded: () => void;
  retry: () => void;
  // Called by the audio controller only
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setStatus: (status: PlayerStatus, message?: string) => void;
  setPlaying: (playing: boolean) => void;
}

export type PlayerStore = PlayerState & PlayerActions;

type PersistedPlayer = Pick<
  PlayerState,
  "queue" | "currentIndex" | "volume" | "muted" | "shuffle" | "repeat"
>;

const REPEAT_ORDER: readonly RepeatMode[] = ["off", "all", "one"];

const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

const toItems = (tracks: readonly Track[]): QueueItem[] =>
  tracks.map((track) => ({ uid: makeUid(), track }));

function isTrack(v: unknown): v is Track {
  if (typeof v !== "object" || v === null) return false;
  const t = v as Record<string, unknown>;
  const strings = [
    "id",
    "title",
    "artistId",
    "artistName",
    "albumId",
    "albumTitle",
    "coverUrl",
    "src",
    "genre",
  ];
  return (
    strings.every((k) => typeof t[k] === "string") &&
    typeof t.duration === "number"
  );
}

function isQueueItem(v: unknown): v is QueueItem {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.uid === "string" && isTrack(r.track);
}

function resolveNextIndex(
  s: Pick<PlayerState, "queue" | "currentIndex" | "shuffle" | "repeat">,
): number | null {
  const len = s.queue.length;
  if (len === 0) return null;
  if (s.shuffle && len > 1) {
    let i = s.currentIndex;
    while (i === s.currentIndex) i = Math.floor(Math.random() * len);
    return i;
  }
  const n = s.currentIndex + 1;
  if (n < len) return n;
  return s.repeat === "all" ? 0 : null;
}

/** Point the player at a queue index. `playing` = start playback immediately. */
const startAt = (
  s: PlayerState,
  index: number,
  playing = true,
): Partial<PlayerState> => ({
  currentIndex: index,
  isPlaying: playing,
  currentTime: 0,
  duration: 0,
  status: "loading",
  errorMessage: null,
  loadToken: s.loadToken + 1,
});

export const selectCurrentTrack = (s: PlayerStore): Track | null =>
  s.queue[s.currentIndex]?.track ?? null;

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      status: "idle",
      errorMessage: null,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      muted: false,
      shuffle: false,
      repeat: "off",
      loadToken: 0,

      playQueue: (tracks, startIndex = 0) => {
        if (tracks.length === 0) return;
        const index = clamp(startIndex, 0, tracks.length - 1);
        set((s) => ({ queue: toItems(tracks), ...startAt(s, index) }));
      },

      playShuffled: (tracks) => {
        if (tracks.length === 0) return;
        const index = Math.floor(Math.random() * tracks.length);
        set((s) => ({
          shuffle: true,
          queue: toItems(tracks),
          ...startAt(s, index),
        }));
      },

      playQueueIndex: (index) => {
        if (index < 0 || index >= get().queue.length) return;
        set((s) => startAt(s, index));
      },

      addToQueue: (track) =>
        set((s) => {
          const queue = [...s.queue, { uid: makeUid(), track }];
          // Nothing loaded yet: load the first item, paused
          return s.currentIndex === -1
            ? { queue, ...startAt(s, 0, false) }
            : { queue };
        }),

      playNext: (track) =>
        set((s) => {
          const item: QueueItem = { uid: makeUid(), track };
          if (s.currentIndex === -1) {
            return { queue: [item, ...s.queue], ...startAt(s, 0, false) };
          }
          const queue = [...s.queue];
          queue.splice(s.currentIndex + 1, 0, item);
          return { queue };
        }),

      removeFromQueue: (uid) =>
        set((s) => {
          const idx = s.queue.findIndex((i) => i.uid === uid);
          if (idx === -1) return {};
          const queue = s.queue.filter((i) => i.uid !== uid);

          if (queue.length === 0) {
            return {
              queue,
              currentIndex: -1,
              isPlaying: false,
              status: "idle" as PlayerStatus,
              errorMessage: null,
              currentTime: 0,
              duration: 0,
            };
          }
          if (idx < s.currentIndex)
            return { queue, currentIndex: s.currentIndex - 1 };
          if (idx > s.currentIndex) return { queue };

          // Removed the current item: the next one takes its place.
          // If it was the last, land on the new last item, paused.
          const hasNext = idx < queue.length;
          const newIndex = hasNext ? idx : queue.length - 1;
          return { queue, ...startAt(s, newIndex, s.isPlaying && hasNext) };
        }),

      // Keeps the playing track, drops everything else
      clearQueue: () =>
        set((s) => {
          const current = s.queue[s.currentIndex];
          return current
            ? { queue: [current], currentIndex: 0 }
            : { queue: [], currentIndex: -1 };
        }),

      moveQueueItem: (from, to) =>
        set((s) => {
          const currentUid = s.queue[s.currentIndex]?.uid;
          const queue = moveItem(s.queue, from, to);
          const currentIndex = currentUid
            ? queue.findIndex((i) => i.uid === currentUid)
            : -1;
          return { queue, currentIndex };
        }),

      togglePlay: () => {
        const s = get();
        if (!selectCurrentTrack(s)) return;
        if (s.status === "error") {
          get().retry();
          return;
        }
        set({ isPlaying: !s.isPlaying });
      },

      next: () => {
        const s = get();
        const idx = resolveNextIndex(s);
        if (idx === null) {
          // End of queue with repeat off: stop and rewind
          const audio = getAudio();
          audio.pause();
          audio.currentTime = 0;
          set({ isPlaying: false, currentTime: 0 });
          return;
        }
        set((cur) => startAt(cur, idx));
      },

      previous: () => {
        const s = get();
        if (s.currentIndex < 0) return;
        if (s.currentTime > 3) {
          get().seek(0);
          return;
        }
        const idx = s.currentIndex - 1;
        if (idx >= 0) {
          set((cur) => startAt(cur, idx));
        } else if (s.repeat === "all" && s.queue.length > 1) {
          set((cur) => startAt(cur, s.queue.length - 1));
        } else {
          get().seek(0);
        }
      },

      seek: (time) => {
        const audio = getAudio();
        const known = Number.isFinite(audio.duration)
          ? audio.duration
          : get().duration;
        const t = known > 0 ? clamp(time, 0, known) : Math.max(0, time);
        audio.currentTime = t;
        set({ currentTime: t });
      },

      setVolume: (volume) => {
        const v = clamp(volume, 0, 1);
        set({ volume: v, muted: v > 0 ? false : get().muted });
      },

      toggleMute: () => set({ muted: !get().muted }),
      toggleShuffle: () => set({ shuffle: !get().shuffle }),
      cycleRepeat: () => {
        const i = REPEAT_ORDER.indexOf(get().repeat);
        set({ repeat: REPEAT_ORDER[(i + 1) % REPEAT_ORDER.length] ?? "off" });
      },

      handleEnded: () => {
        if (get().repeat === "one") {
          const audio = getAudio();
          audio.currentTime = 0;
          void tryPlay(audio);
          return;
        }
        get().next();
      },

      retry: () => {
        if (!selectCurrentTrack(get())) return;
        set((cur) => startAt(cur, cur.currentIndex));
      },

      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setStatus: (status, message) =>
        set({
          status,
          errorMessage:
            status === "error" ? (message ?? "Something went wrong.") : null,
        }),
      setPlaying: (isPlaying) => set({ isPlaying }),
    }),
    {
      name: "soundwave-player",
      skipHydration: true,
      partialize: (s): PersistedPlayer => ({
        queue: s.queue,
        currentIndex: s.currentIndex,
        volume: s.volume,
        muted: s.muted,
        shuffle: s.shuffle,
        repeat: s.repeat,
      }),
      // Never trust stored data blindly, and never restore into a playing state
      merge: (persisted, current) => {
        const p = persisted as Partial<PersistedPlayer> | undefined;
        if (!p) return current;
        const raw: unknown = p.queue;
        const queue = Array.isArray(raw) && raw.every(isQueueItem) ? raw : [];
        const index =
          typeof p.currentIndex === "number" &&
          p.currentIndex >= 0 &&
          p.currentIndex < queue.length
            ? p.currentIndex
            : -1;
        return {
          ...current,
          queue,
          currentIndex: index,
          volume:
            typeof p.volume === "number"
              ? clamp(p.volume, 0, 1)
              : current.volume,
          muted: p.muted === true,
          shuffle: p.shuffle === true,
          repeat: p.repeat === "all" || p.repeat === "one" ? p.repeat : "off",
        };
      },
    },
  ),
);
