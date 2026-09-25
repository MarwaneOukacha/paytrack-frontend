"use client";

import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { user, signOut, status } = useAuth();

  if (status !== "authenticated" || !user) return null;

  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "P";

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span
          className="grid size-9 place-items-center rounded-xl bg-blue-soft text-xs font-semibold text-blue-dark"
          title={user.name}
        >
          {initials}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-card hover:text-ink"
          title="Se déconnecter"
          aria-label="Se déconnecter"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-soft text-xs font-semibold text-blue-dark">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted">
            <UserRound className="size-3 shrink-0" />
            {user.email ?? user.username}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-page px-3 py-2 text-xs font-medium text-muted transition hover:border-blue hover:text-blue-dark"
      >
        <LogOut className="size-4" />
        Se déconnecter
      </button>
    </div>
  );
}
