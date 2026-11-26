"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "./nav-items";

interface NavLinkProps {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavLink({ item, collapsed = false, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const active =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent/15 text-fg"
          : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <Icon
        className={cn("size-5 shrink-0", active && "text-accent")}
        aria-hidden
      />
      <span className={cn(collapsed && "sr-only")}>{item.label}</span>
    </Link>
  );
}
