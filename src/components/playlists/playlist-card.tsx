import Link from "next/link";
import { PlaylistCover } from "./playlist-cover";
import type { Playlist } from "@/types/playlist";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const count = playlist.trackIds.length;
  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="group block rounded-2xl bg-surface p-3 transition-colors hover:bg-surface-2"
    >
      <PlaylistCover
        playlist={playlist}
        className="aspect-square w-full rounded-xl shadow-lg"
      />
      <p className="mt-3 truncate font-semibold">{playlist.name}</p>
      <p className="text-sm text-muted">
        {count} {count === 1 ? "song" : "songs"}
      </p>
    </Link>
  );
}
