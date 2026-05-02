"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GitHubAuthUser, clearGitHubToken, getStoredGitHubToken, githubAuthChangeEvent, saveGitHubToken, validateGitHubToken } from "./github-auth";

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
  const cancelledRef = useRef(false);

  const refreshSession = useCallback(async () => {
    const token = getStoredGitHubToken();

    if (!token) {
      setAuth({ kind: "signed-out" });
      return;
    }

    setAuth({ kind: "checking" });

    try {
      const user = await validateGitHubToken(token);
      if (!cancelledRef.current) {
        setAuth({ kind: "signed-in", user, token });
      }
    } catch {
      if (!cancelledRef.current) {
        setAuth({ kind: "invalid" });
      }
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    refreshSession();

    window.addEventListener(githubAuthChangeEvent, refreshSession);
    window.addEventListener("storage", refreshSession);

    return () => {
      cancelledRef.current = true;
      window.removeEventListener(githubAuthChangeEvent, refreshSession);
      window.removeEventListener("storage", refreshSession);
    };
  }, [refreshSession]);

  const signIn = useCallback(async (token: string) => {
    setAuth({ kind: "checking" });
    try {
      const user = await validateGitHubToken(token);
      saveGitHubToken(token.trim());
      setAuth({ kind: "signed-in", user, token: token.trim() });
    } catch {
      setAuth({ kind: "invalid" });
    }
  }, []);

  const signOut = useCallback(() => {
    clearGitHubToken();
    setAuth({ kind: "signed-out" });
  }, []);

  const value = useMemo(() => ({ auth, signIn, signOut }), [auth, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
