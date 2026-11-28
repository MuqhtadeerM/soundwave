"use client";

import Link from "next/link";
import { AudioWaveform, ChevronsLeft, ChevronsRight } from "lucide-react";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { NavLink } from "@/components/navigation/nav-link";
import { CreatePlaylistButton } from "@/components/playlists/create-playlist-button";
import { SidebarPlaylists } from "@/components/playlists/sidebar-playlists";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/store/ui-store";

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "hidden shrink-0 flex-col gap-4 border-r border-border bg-surface p-3 transition-[width] duration-200 md:flex",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-3 px-2 py-2"
        aria-label="Soundwave home"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-white">
          <AudioWaveform className="size-5" aria-hidden />
        </span>
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            collapsed && "sr-only",
          )}
        >
          Soundwave
        </span>
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-border pt-4">
        <CreatePlaylistButton collapsed={collapsed} />
        <SidebarPlaylists collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "flex items-center gap-1",
          collapsed ? "flex-col" : "justify-between",
        )}
      >
        <ThemeToggle />
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {collapsed ? (
            <ChevronsRight className="size-5" aria-hidden />
          ) : (
            <ChevronsLeft className="size-5" aria-hidden />
          )}
        </button>
      </div>
    </aside>
  );
}
