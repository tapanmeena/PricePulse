const STORAGE_KEY = "pricepulse:session";

export interface AuthUser {
  id: string;
  email: string;
  nickname?: string | null;
  role?: string | null;
}

export interface SessionSnapshot {
  accessToken: string | null;
  user: AuthUser | null;
  accessTokenExpiresAt?: number | null;
}

type SessionListener = (snapshot: SessionSnapshot) => void;

const sessionState: SessionSnapshot = {
  accessToken: null,
  user: null,
  accessTokenExpiresAt: null,
};

const listeners = new Set<SessionListener>();
let hasHydratedFromStorage = false;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStorage(): SessionSnapshot | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    return {
      accessToken: parsed.accessToken ?? null,
      user: parsed.user ?? null,
      accessTokenExpiresAt: parsed.accessTokenExpiresAt ?? null,
    };
  } catch (error) {
    console.warn("Failed to parse stored session", error);
    return null;
  }
}

function writeStorage(snapshot: SessionSnapshot): void {
  if (!isBrowser()) return;
  try {
    if (!snapshot.accessToken && !snapshot.user) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
  } catch (error) {
    console.warn("Failed to persist session", error);
  }
}

function emit(): void {
  listeners.forEach((listener) => listener(sessionState));
}

export function hydrateSessionFromStorage(): SessionSnapshot {
  if (!hasHydratedFromStorage) {
    const snapshot = readStorage();
    sessionState.accessToken = snapshot?.accessToken ?? null;
    sessionState.accessTokenExpiresAt = snapshot?.accessTokenExpiresAt ?? null;
    sessionState.user = snapshot?.user ?? null;
    hasHydratedFromStorage = true;
  }
  return sessionState;
}

export function hasHydratedSession(): boolean {
  return hasHydratedFromStorage;
}

export function getSession(): SessionSnapshot {
  return sessionState;
}

export function getAccessToken(): string | null {
  if (!hasHydratedFromStorage) hydrateSessionFromStorage();
  return sessionState.accessToken ?? null;
}

export function setAccessToken(token: string | null, expiresAt?: number | null): void {
  sessionState.accessToken = token ?? null;
  sessionState.accessTokenExpiresAt = expiresAt ?? null;
  persist();
}

export function setUser(user: AuthUser | null): void {
  sessionState.user = user ?? null;
  persist();
}

export function setSession(snapshot: SessionSnapshot): void {
  sessionState.accessToken = snapshot.accessToken ?? null;
  sessionState.accessTokenExpiresAt = snapshot.accessTokenExpiresAt ?? null;
  sessionState.user = snapshot.user ?? null;
  persist();
}

export function clearSession(): void {
  sessionState.accessToken = null;
  sessionState.accessTokenExpiresAt = null;
  sessionState.user = null;
  persist();
}

export function subscribe(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(): void {
  writeStorage(sessionState);
  emit();
}
