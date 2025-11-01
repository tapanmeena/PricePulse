"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  getSession,
  hydrateSessionFromStorage,
  subscribe,
  type SessionSnapshot,
} from "@/lib/session";
import { authApi } from "@/lib/api";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface UseSessionOptions {
  autoRefresh?: boolean;
}

export interface SessionState extends SessionSnapshot {
  status: SessionStatus;
  isAuthenticated: boolean;
}

const serverSnapshot = getSession();

function getServerSnapshot(): SessionSnapshot {
  return serverSnapshot;
}

function getClientSnapshot(): SessionSnapshot {
  hydrateSessionFromStorage();
  return getSession();
}

export function useSession(options: UseSessionOptions = {}): SessionState {
  const { autoRefresh = true } = options;
  const session = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [initializing, setInitializing] = useState(true);
  const refreshAttemptedRef = useRef(false);

  useEffect(() => {
    hydrateSessionFromStorage();
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      setInitializing(false);
      return;
    }

    if (refreshAttemptedRef.current) {
      if (initializing && session.accessToken) setInitializing(false);
      return;
    }

    refreshAttemptedRef.current = true;

    if (session.accessToken) {
      setInitializing(false);
      return;
    }

    let cancelled = false;

    authApi
      .refresh()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [autoRefresh, initializing, session.accessToken]);

  useEffect(() => {
    if (!initializing && !session.accessToken) {
      refreshAttemptedRef.current = true;
    }
  }, [initializing, session.accessToken]);

  const status: SessionStatus = useMemo(() => {
    if (initializing) return "loading";
    return session.user ? "authenticated" : "unauthenticated";
  }, [initializing, session.user]);

  return {
    ...session,
    status,
    isAuthenticated: status === "authenticated",
  };
}

export interface RequireAuthOptions {
  redirectTo?: string;
  enabled?: boolean;
}

export function useRequireAuth(options: RequireAuthOptions = {}): SessionState {
  const { redirectTo = "/login", enabled = true } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();

  const session = useSession();

  useEffect(() => {
    if (!enabled) return;
    if (session.status !== "unauthenticated") return;

    const redirectPath = searchString ? `${pathname}?${searchString}` : pathname;
    const query = new URLSearchParams();
    if (redirectPath && redirectPath !== redirectTo) {
      query.set("redirectTo", redirectPath);
    }
    const destination = query.toString() ? `${redirectTo}?${query.toString()}` : redirectTo;
    router.replace(destination);
  }, [enabled, pathname, redirectTo, router, searchString, session.status]);

  return session;
}
