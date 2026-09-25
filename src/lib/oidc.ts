const KEYCLOAK_URL = (process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8088").replace(
  /\/$/,
  ""
);
const REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "paytrack";
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "paytrack-web";

const SESSION_KEY = "paytrack.session";
const REFRESH_MARGIN_MS = 60_000;

export const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
export const UNAUTHORIZED_EVENT = "paytrack:unauthorized";

export interface SessionProfile {
  sub: string;
  name: string;
  email?: string;
  username: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number;
  profile: SessionProfile;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

let current: Session | null = null;

function decodeJwtClaims(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  if (!payload) return {};

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function readString(claims: Record<string, unknown>, key: string) {
  const value = claims[key];
  return typeof value === "string" ? value : undefined;
}

function toSession(data: TokenResponse, fallbackUsername: string): Session {
  const claims = data.id_token ? decodeJwtClaims(data.id_token) : {};
  const username = readString(claims, "preferred_username") ?? fallbackUsername;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    idToken: data.id_token ?? null,
    expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
    profile: {
      sub: readString(claims, "sub") ?? username,
      name: readString(claims, "name") ?? username,
      email: readString(claims, "email"),
      username,
    },
  };
}

async function postToken(params: URLSearchParams): Promise<TokenResponse> {
  let res: Response;

  try {
    res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  } catch {
    throw new Error("Impossible de joindre Keycloak. Vérifiez qu'il est démarré sur le port 8088.");
  }

  const data = (await res.json().catch(() => ({}))) as TokenResponse;

  if (!res.ok) {
    if (data.error === "invalid_grant") {
      throw new Error("Identifiants incorrects.");
    }
    if (data.error === "invalid_client") {
      throw new Error("Client Keycloak non configuré pour le password grant.");
    }
    if (data.error === "account_disabled") {
      throw new Error("Ce compte est désactivé.");
    }
    throw new Error(data.error_description ?? `Erreur d'authentification (${res.status}).`);
  }

  return data;
}

export async function loginWithPassword(username: string, password: string) {
  const data = await postToken(
    new URLSearchParams({
      grant_type: "password",
      client_id: CLIENT_ID,
      username,
      password,
      scope: "openid profile email",
    })
  );

  const session = toSession(data, username);
  saveSession(session);
  return session;
}

export async function renewSession(session: Session): Promise<Session> {
  if (!session.refreshToken) throw new Error("Session non renouvelable");

  const data = await postToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: session.refreshToken,
    })
  );

  const renewed = toSession(data, session.profile.username);
  const next: Session = {
    ...renewed,
    refreshToken: data.refresh_token ?? session.refreshToken,
    idToken: data.id_token ?? session.idToken,
  };
  saveSession(next);
  return next;
}

export function loadSession(): Session | null {
  if (current) return current;
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    current = JSON.parse(raw) as Session;
    return current;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  current = session;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function clearSession() {
  current = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}

export function getAccessToken() {
  const session = loadSession();
  if (!session) return null;
  if (session.expiresAt <= Date.now()) return null;
  return session.accessToken;
}

export function isSessionExpired(session: Session) {
  return session.expiresAt <= Date.now() + REFRESH_MARGIN_MS;
}

export function notifyUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
}
