"use client";

import {
  clearGitHubToken,
  getStoredGitHubToken,
  githubAuthChangeEvent,
  validateGitHubToken,
} from "@/lib/github-auth";
import type { GitHubAuthUser } from "@/lib/github-auth";
import { LogOut, PenLine, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

type SessionState =
  | { kind: "checking" }
  | { kind: "signed-out" }
  | { kind: "signed-in"; user: GitHubAuthUser }
  | { kind: "invalid" };

export function GitHubAuthStatus() {
  const [session, setSession] = useState<SessionState>({ kind: "checking" });

  useEffect(() => {
    let cancelled = false;

    async function refreshSession() {
      const token = getStoredGitHubToken();

      if (!token) {
        setSession({ kind: "signed-out" });
        return;
      }

      setSession({ kind: "checking" });

      try {
        const user = await validateGitHubToken(token);

        if (!cancelled) {
          setSession({ kind: "signed-in", user });
        }
      } catch {
        if (!cancelled) {
          setSession({ kind: "invalid" });
        }
      }
    }

    refreshSession();
    window.addEventListener(githubAuthChangeEvent, refreshSession);
    window.addEventListener("storage", refreshSession);

    return () => {
      cancelled = true;
      window.removeEventListener(githubAuthChangeEvent, refreshSession);
      window.removeEventListener("storage", refreshSession);
    };
  }, []);

  if (session.kind === "checking") {
    return <span className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:inline">Checking auth...</span>;
  }

  if (session.kind === "signed-in") {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <PenLine />
            <span className="hidden sm:inline">@{session.user.login}</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={clearGitHubToken}>
          <LogOut />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button asChild variant={session.kind === "invalid" ? "secondary" : "outline"} size="sm">
      <Link href="/dashboard">
        <UserRound />
        {session.kind === "invalid" ? "Reconnect" : "Sign in"}
      </Link>
    </Button>
  );
}
