"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function TopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="sticky top-3 z-30 mb-3 flex items-center gap-3 rounded-[18px] border border-line bg-card/90 px-4 py-3 shadow-card backdrop-blur-md lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Ouvrir le menu"
        className="grid size-9 place-items-center rounded-[11px] border border-line bg-card text-ink transition-colors hover:border-faint"
      >
        <Menu size={18} />
      </button>
      <span className="grid size-8 place-items-center rounded-[9px] bg-gradient-to-br from-blue via-blue-dark to-[#5b21b6] text-sm font-bold text-white ring-1 ring-inset ring-white/25">
        P
      </span>
      <span className="text-[15px] font-bold tracking-tight">PayTrack</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}