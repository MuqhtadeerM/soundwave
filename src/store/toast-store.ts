import { create } from "zustand";
import { makeUid } from "@/lib/utils/id";

interface Toast {
  id: string;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  show: (message) => {
    const id = makeUid();
    set({ toasts: [...get().toasts.slice(-2), { id, message }] });
    setTimeout(() => get().dismiss(id), 3000);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = (message: string): void =>
  useToastStore.getState().show(message);
