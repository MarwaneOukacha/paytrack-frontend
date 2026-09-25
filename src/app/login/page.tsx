"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { status, signIn } = useAuth();
  const [returnUrl, setReturnUrl] = useState("/console");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("returnUrl");
    if (value && value.startsWith("/") && !value.startsWith("//")) {
      setReturnUrl(value);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") router.replace(returnUrl);
  }, [returnUrl, router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password) return;

    setPending(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
      router.replace(returnUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-6 py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[28rem] rounded-full bg-amber/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue via-blue-dark to-[#5b21b6] text-xl font-bold text-white shadow-glow">
            P
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">PayTrack</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Connectez-vous pour accéder à vos paiements, vos comptes et votre budget.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-line bg-card p-7 shadow-elevated"
        >
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="lbl">Identifiant</span>
              <span className="relative mt-2 block">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="marwane"
                  className="field pl-9"
                />
              </span>
            </label>

            <label className="block">
              <span className="lbl">Mot de passe</span>
              <span className="relative mt-2 block">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-faint transition hover:text-ink"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-soft bg-red-soft px-3 py-2 text-xs text-red"
            >
              <AlertCircle className="mt-px size-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={pending} className="btn mt-6">
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Connexion…
              </span>
            ) : (
              "Se connecter"
            )}
          </button>

          <p className="hint flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue" />
            <span>
              Identifiants gérés par Keycloak. La session est rafraîchie automatiquement et
              rouverte uniquement sur ce poste.
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
