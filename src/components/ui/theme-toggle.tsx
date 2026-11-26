"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";

export function ThemeToggle() {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      className="grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {/* Both icons rendered; CSS picks one, so SSR and client always match */}
      <Sun className="hidden size-5 [[data-theme=dark]_&]:block" aria-hidden />
      <Moon
        className="hidden size-5 [[data-theme=light]_&]:block"
        aria-hidden
      />
    </button>
  );
}
