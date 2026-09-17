"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("paytrack-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored ? stored === "dark" : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("paytrack-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"}
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-faint hover:text-ink"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}