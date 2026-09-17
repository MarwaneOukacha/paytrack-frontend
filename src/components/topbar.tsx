"use client";

import { Menu } from "lucide-react";

export function TopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="mb-3 flex items-center gap-3 rounded-[18px] bg-card px-4 py-3.5 shadow-card lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Ouvrir le menu"
        className="grid size-9 place-items-center rounded-[10px] border border-line text-ink transition-colors hover:border-faint"
      >
        <Menu size={18} />
      </button>
      <span className="text-[15px] font-bold tracking-tight">PayTrack</span>
    </header>
  );
}