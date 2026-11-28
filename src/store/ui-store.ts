import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  queueOpen: boolean;
  toggleSidebar: () => void;
  setMobileDrawer: (open: boolean) => void;
  toggleQueue: () => void;
  setQueueOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      mobileDrawerOpen: false,
      queueOpen: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setMobileDrawer: (mobileDrawerOpen) => set({ mobileDrawerOpen }),
      toggleQueue: () => set({ queueOpen: !get().queueOpen }),
      setQueueOpen: (queueOpen) => set({ queueOpen }),
    }),
    {
      name: "soundwave-ui",
      skipHydration: true,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);
