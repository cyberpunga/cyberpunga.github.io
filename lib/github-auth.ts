import { siteConfig } from "@/lib/site-config";
import { normalizeContentSegment } from "@/lib/content-schema";

export type GitHubAuthUser = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  canWrite: boolean;
  name?: string;
  bio?: string;
  blog?: string;
  twitterUsername?: string;
  location?: string;
  hireable?: boolean;
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
    if (userResponse.status === 401) {
      throw new Error(await githubInvalidTokenErrorMessage(userResponse));
    }

    throw new Error(await githubErrorMessage(userResponse));
  }

  const user = (await userResponse.json()) as {
    login: string;
    avatar_url: string;
    html_url: string;
    name?: string | null;
    bio?: string | null;
    blog?: string | null;
    twitter_username?: string | null;
    location?: string | null;
    hireable?: boolean | null;
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
    name: cleanOptionalString(user.name),
    bio: cleanOptionalString(user.bio),
    blog: cleanOptionalString(user.blog),
    twitterUsername: cleanOptionalString(user.twitter_username)?.replace(/^@+/, ""),
    location: cleanOptionalString(user.location),
    hireable: typeof user.hireable === "boolean" ? user.hireable : undefined,
  };
}

export async function ensureGitHubUserContentEntry(token: string, user: GitHubAuthUser) {
  const trimmedToken = token.trim();
  const slug = normalizeContentSegment(user.login);
  const path = `content/users/${slug}/page.mdx`;
  const pathUrl = `https://api.github.com/repos/${writerRepositoryFullName}/contents/${encodeGitHubPath(path)}`;

  if (!trimmedToken) {
    throw new Error("Add a GitHub token before syncing the user profile.");
  }

  if (!slug) {
    throw new Error(`GitHub login "${user.login}" cannot be used as a content slug.`);
  }

  const existingResponse = await fetch(`${pathUrl}?ref=${writerRepository.branch}`, {
    headers: githubHeaders(trimmedToken),
  });

  if (existingResponse.ok) {
    return { kind: "exists" as const, path };
  }

  if (existingResponse.status !== 404) {
    if (existingResponse.status === 403) {
      throw new Error(await githubContentsWriteErrorMessage(existingResponse));
    }

    throw new Error(await githubErrorMessage(existingResponse));
  }

  const createResponse = await fetch(pathUrl, {
    method: "PUT",
    headers: githubHeaders(trimmedToken),
    body: JSON.stringify({
      message: `Add user profile: @${user.login}`,
      content: textToBase64(buildGitHubUserMdx(user)),
      branch: writerRepository.branch,
    }),
  });

  if (!createResponse.ok) {
    if (createResponse.status === 409 || createResponse.status === 422) {
      const raceResponse = await fetch(`${pathUrl}?ref=${writerRepository.branch}`, {
        headers: githubHeaders(trimmedToken),
      });

      if (raceResponse.ok) {
        return { kind: "exists" as const, path };
      }
    }

    if (createResponse.status === 403) {
      throw new Error(await githubContentsWriteErrorMessage(createResponse));
    }

    throw new Error(await githubErrorMessage(createResponse));
  }

  const result = (await createResponse.json()) as { commit: { html_url: string } };
  return { kind: "created" as const, path, commitUrl: result.commit.html_url };
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

async function githubContentsWriteErrorMessage(response: Response) {
  const message = await githubErrorMessage(response);

  return `${message}. Create a fine-grained GitHub token for ${writerRepositoryFullName} with Repository access set to ${writerRepository.name}, Repository permissions > Contents set to Read and write, Repository permissions > Actions set to Read-only, and any required organization approval completed.`;
}

async function githubInvalidTokenErrorMessage(response: Response) {
  const message = await githubErrorMessage(response);

  return `${message}. Paste a new complete fine-grained GitHub token. This token is missing, expired, revoked, or copied incorrectly.`;
}

function buildGitHubUserMdx(user: GitHubAuthUser) {
  const title = user.name || user.login;
  const website = normalizeProfileUrl(user.blog);
  const xHandle = user.twitterUsername?.replace(/^@+/, "") ?? "";
  const socialLinks = [user.htmlUrl, website, xHandle ? `https://x.com/${xHandle}` : ""].filter(Boolean);
  const description = user.bio || `GitHub profile for @${user.login}.`;
  const body = escapeMdxText(user.bio || `@${user.login} on GitHub: ${user.htmlUrl}`);
  const frontmatterEntries: Array<[string, unknown]> = [
    ["title", title],
    ["description", description],
    ["name", title],
    ["handle", user.login],
    ["avatar_url", user.avatarUrl],
    ["github_url", user.htmlUrl],
    ["website", website],
    ["x_handle", xHandle],
    ["location", user.location],
    ["hireable", user.hireable],
    ["social_links", socialLinks],
  ];

  return `---\n${frontmatterEntries
    .filter(([, value]) => !isEmptyFrontmatterValue(value))
    .map(([key, value]) => `${key}: ${serializeFrontmatterValue(value)}`)
    .join("\n")}\n---\n\n${body}\n`;
}

function cleanOptionalString(value: string | null | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
}

function normalizeProfileUrl(value: string | undefined) {
  if (!value) {
    return "";
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function escapeMdxText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/{/g, "&#123;")
    .replace(/}/g, "&#125;");
}

function serializeFrontmatterValue(value: unknown) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return JSON.stringify(value);
}

function isEmptyFrontmatterValue(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function textToBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
