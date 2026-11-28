"use client";

import { Plus } from "lucide-react";
import { useCreatePlaylist } from "@/hooks/use-create-playlist";
import { cn } from "@/lib/utils/cn";

interface CreatePlaylistButtonProps {
  collapsed?: boolean;
  onCreated?: () => void;
}

export function CreatePlaylistButton({
  collapsed = false,
  onCreated,
}: CreatePlaylistButtonProps) {
  const create = useCreatePlaylist();
  return (
    <button
      type="button"
      onClick={() => {
        create();
        onCreated?.();
      }}
      title={collapsed ? "Create playlist" : undefined}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-2"
    >
      <span className="grid size-5 shrink-0 place-items-center rounded-md bg-fg text-bg">
        <Plus className="size-4" aria-hidden />
      </span>
      <span className={cn(collapsed && "sr-only")}>Create Playlist</span>
    </button>
  );
}
