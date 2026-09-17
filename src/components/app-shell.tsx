"use client";

import { useCallback, useState, type ReactNode } from "react";
import clsx from "clsx";
import { PaymentsProvider } from "./payments-provider";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <PaymentsProvider>
      <div className="shell">
        <Sidebar mobileOpen={drawerOpen} onClose={closeDrawer} />
        <div className="min-w-0 flex-1">
          <TopBar onOpen={() => setDrawerOpen(true)} />
          <main className="wrap w-full px-1 pb-10">{children}</main>
        </div>
        <div
          className={clsx(
            "fixed inset-0 z-40 bg-[rgba(15,23,42,0.45)] lg:hidden",
            drawerOpen ? "block" : "hidden"
          )}
          onClick={closeDrawer}
          aria-hidden
        />
      </div>
    </PaymentsProvider>
  );
}