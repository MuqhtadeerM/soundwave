import type { Track } from "@/types/music";

export interface TrackDragData {
  type: "track";
  track: Track;
}

export interface PlaylistDropData {
  type: "playlist";
  playlistId: string;
}

export function isTrackDragData(v: unknown): v is TrackDragData {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return r.type === "track" && typeof r.track === "object" && r.track !== null;
}

export function isPlaylistDropData(v: unknown): v is PlaylistDropData {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return r.type === "playlist" && typeof r.playlistId === "string";
}
