import type { Track } from "./music";

export type RepeatMode = "off" | "all" | "one";
export type PlayerStatus = "idle" | "loading" | "ready" | "error";

export interface QueueItem {
  uid: string; // unique per queue entry, so the same track can be queued twice
  track: Track;
}
