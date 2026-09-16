"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { NAV_GROUPS, SERVICES } from "@/lib/nav-config";
import { ThemeToggle } from "./theme-toggle";

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-surface transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-rule p-3">
          <span className="flex items-center gap-2 text-base font-bold tracking-tight">
            <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-surface dark:text-ink">
              PT
            </span>
            PayTrack
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="grid size-9 place-items-center rounded border border-rule transition-colors hover:border-ink"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nice-scroll flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-widest text-muted">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  if (item.soon) {
                    return (
                      <li
                        key={item.href}
                        className="flex items-center gap-2.5 px-2 py-2 text-sm text-muted/60"
                      >
                        <Icon size={16} strokeWidth={1.75} />
                        <span>{item.label}</span>
                        <span className="ml-auto rounded-full border border-rule px-1.5 py-px text-[10px] text-muted">
                          Bientôt
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={clsx(
                          "flex items-center gap-2.5 border-l-2 px-2 py-2 text-sm transition-colors",
                          active
                            ? "border-ink bg-ink/5 font-medium text-ink dark:border-dark-ink dark:bg-dark-ink/10"
                            : "border-transparent text-muted hover:border-rule hover:text-ink"
                        )}
                      >
                        <Icon
                          size={16}
                          strokeWidth={1.75}
                          className={clsx(
                            "transition-colors",
                            active ? "text-accent dark:text-dark-accent" : "text-muted/70"
                          )}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-rule px-5 py-4">
          <ul className="space-y-1 font-mono text-xs text-muted">
            {SERVICES.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-2">
                <span>{s.name}</span>
                <span className="tabular-nums">{s.port}</span>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}