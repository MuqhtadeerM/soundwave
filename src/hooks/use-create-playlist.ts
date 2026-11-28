"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlaylistStore } from "@/store/playlist-store";
import { toast } from "@/store/toast-store";

/** Creates a playlist with a default name and opens it, ready to rename. */
export function useCreatePlaylist(): () => void {
  const router = useRouter();
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);

  return useCallback(() => {
    const id = createPlaylist();
    toast("Playlist created");
    router.push(`/playlists/${id}`);
  }, [createPlaylist, router]);
}
