"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronLeft,
  Ellipsis,
  ListEnd,
  ListPlus,
  ListStart,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import { usePlaylistStore } from "@/store/playlist-store";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/utils/cn";
import type { Track } from "@/types/music";

const MENU_WIDTH = 240;
const MENU_MAX_HEIGHT = 320;

interface MenuPosition {
  left: number;
  top?: number;
  bottom?: number;
}

interface MenuItemProps {
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
}

function MenuItem({
  icon: Icon,
  onClick,
  danger = false,
  trailing,
  children,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none",
        danger && "text-red-500",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </button>
  );
}

interface TrackMenuProps {
  track: Track;
  onRemove?: () => void; // provided inside a playlist: adds "Remove from this playlist"
}

export function TrackMenu({ track, onRemove }: TrackMenuProps) {
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [view, setView] = useState<"main" | "playlists">("main");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const playlists = usePlaylistStore((s) => s.playlists);
  const addTrack = usePlaylistStore((s) => s.addTrack);
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const playNext = usePlayerStore((s) => s.playNext);

  const open = position !== null;

  const close = useCallback((restoreFocus = true): void => {
    setPosition(null);
    setView("main");
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const toggle = (): void => {
    if (open) {
      close();
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 8,
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    setPosition(
      spaceBelow >= MENU_MAX_HEIGHT || spaceBelow >= rect.top
        ? { left, top: rect.bottom + 4 }
        : { left, bottom: window.innerHeight - rect.top + 4 },
    );
  };

  // Dismiss on outside click, Escape, resize, or scrolling the page behind it
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent): void => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      close(false);
    };
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") close();
    };
    const onScroll = (e: Event): void => {
      if (e.target instanceof Node && menuRef.current?.contains(e.target))
        return;
      close(false);
    };
    const onResize = (): void => close(false);

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, close]);

  // Move focus into the menu when it opens or switches view
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open, view]);

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "ArrowDown"
        ? (i + 1) % items.length
        : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const addToPlaylist = (playlistId: string, name: string): void => {
    const result = addTrack(playlistId, track.id);
    toast(result === "added" ? `Added to “${name}”` : `Already in “${name}”`);
    close();
  };

  const addToNewPlaylist = (): void => {
    const id = createPlaylist();
    addTrack(id, track.id);
    const name =
      usePlaylistStore.getState().playlists.find((p) => p.id === id)?.name ??
      "new playlist";
    toast(`Added to “${name}”`);
    close();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label={`More actions for ${track.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
      >
        <Ellipsis className="size-5" aria-hidden />
      </button>

      {position
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={`Actions for ${track.title}`}
              onKeyDown={onMenuKeyDown}
              onPointerDown={(e) => e.stopPropagation()} // portal events bubble through React; keep rows from reacting
              style={{
                position: "fixed",
                left: position.left,
                top: position.top,
                bottom: position.bottom,
                width: MENU_WIDTH,
              }}
              className="z-[70] max-h-80 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-2xl"
            >
              {view === "main" ? (
                <>
                  <MenuItem
                    icon={ListStart}
                    onClick={() => {
                      playNext(track);
                      toast("Playing next");
                      close();
                    }}
                  >
                    Play next
                  </MenuItem>
                  <MenuItem
                    icon={ListEnd}
                    onClick={() => {
                      addToQueue(track);
                      toast("Added to queue");
                      close();
                    }}
                  >
                    Add to queue
                  </MenuItem>
                  <MenuItem
                    icon={ListPlus}
                    onClick={() => setView("playlists")}
                  >
                    Add to playlist…
                  </MenuItem>
                  {onRemove ? (
                    <MenuItem
                      icon={Trash2}
                      danger
                      onClick={() => {
                        onRemove();
                        close();
                      }}
                    >
                      Remove from this playlist
                    </MenuItem>
                  ) : null}
                </>
              ) : (
                <>
                  <MenuItem icon={ChevronLeft} onClick={() => setView("main")}>
                    Add to playlist
                  </MenuItem>
                  <div role="separator" className="my-1 h-px bg-border" />
                  <MenuItem icon={Plus} onClick={addToNewPlaylist}>
                    New playlist
                  </MenuItem>
                  {playlists.map((p) => (
                    <MenuItem
                      key={p.id}
                      icon={ListPlus}
                      onClick={() => addToPlaylist(p.id, p.name)}
                      trailing={
                        p.trackIds.includes(track.id) ? (
                          <Check
                            className="size-4 shrink-0 text-accent"
                            aria-label="Already added"
                          />
                        ) : null
                      }
                    >
                      {p.name}
                    </MenuItem>
                  ))}
                </>
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
