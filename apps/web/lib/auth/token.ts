const OWNER_KEY = "pomodoro-otaku-user";

export interface SessionToken {
  userId: string;
  idToken: string;
  expiresAt: number;
}

export class NaoAutenticadoError extends Error {
  constructor() {
    super("Sessão ausente ou expirada");
    this.name = "NaoAutenticadoError";
  }
}

let cached: SessionToken | null = null;

function valido(token: SessionToken): boolean {
  return Date.now() < (token.expiresAt - 60) * 1000;
}

export async function getSessionToken(): Promise<SessionToken | null> {
  if (cached && valido(cached)) return cached;

  try {
    const response = await fetch("/api/token", { cache: "no-store" });
    if (!response.ok) {
      cached = null;
      return null;
    }
    const token = (await response.json()) as SessionToken;
    cached = token;
    localStorage.setItem(OWNER_KEY, token.userId);
    return token;
  } catch {
    return null;
  }
}

export function userIdConhecido(): string | null {
  if (cached) return cached.userId;
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(OWNER_KEY);
}

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  if (!token) throw new NaoAutenticadoError();
  return { Authorization: `Bearer ${token.idToken}` };
}
