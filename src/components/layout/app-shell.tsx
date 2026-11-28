import type { ReactNode } from "react";
import { QueuePanel } from "@/components/queue/queue-panel";
import { PlayerBar } from "@/components/player/player-bar";
import { Toaster } from "@/components/ui/toaster";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { TrackDndProvider } from "./track-dnd-provider";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TrackDndProvider>
      <div className="flex h-dvh flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-6 md:px-8 md:pb-8">
            {children}
          </main>
          <QueuePanel />
        </div>
        <PlayerBar />
        <MobileNav />
      </div>
      <Toaster />
    </TrackDndProvider>
  );
}
