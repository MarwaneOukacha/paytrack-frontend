"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { PaymentsProvider } from "./payments-provider";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { AuthLoading, useAuth } from "./auth-provider";

const PUBLIC_PATHS = ["/login"];

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const publicRoute = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !publicRoute) {
      const returnUrl = `${pathname}${window.location.search}`;
      router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [pathname, publicRoute, router, status]);

  if (publicRoute) return <>{children}</>;
  if (status !== "authenticated") return <AuthLoading />;

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
            "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[6px] lg:hidden",
            drawerOpen ? "block" : "hidden"
          )}
          onClick={closeDrawer}
          aria-hidden
        />
      </div>
    </PaymentsProvider>
  );
}
