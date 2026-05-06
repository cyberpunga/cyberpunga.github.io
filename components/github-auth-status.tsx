"use client";

import { useAuth } from "@/lib/github-auth-context";
import { LogOut, PenLine, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function GitHubAuthStatus() {
  const { auth, signOut } = useAuth();

  if (auth.kind === "checking") {
    return <span className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:inline">Checking auth...</span>;
  }

  if (auth.kind === "signed-in") {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <PenLine />
            <span className="hidden sm:inline">@{auth.user.login}</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={signOut}>
          <LogOut />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button asChild variant={auth.kind === "invalid" ? "secondary" : "outline"} size="sm">
      <Link href="/dashboard">
        <UserRound />
        {auth.kind === "invalid" ? "Reconnect" : "Sign in"}
      </Link>
    </Button>
  );
}
