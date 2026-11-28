import type { ReactNode } from "react";
import { PlayerBar } from "@/components/player/player-bar";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-6 md:px-8 md:pb-8">
          {children}
        </main>
      </div>
      <PlayerBar />
      <MobileNav />
    </div>
  );
}
