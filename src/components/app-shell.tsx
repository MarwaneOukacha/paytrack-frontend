"use client";

import { useCallback, useState, type ReactNode } from "react";
import { PaymentsProvider } from "./payments-provider";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { Drawer } from "./drawer";

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <PaymentsProvider>
      <Sidebar />
      <TopBar onOpen={() => setDrawerOpen(true)} />
      <Drawer open={drawerOpen} onClose={closeDrawer} />
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:pt-8">
          {children}
        </main>
      </div>
    </PaymentsProvider>
  );
}