"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { githubErrorMessage, githubHeaders, writerRepository, writerRepositoryFullName } from "@/lib/github-auth";
import { useAuth } from "@/lib/github-auth-context";
import { siteConfig } from "@/lib/site-config";

export type PublishingActionState = {
  kind: "idle" | "working" | "success" | "error";
  message: string;
  href?: string;
};

export type DeploymentState = {
  kind: "idle" | "waiting" | "running" | "success" | "error" | "unknown";
  message: string;
  commitUrl?: string;
  actionsUrl?: string;
  siteUrl?: string;
};

export type DeploymentTarget = {
  sha: string;
  label: string;
  commitUrl: string;
  siteUrl?: string;
  startedAt: number;
};

type GitHubWorkflowRun = {
  id: number;
  name?: string;
  html_url?: string;
  status: string;
  conclusion: string | null;
  head_sha?: string;
  event?: string;
};

type PublishingStatusContextValue = {
  actionState: PublishingActionState;
  deploymentState: DeploymentState;
  clearPublishingStatus: () => void;
  setPublishingActionState: React.Dispatch<React.SetStateAction<PublishingActionState>>;
  startDeploymentWatch: (target: Omit<DeploymentTarget, "startedAt">) => void;
};

const deployPollIntervalMs = 6000;
const deployRunStartTimeoutMs = 120000;

const PublishingStatusContext = createContext<PublishingStatusContextValue | null>(null);

const emptyActionState = (): PublishingActionState => ({ kind: "idle", message: "" });
const emptyDeploymentState = (): DeploymentState => ({ kind: "idle", message: "" });

export function usePublishingStatus() {
  const context = useContext(PublishingStatusContext);
  if (!context) {
    throw new Error("usePublishingStatus must be used within PublishingStatusProvider");
  }
  return context;
}

export function PublishingStatusProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const [actionState, setPublishingActionState] = useState<PublishingActionState>(emptyActionState);
  const [deploymentTarget, setDeploymentTarget] = useState<DeploymentTarget | null>(null);
  const [deploymentState, setDeploymentState] = useState<DeploymentState>(emptyDeploymentState);
  const authToken = auth.kind === "signed-in" ? auth.token : "";

  const clearPublishingStatus = useCallback(() => {
    setPublishingActionState(emptyActionState());
    setDeploymentTarget(null);
    setDeploymentState(emptyDeploymentState());
  }, []);

  const startDeploymentWatch = useCallback((target: Omit<DeploymentTarget, "startedAt">) => {
    const nextTarget = { ...target, startedAt: Date.now() };
    setDeploymentTarget(nextTarget);
    setDeploymentState(waitingForDeploymentRunState(nextTarget));
  }, []);

  useEffect(() => {
    if (!deploymentTarget) {
      return;
    }

    const target = deploymentTarget;
    let ignore = false;
    let timeoutId: number | undefined;

    async function pollDeployment() {
      try {
        const run = await loadWorkflowRunForCommit(target.sha, authToken);

        if (ignore) {
          return;
        }

        if (!run) {
          const waitedMs = Date.now() - target.startedAt;
          const nextState = waitingForDeploymentRunState(target);
          setDeploymentState(
            waitedMs > deployRunStartTimeoutMs
              ? {
                  ...nextState,
                  kind: "unknown",
                  message:
                    "Saved on GitHub, but the deploy run has not appeared yet. Check GitHub Actions if the public site does not update soon.",
                  actionsUrl: githubActionsUrl(),
                }
              : nextState,
          );

          if (waitedMs <= deployRunStartTimeoutMs) {
            timeoutId = window.setTimeout(pollDeployment, deployPollIntervalMs);
          }
          return;
        }

        const nextState = deploymentStateFromRun(run, target);
        setDeploymentState(nextState);

        if (run.status !== "completed") {
          timeoutId = window.setTimeout(pollDeployment, deployPollIntervalMs);
        }
      } catch (error) {
        if (ignore) {
          return;
        }

        setDeploymentState({
          kind: "error",
          message:
            error instanceof Error ? error.message : "Saved on GitHub, but the deploy status could not be loaded.",
          commitUrl: target.commitUrl,
          siteUrl: target.siteUrl,
          actionsUrl: githubActionsUrl(),
        });
      }
    }

    pollDeployment();

    return () => {
      ignore = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [authToken, deploymentTarget]);

  const value = useMemo(
    () => ({
      actionState,
      deploymentState,
      clearPublishingStatus,
      setPublishingActionState,
      startDeploymentWatch,
    }),
    [actionState, clearPublishingStatus, deploymentState, startDeploymentWatch],
  );

  return <PublishingStatusContext.Provider value={value}>{children}</PublishingStatusContext.Provider>;
}

async function loadWorkflowRunForCommit(sha: string, token: string) {
  const url = new URL(`https://api.github.com/repos/${writerRepositoryFullName}/actions/runs`);
  url.searchParams.set("branch", writerRepository.branch);
  url.searchParams.set("event", "push");
  url.searchParams.set("head_sha", sha);
  url.searchParams.set("exclude_pull_requests", "true");
  url.searchParams.set("per_page", "10");

  const data = await fetchWorkflowRuns(url.toString(), token);
  const runs = data.workflow_runs.filter((run) => run.head_sha === sha && run.event === "push");

  return (
    runs.find((run) => run.name === siteConfig.writer.deployment.workflowName) ??
    runs.find((run) => run.name?.toLowerCase().includes("pages")) ??
    runs[0] ??
    null
  );
}

async function fetchWorkflowRuns(url: string, token: string): Promise<{ workflow_runs: GitHubWorkflowRun[] }> {
  const trimmedToken = token.trim();

  if (trimmedToken) {
    const authenticatedResponse = await fetch(url, {
      headers: githubHeaders(trimmedToken),
    });

    if (authenticatedResponse.ok) {
      return (await authenticatedResponse.json()) as { workflow_runs: GitHubWorkflowRun[] };
    }

    if (authenticatedResponse.status !== 403 && authenticatedResponse.status !== 404) {
      throw new Error(await githubErrorMessage(authenticatedResponse));
    }

    const authenticatedError = await githubErrorMessage(authenticatedResponse.clone());
    const publicResponse = await fetch(url, {
      headers: githubPublicHeaders(),
    });

    if (publicResponse.ok) {
      return (await publicResponse.json()) as { workflow_runs: GitHubWorkflowRun[] };
    }

    if (publicResponse.status === 403 || publicResponse.status === 404) {
      throw new Error(
        `${authenticatedError}. Deployment status needs Repository permissions > Actions set to Read-only if this repository is not publicly readable.`,
      );
    }

    throw new Error(await githubErrorMessage(publicResponse));
  }

  const response = await fetch(url, {
    headers: githubPublicHeaders(),
  });

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  return (await response.json()) as { workflow_runs: GitHubWorkflowRun[] };
}

function waitingForDeploymentRunState(target: DeploymentTarget): DeploymentState {
  return {
    kind: "waiting",
    message: "Commit saved. Waiting for GitHub Actions to start the site deploy...",
    commitUrl: target.commitUrl,
    siteUrl: target.siteUrl,
  };
}

function deploymentStateFromRun(run: GitHubWorkflowRun, target: DeploymentTarget): DeploymentState {
  const actionsUrl = run.html_url ?? githubActionsUrl();
  const common = {
    commitUrl: target.commitUrl,
    actionsUrl,
    siteUrl: target.siteUrl,
  };

  if (run.status === "completed") {
    if (run.conclusion === "success") {
      return {
        ...common,
        kind: "success",
        message: `${target.label} is deployed. The public site should include it now.`,
      };
    }

    return {
      ...common,
      kind: "error",
      message: `The deploy ${workflowConclusionLabel(run.conclusion)}. The GitHub commit is saved, but the public site did not update.`,
    };
  }

  return {
    ...common,
    kind: run.status === "in_progress" ? "running" : "waiting",
    message: `GitHub Actions is ${workflowStatusLabel(run.status)}. The public site will update after the deploy finishes.`,
  };
}

function workflowStatusLabel(status: string) {
  if (status === "in_progress") {
    return "building and deploying";
  }

  if (status === "queued") {
    return "queued";
  }

  if (status === "requested") {
    return "starting";
  }

  if (status === "waiting" || status === "pending") {
    return "waiting";
  }

  return status.replaceAll("_", " ");
}

function workflowConclusionLabel(conclusion: string | null) {
  if (!conclusion) {
    return "finished without a success result";
  }

  if (conclusion === "timed_out") {
    return "timed out";
  }

  if (conclusion === "action_required") {
    return "needs action";
  }

  return conclusion.replaceAll("_", " ");
}

function githubActionsUrl() {
  return `https://github.com/${writerRepositoryFullName}/actions`;
}

function githubPublicHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}
