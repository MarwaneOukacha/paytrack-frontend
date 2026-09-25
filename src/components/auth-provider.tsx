"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  isSessionExpired,
  loadSession,
  loginWithPassword,
  notifyUnauthorized,
  renewSession,
  UNAUTHORIZED_EVENT,
  type Session,
  type SessionProfile,
} from "@/lib/oidc";

const REFRESH_DELAY_MS = 60_000;

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: SessionProfile | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);

  const dropSession = useCallback(() => {
    clearSession();
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    const stored = loadSession();
    if (stored && !isSessionExpired(stored)) {
      setSession(stored);
      setStatus("authenticated");
      return;
    }
    dropSession();
  }, [dropSession]);

  useEffect(() => {
    const handleUnauthorized = () => dropSession();
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [dropSession]);

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const delay = Math.max(session.expiresAt - Date.now() - REFRESH_DELAY_MS, 1_000);
    const timer = window.setTimeout(() => {
      renewSession(session)
        .then((next) => {
          setSession(next);
          setStatus("authenticated");
        })
        .catch(() => {
          dropSession();
          notifyUnauthorized();
        });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [dropSession, session, status]);

  const signIn = useCallback(async (username: string, password: string) => {
    const next = await loginWithPassword(username, password);
    setSession(next);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(() => {
    dropSession();
    window.location.assign("/login");
  }, [dropSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.profile ?? null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function AuthLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-page px-6" aria-busy="true">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue via-blue-dark to-[#5b21b6] text-lg font-bold text-white shadow-glow">
          P
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Chargement de votre espace</p>
          <p className="mt-1 text-xs text-muted">Vérification de la session…</p>
        </div>
      </div>
    </div>
  );
}
