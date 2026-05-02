"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  GitHubAuthUser,
  clearGitHubToken,
  getStoredGitHubToken,
  githubAuthChangeEvent,
  saveGitHubToken,
  validateGitHubToken,
  writerStorage,
} from "./github-auth";

type AuthState =
  | { kind: "checking" }
  | { kind: "signed-out" }
  | { kind: "signed-in"; user: GitHubAuthUser; token: string }
  | { kind: "invalid" };

type AuthContextValue = {
  auth: AuthState;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ kind: "checking" });
  const latestRequestRef = useRef(0);

  const refreshSession = useCallback(async (event?: Event) => {
    if (event instanceof StorageEvent && event.key !== writerStorage.tokenKey) {
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    const token = getStoredGitHubToken().trim();

    const isLatestRequest = () => latestRequestRef.current === requestId;

    if (!token) {
      if (isLatestRequest()) {
        setAuth({ kind: "signed-out" });
      }
      return;
    }

    setAuth({ kind: "checking" });

    try {
      const user = await validateGitHubToken(token);
      if (isLatestRequest()) {
        setAuth({ kind: "signed-in", user, token });
      }
    } catch {
      if (isLatestRequest()) {
        setAuth({ kind: "invalid" });
      }
    }
  }, []);

  useEffect(() => {
    refreshSession();

    window.addEventListener(githubAuthChangeEvent, refreshSession);
    window.addEventListener("storage", refreshSession);

    return () => {
      latestRequestRef.current += 1;
      window.removeEventListener(githubAuthChangeEvent, refreshSession);
      window.removeEventListener("storage", refreshSession);
    };
  }, [refreshSession]);

  const signIn = useCallback(async (token: string) => {
    const trimmedToken = token.trim();
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    const isLatestRequest = () => latestRequestRef.current === requestId;

    setAuth({ kind: "checking" });
    try {
      const user = await validateGitHubToken(trimmedToken);
      if (isLatestRequest()) {
        saveGitHubToken(trimmedToken, { notify: false });
        setAuth({ kind: "signed-in", user, token: trimmedToken });
      }
    } catch {
      if (isLatestRequest()) {
        setAuth({ kind: "invalid" });
      }
    }
  }, []);

  const signOut = useCallback(() => {
    latestRequestRef.current += 1;
    clearGitHubToken({ notify: false });
    setAuth({ kind: "signed-out" });
  }, []);

  const value = useMemo(() => ({ auth, signIn, signOut }), [auth, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
