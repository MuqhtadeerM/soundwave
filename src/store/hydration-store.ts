import { create } from "zustand";

interface HydrationState {
  hydrated: boolean;
  markHydrated: () => void;
}

export const useHydrationStore = create<HydrationState>()((set) => ({
  hydrated: false,
  markHydrated: () => set({ hydrated: true }),
}));
