"use client";

import { useEffect, type ReactNode } from "react";
import { AudioController } from "@/components/player/audio-controller";
import { useHydrationStore } from "@/store/hydration-store";
import { usePlayerStore } from "@/store/player-store";
import { usePlaylistStore } from "@/store/playlist-store";
import { useThemeStore } from "@/store/theme-store";
import { useUiStore } from "@/store/ui-store";

export function Providers({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    void Promise.all([
      useThemeStore.persist.rehydrate(),
      useUiStore.persist.rehydrate(),
      usePlayerStore.persist.rehydrate(),
      usePlaylistStore.persist.rehydrate(),
    ]).then(() => useHydrationStore.getState().markHydrated());
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
