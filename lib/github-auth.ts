import { siteConfig } from "@/lib/site-config";

export type GitHubAuthUser = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  canWrite: boolean;
};

export const githubAuthChangeEvent = "cyberpunga:github-auth-change";

export const writerRepository = siteConfig.writer.repository;
export const writerStorage = siteConfig.writer.storage;
export const writerToken = siteConfig.writer.token;
export const writerRepositoryFullName = `${writerRepository.owner}/${writerRepository.name}`;

export function getStoredGitHubToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(writerStorage.tokenKey) ?? "";
}

type TokenStorageOptions = {
  notify?: boolean;
};

export function saveGitHubToken(token: string, options: TokenStorageOptions = {}) {
  window.localStorage.setItem(writerStorage.tokenKey, token);
  if (options.notify ?? true) {
    notifyGitHubAuthChanged();
  }
}

export function clearGitHubToken(options: TokenStorageOptions = {}) {
  window.localStorage.removeItem(writerStorage.tokenKey);
  if (options.notify ?? true) {
    notifyGitHubAuthChanged();
  }
}

export function notifyGitHubAuthChanged() {
  window.dispatchEvent(new Event(githubAuthChangeEvent));
}

export function buildGitHubTokenUrl() {
  const url = new URL("https://github.com/settings/personal-access-tokens/new");
  url.searchParams.set("name", writerToken.name);
  url.searchParams.set("description", writerToken.description);
  url.searchParams.set("target_name", writerRepository.owner);
  url.searchParams.set("expires_in", String(writerToken.expiresInDays));

  Object.entries(writerToken.requiredPermissions).forEach(([permission, level]) => {
    url.searchParams.set(permission, level);
  });

  return url.toString();
}

export async function validateGitHubToken(token: string): Promise<GitHubAuthUser> {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    throw new Error("Paste a GitHub token first.");
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: githubHeaders(trimmedToken),
  });

  if (!userResponse.ok) {
    throw new Error(await githubErrorMessage(userResponse));
  }

  const user = (await userResponse.json()) as {
    login: string;
    avatar_url: string;
    html_url: string;
  };

  const repoResponse = await fetch(`https://api.github.com/repos/${writerRepositoryFullName}`, {
    headers: githubHeaders(trimmedToken),
  });

  if (!repoResponse.ok) {
    throw new Error(await githubErrorMessage(repoResponse));
  }

  const repo = (await repoResponse.json()) as {
    permissions?: {
      admin?: boolean;
      maintain?: boolean;
      push?: boolean;
    };
  };

  const canWrite = Boolean(repo.permissions?.admin || repo.permissions?.maintain || repo.permissions?.push);

  if (!canWrite) {
    throw new Error(`Signed in as @${user.login}, but this token cannot write to ${writerRepositoryFullName}.`);
  }

  return {
    login: user.login,
    avatarUrl: user.avatar_url,
    htmlUrl: user.html_url,
    canWrite,
  };
}

export function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function githubErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ? `GitHub ${response.status}: ${body.message}` : `GitHub request failed: ${response.status}`;
  } catch {
    return `GitHub request failed: ${response.status}`;
  }
}
