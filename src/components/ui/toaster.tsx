"use client";

import { useToastStore } from "@/store/toast-store";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-36 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-28"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg shadow-lg"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
