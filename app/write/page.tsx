"use client";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { ExternalLink, ImagePlus, KeyRound, Save, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

const { repository, storage, token: tokenConfig } = siteConfig.writer;
const REPOSITORY_FULL_NAME = `${repository.owner}/${repository.name}`;

type SelectedImage = {
  id: string;
  file: File;
  safeName: string;
  previewUrl: string;
};

type PublishState = {
  kind: "idle" | "working" | "success" | "error";
  message: string;
  href?: string;
};

type DraftState = {
  title: string;
  date: string;
  description: string;
  tagsInput: string;
  body: string;
};

const emptyDraft = (): DraftState => ({
  title: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  tagsInput: "",
  body: "",
});

export default function WritePage() {
  const [token, setToken] = useState("");
  const [rememberToken, setRememberToken] = useState(true);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [publishState, setPublishState] = useState<PublishState>({ kind: "idle", message: "" });
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const slug = useMemo(() => slugify(draft.title), [draft.title]);
  const tags = useMemo(() => parseTags(draft.tagsInput), [draft.tagsInput]);
  const mdx = useMemo(() => buildMdx(draft, tags), [draft, tags]);
  const tokenUrl = useMemo(() => buildTokenUrl(), []);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(storage.tokenKey);
    const savedDraft = window.localStorage.getItem(storage.draftKey);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedDraft) {
      try {
        setDraft({ ...emptyDraft(), ...JSON.parse(savedDraft) });
      } catch {
        window.localStorage.removeItem(storage.draftKey);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storage.draftKey, JSON.stringify(draft));
  }, [draft]);

  function updateDraft<Key extends keyof DraftState>(key: Key, value: DraftState[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleTokenSave() {
    if (rememberToken && token.trim()) {
      window.localStorage.setItem(storage.tokenKey, token.trim());
      setPublishState({ kind: "success", message: "Token saved in this browser." });
      return;
    }

    window.localStorage.removeItem(storage.tokenKey);
    setPublishState({ kind: "success", message: "Token storage cleared." });
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const existingNames = new Set(images.map((image) => image.safeName));
    const nextImages = files.map((file, index) => {
      const safeName = uniqueFileName(sanitizeFileName(file.name), existingNames, images.length + index + 1);
      existingNames.add(safeName);

      return {
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        safeName,
        previewUrl: URL.createObjectURL(file),
      };
    });

    setImages((current) => [...current, ...nextImages]);
    event.target.value = "";
  }

  function removeImage(id: string) {
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function insertImageMarkdown(image: SelectedImage) {
    const alt = image.safeName.replace(/\.[^.]+$/, "").replaceAll("-", " ");
    const snippet = `\n\n![${alt}](./images/${image.safeName})\n`;
    const textarea = bodyRef.current;

    if (!textarea) {
      updateDraft("body", `${draft.body}${snippet}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextBody = `${draft.body.slice(0, start)}${snippet}${draft.body.slice(end)}`;
    updateDraft("body", nextBody);

    window.requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippet.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function publishPost() {
    setPublishState({ kind: "working", message: "Preparing post..." });

    try {
      validateDraft(draft, slug, tags, token);

      const pagePath = `posts/${slug}/page.mdx`;
      await ensurePathIsNew(pagePath, token.trim());

      for (const image of images) {
        setPublishState({ kind: "working", message: `Uploading ${image.safeName}...` });
        const content = await fileToBase64(image.file);
        await putFile({
          path: `posts/${slug}/images/${image.safeName}`,
          content,
          message: `Add image for ${draft.title}`,
          token: token.trim(),
        });
      }

      setPublishState({ kind: "working", message: "Publishing post..." });
      const result = await putFile({
        path: pagePath,
        content: textToBase64(mdx),
        message: `Add post: ${draft.title}`,
        token: token.trim(),
      });

      window.localStorage.removeItem(storage.draftKey);
      setPublishState({
        kind: "success",
        message: "Published to GitHub.",
        href: result.commit.html_url,
      });
    } catch (error) {
      setPublishState({
        kind: "error",
        message: error instanceof Error ? error.message : "Publishing failed.",
      });
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
      <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            GitHub writer
          </p>
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 md:text-4xl">New post</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={tokenUrl} target="_blank" rel="noreferrer">
              <KeyRound />
              Create token
              <ExternalLink />
            </a>
          </Button>
          <Button onClick={publishPost} disabled={publishState.kind === "working"}>
            <Send />
            Publish
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800 md:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Title</span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="h-11 rounded-md border border-zinc-300 bg-background px-3 text-base outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-700"
                  placeholder="Post title"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Date</span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(event) => updateDraft("date", event.target.value)}
                  className="h-11 rounded-md border border-zinc-300 bg-background px-3 text-base outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-700"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Tags</span>
                <input
                  value={draft.tagsInput}
                  onChange={(event) => updateDraft("tagsInput", event.target.value)}
                  className="h-11 rounded-md border border-zinc-300 bg-background px-3 text-base outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-700"
                  placeholder="technology, society"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  rows={3}
                  className="resize-y rounded-md border border-zinc-300 bg-background px-3 py-2 text-base outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-700"
                  placeholder="Short summary for listings and metadata."
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Body</h2>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
                <ImagePlus className="size-4" />
                Add images
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageSelection} />
              </label>
            </div>
            <textarea
              ref={bodyRef}
              value={draft.body}
              onChange={(event) => updateDraft("body", event.target.value)}
              rows={18}
              className="min-h-[420px] w-full resize-y rounded-md border border-zinc-300 bg-background px-3 py-3 font-mono text-sm leading-6 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-700"
              placeholder="Write the post in Markdown."
            />
          </section>

          {images.length > 0 ? (
            <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800 md:p-5">
              <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">Images</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.previewUrl} alt="" className="aspect-video w-full object-cover" />
                    <div className="space-y-3 p-3">
                      <p className="truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">{image.safeName}</p>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => insertImageMarkdown(image)}>
                          <ImagePlus />
                          Insert
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(image.id)}>
                          <Trash2 />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">Access</h2>
            <label className="mb-3 flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">GitHub token</span>
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-background px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-700"
                placeholder="github_pat_..."
              />
            </label>
            <label className="mb-4 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={rememberToken}
                onChange={(event) => setRememberToken(event.target.checked)}
                className="size-4 rounded border-zinc-300"
              />
              Remember on this browser
            </label>
            <Button type="button" variant="outline" className="w-full" onClick={handleTokenSave}>
              <Save />
              Save access
            </Button>
            <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              The token link pre-fills the owner and Contents permission. In GitHub, choose Only select repositories,
              then select {repository.name}.
            </p>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">Output</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Repository</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">{REPOSITORY_FULL_NAME}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Branch</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">{repository.branch}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Slug</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">{slug || "post-title"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Path</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">
                  posts/{slug || "post-title"}/page.mdx
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Tags</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{tags.length > 0 ? tags.join(", ") : "None"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">MDX</h2>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md bg-zinc-100 p-3 font-mono text-xs leading-5 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {mdx}
            </pre>
          </section>

          {publishState.message ? (
            <section
              className={`rounded-lg border p-4 text-sm ${
                publishState.kind === "error"
                  ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
                  : "border-zinc-200 bg-background text-zinc-800 dark:border-zinc-800 dark:text-zinc-200"
              }`}
            >
              <p>{publishState.message}</p>
              {publishState.href ? (
                <Link href={publishState.href} target="_blank" className="mt-2 inline-flex items-center gap-1 underline">
                  View commit
                  <ExternalLink className="size-3" />
                </Link>
              ) : null}
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function buildTokenUrl() {
  const url = new URL("https://github.com/settings/personal-access-tokens/new");
  url.searchParams.set("name", tokenConfig.name);
  url.searchParams.set("description", tokenConfig.description);
  url.searchParams.set("target_name", repository.owner);
  url.searchParams.set("expires_in", String(tokenConfig.expiresInDays));

  Object.entries(tokenConfig.requiredPermissions).forEach(([permission, level]) => {
    url.searchParams.set(permission, level);
  });

  return url.toString();
}

function buildMdx(draft: DraftState, tags: string[]) {
  return `---\ntitle: ${JSON.stringify(draft.title.trim())}\ndate: ${JSON.stringify(draft.date)}\ndescription: ${JSON.stringify(
    draft.description.trim(),
  )}\ntags: [${tags.map((tag) => JSON.stringify(tag)).join(", ")}]\n---\n\n${draft.body.trim()}\n`;
}

function validateDraft(draft: DraftState, slug: string, tags: string[], token: string) {
  if (!token.trim()) {
    throw new Error("Add a GitHub token before publishing.");
  }

  if (!draft.title.trim()) {
    throw new Error("Add a title before publishing.");
  }

  if (!slug) {
    throw new Error("The title needs at least one letter or number for the URL slug.");
  }

  if (!draft.date) {
    throw new Error("Add a date before publishing.");
  }

  if (!draft.description.trim()) {
    throw new Error("Add a description before publishing.");
  }

  if (tags.length === 0) {
    throw new Error("Add at least one tag before publishing.");
  }

  if (!draft.body.trim()) {
    throw new Error("Write the post body before publishing.");
  }
}

function parseTags(tagsInput: string) {
  return tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  const baseName = slugify(parts.join(".") || "image") || "image";

  return extension ? `${baseName}.${extension}` : baseName;
}

function uniqueFileName(fileName: string, existingNames: Set<string>, index: number) {
  const prefix = String(index).padStart(2, "0");
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()}` : "";
  const baseName = parts.join(".") || "image";
  let candidate = `${prefix}-${baseName}${extension}`;
  let suffix = 2;

  while (existingNames.has(candidate)) {
    candidate = `${prefix}-${baseName}-${suffix}${extension}`;
    suffix += 1;
  }

  return candidate;
}

async function ensurePathIsNew(path: string, token: string) {
  const response = await fetch(
    `https://api.github.com/repos/${REPOSITORY_FULL_NAME}/contents/${encodeGitHubPath(path)}?ref=${repository.branch}`,
    {
      headers: githubHeaders(token),
    },
  );

  if (response.status === 404) {
    return;
  }

  if (response.ok) {
    throw new Error(`A post already exists at ${path}. Change the title to create a different slug.`);
  }

  throw new Error(await githubErrorMessage(response));
}

async function putFile({
  path,
  content,
  message,
  token,
}: {
  path: string;
  content: string;
  message: string;
  token: string;
}) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY_FULL_NAME}/contents/${encodeGitHubPath(path)}`, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message,
      content,
      branch: repository.branch,
    }),
  });

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  return (await response.json()) as { commit: { html_url: string } };
}

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ? `GitHub ${response.status}: ${body.message}` : `GitHub request failed: ${response.status}`;
  } catch {
    return `GitHub request failed: ${response.status}`;
  }
}

function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function textToBase64(text: string) {
  return bytesToBase64(new TextEncoder().encode(text));
}

async function fileToBase64(file: File) {
  return bytesToBase64(new Uint8Array(await file.arrayBuffer()));
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
