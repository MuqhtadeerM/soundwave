"use client";

import { useEffect, type ReactNode } from "react";
import { AudioController } from "@/components/player/audio-controller";
import { usePlayerStore } from "@/store/player-store";
import { useThemeStore } from "@/store/theme-store";
import { useUiStore } from "@/store/ui-store";

export function Providers({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    void useThemeStore.persist.rehydrate();
    void useUiStore.persist.rehydrate();
    void usePlayerStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      <AudioController />
      {children}
    </>
  );
}
