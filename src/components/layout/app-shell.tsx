import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      {/* pb leaves room for the mobile nav now and the player in Phase 2 */}
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-24 pt-6 md:px-8 md:pb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
