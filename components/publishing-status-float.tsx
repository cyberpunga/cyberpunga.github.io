"use client";

import { CheckCircle2, CircleAlert, Clock3, ExternalLink, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type DeploymentState, usePublishingStatus } from "@/lib/publishing-status-context";

export function PublishingStatusFloat() {
  const { actionState, deploymentState, clearPublishingStatus } = usePublishingStatus();

  if (!actionState.message && !deploymentState.message) {
    return null;
  }

  const isError = actionState.kind === "error" || deploymentState.kind === "error";
  const isSuccess = actionState.kind === "success" && deploymentState.kind === "success";

  return (
    <section
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 w-[min(calc(100vw-2rem),28rem)] border bg-black p-4 text-sm ${
        isError
          ? "border-red-900/70 text-red-100"
          : isSuccess
            ? "border-emerald-900/70 text-emerald-100"
            : "border-zinc-700 text-zinc-200"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Publishing</p>
          <h2 className="mt-1 font-mono text-sm font-normal text-zinc-50">GitHub Actions status</h2>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={clearPublishingStatus}>
          <X />
          <span className="sr-only">Dismiss publishing status</span>
        </Button>
      </div>

      {actionState.message ? <p className="leading-6">{actionState.message}</p> : null}
      {deploymentState.message ? (
        <div className="mt-3 flex items-start gap-2">
          <DeploymentStatusIcon kind={deploymentState.kind} />
          <p className="leading-6">{deploymentState.message}</p>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em]">
        {actionState.href ? (
          <a href={actionState.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
            View commit
            <ExternalLink className="size-3" />
          </a>
        ) : null}
        {deploymentState.actionsUrl ? (
          <a
            href={deploymentState.actionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline"
          >
            View deploy
            <ExternalLink className="size-3" />
          </a>
        ) : null}
        {deploymentState.siteUrl && deploymentState.kind === "success" ? (
          <a
            href={deploymentState.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline"
          >
            View live page
            <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

function DeploymentStatusIcon({ kind }: { kind: DeploymentState["kind"] }) {
  if (kind === "success") {
    return <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />;
  }

  if (kind === "error") {
    return <CircleAlert className="mt-1 size-4 shrink-0 text-red-300" />;
  }

  if (kind === "running") {
    return <RefreshCw className="mt-1 size-4 shrink-0 animate-spin" />;
  }

  return <Clock3 className="mt-1 size-4 shrink-0 text-zinc-500" />;
}
