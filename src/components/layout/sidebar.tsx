"use client";

import Link from "next/link";
import { AudioWaveform, ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { NavLink } from "@/components/navigation/nav-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils/cn";

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

      <div className="mt-2 border-t border-border pt-4">
        {/* Phase 3 turns this into a real "create playlist" action */}
        <Link
          href="/playlists"
          title={collapsed ? "Create playlist" : undefined}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-2"
        >
          <span className="grid size-5 shrink-0 place-items-center rounded-md bg-fg text-bg">
            <Plus className="size-4" aria-hidden />
          </span>
          <span className={cn(collapsed && "sr-only")}>Create Playlist</span>
        </Link>
        {!collapsed ? (
          <p className="px-3 pt-3 text-xs text-muted">
            Your playlists will appear here.
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-auto flex items-center gap-1",
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
