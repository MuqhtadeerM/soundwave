"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { NavLink } from "@/components/navigation/nav-link";
import { CreatePlaylistButton } from "@/components/playlists/create-playlist-button";
import { SidebarPlaylists } from "@/components/playlists/sidebar-playlists";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/store/ui-store";

export function MobileNav() {
  const pathname = usePathname();
  const open = useUiStore((s) => s.mobileDrawerOpen);
  const setOpen = useUiStore((s) => s.setMobileDrawer);
  const primary = NAV_ITEMS.filter((i) => i.mobilePrimary);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <nav
        aria-label="Mobile"
        className="relative z-40 flex h-16 shrink-0 items-center justify-around border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {primary.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium",
                active ? "text-accent" : "text-muted",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {item.label.replace("Your ", "")}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex min-w-14 flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium text-muted"
        >
          <Menu className="size-5" aria-hidden />
          More
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-4 bg-surface p-4 md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Soundwave</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid size-10 place-items-center rounded-xl text-muted hover:bg-surface-2"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <nav aria-label="All pages" className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </nav>

              <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-border pt-4">
                <CreatePlaylistButton onCreated={() => setOpen(false)} />
                <SidebarPlaylists onNavigate={() => setOpen(false)} />
              </div>

              <div>
                <ThemeToggle />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
