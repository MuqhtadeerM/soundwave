"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDroppable } from "@dnd-kit/core";
import type { PlaylistDropData } from "@/lib/dnd/drag-data";
import { cn } from "@/lib/utils/cn";
import { useHydrationStore } from "@/store/hydration-store";
import { usePlaylistStore } from "@/store/playlist-store";
import type { Playlist } from "@/types/playlist";
import { PlaylistCover } from "./playlist-cover";

interface PlaylistLinkProps {
  playlist: Playlist;
  collapsed: boolean;
  onNavigate?: () => void;
}

function PlaylistLink({ playlist, collapsed, onNavigate }: PlaylistLinkProps) {
  const pathname = usePathname();
  const href = `/playlists/${playlist.id}`;
  const active = pathname === href;
  const { setNodeRef, isOver } = useDroppable({
    id: `playlist:${playlist.id}`,
    data: {
      type: "playlist",
      playlistId: playlist.id,
    } satisfies PlaylistDropData,
  });

  return (
    <li ref={setNodeRef}>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        title={collapsed ? playlist.name : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm transition-colors",
          active
            ? "bg-accent/15 text-fg"
            : "text-muted hover:bg-surface-2 hover:text-fg",
          isOver && "bg-accent/25 text-fg ring-2 ring-accent",
        )}
      >
        <PlaylistCover
          playlist={playlist}
          className="size-8 shrink-0 rounded-md"
        />
        <span className={cn("truncate", collapsed && "sr-only")}>
          {playlist.name}
        </span>
      </Link>
    </li>
  );
}

interface SidebarPlaylistsProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarPlaylists({
  collapsed = false,
  onNavigate,
}: SidebarPlaylistsProps) {
  const hydrated = useHydrationStore((s) => s.hydrated);
  const playlists = usePlaylistStore((s) => s.playlists);

  if (!hydrated) return null;
  if (playlists.length === 0) {
    return collapsed ? null : (
      <p className="px-3 text-xs text-muted">
        Your playlists will appear here. Drag a track onto one to add it.
      </p>
    );
  }

  return (
    <ul
      aria-label="Your playlists"
      className="flex min-h-0 flex-col gap-0.5 overflow-y-auto"
    >
      {playlists.map((p) => (
        <PlaylistLink
          key={p.id}
          playlist={p}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}
