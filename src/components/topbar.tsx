"use client";

import { Menu } from "lucide-react";

export function TopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-rule bg-surface px-4 py-3 lg:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpen}
          aria-label="Ouvrir le menu"
          className="grid size-9 place-items-center rounded border border-rule transition-colors hover:border-ink"
        >
          <Menu size={18} />
        </button>
        <span className="flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-surface dark:text-ink">
            PT
          </span>
          PayTrack
        </span>
      </div>
    </header>
  );
}