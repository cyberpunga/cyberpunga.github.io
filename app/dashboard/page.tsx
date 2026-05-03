"use client";

import { Button } from "@/components/ui/button";
import {
  type CollectionDefinition,
  type ContentFieldDefinition,
  type ContentFieldType,
  contentFieldTypes,
  fieldNameFromLabel,
  isReservedCollectionRoute,
  isSafeContentSegment,
  isSafeFieldName,
  normalizeCollectionDefinition,
  normalizeContentSegment,
  orderCollectionDefinitions,
} from "@/lib/content-schema";
import {
  defaultCollectionDefinitions,
  defaultPostCollectionDefinition,
  mergeCollectionDefinitions,
} from "@/lib/default-collections";
import {
  buildGitHubTokenUrl,
  githubErrorMessage,
  githubHeaders,
  writerRepository,
  writerRepositoryFullName,
  writerStorage,
} from "@/lib/github-auth";
import { useAuth } from "@/lib/github-auth-context";
import { siteConfig } from "@/lib/site-config";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileText,
  ImagePlus,
  KeyRound,
  ListPlus,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type SelectedImage = {
  id: string;
  file: File;
  safeName: string;
  previewUrl: string;
};

type ActionState = {
  kind: "idle" | "working" | "success" | "error";
  message: string;
  href?: string;
};

type DeploymentState = {
  kind: "idle" | "waiting" | "running" | "success" | "error" | "unknown";
  message: string;
  commitUrl?: string;
  actionsUrl?: string;
  siteUrl?: string;
};

type DeploymentTarget = {
  sha: string;
  label: string;
  commitUrl: string;
  siteUrl?: string;
  startedAt: number;
};

type FieldDraftValue = string | boolean;

type EntryDraft = {
  title: string;
  description: string;
  fieldValues: Record<string, FieldDraftValue>;
  body: string;
};

type EntrySummary = {
  slug: string;
  title: string;
  description: string;
  path: string;
  sha: string;
  sortValue?: unknown;
};

type EditingEntry = {
  collectionId: string;
  slug: string;
  path: string;
  sha: string;
};

type NewFieldDraft = {
  id: string;
  label: string;
  type: ContentFieldType;
  required: boolean;
  placeholder: string;
  optionsInput: string;
};

type TypeDraft = {
  label: string;
  pluralLabel: string;
  description: string;
  fields: NewFieldDraft[];
};

type GitHubContentItem = {
  type?: string;
  name?: string;
  path?: string;
  sha?: string;
  content?: string;
  encoding?: string;
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

const emptyTypeDraft = (): TypeDraft => ({
  label: "",
  pluralLabel: "",
  description: "",
  fields: [],
});

const baseInputClass =
  "h-11 border border-zinc-800 bg-black px-3 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#c3d9f3] focus:ring-1 focus:ring-[#c3d9f3]";
const textareaClass =
  "resize-y border border-zinc-800 bg-black px-3 py-2 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#c3d9f3] focus:ring-1 focus:ring-[#c3d9f3]";
const deployPollIntervalMs = 6000;
const deployRunStartTimeoutMs = 120000;
const emptyDeploymentState = (): DeploymentState => ({ kind: "idle", message: "" });

export default function DashboardPage() {
  const { auth, signIn, signOut } = useAuth();
  const [collections, setCollections] = useState<CollectionDefinition[]>(defaultCollectionDefinitions);
  const [collectionsState, setCollectionsState] = useState<ActionState>({ kind: "idle", message: "" });
  const [selectedCollectionId, setSelectedCollectionId] = useState(defaultPostCollectionDefinition.id);
  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId) ?? collections[0] ?? defaultPostCollectionDefinition,
    [collections, selectedCollectionId],
  );
  const [draft, setDraft] = useState<EntryDraft>(() => emptyEntryDraft(selectedCollection));
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [typeDraft, setTypeDraft] = useState<TypeDraft>(emptyTypeDraft);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [existingImageNames, setExistingImageNames] = useState<Set<string>>(() => new Set());
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [entriesState, setEntriesState] = useState<ActionState>({ kind: "idle", message: "" });
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
  const [routeState, setRouteState] = useState({ collectionId: "", entrySlug: "" });
  const [actionState, setActionState] = useState<ActionState>({ kind: "idle", message: "" });
  const [deploymentTarget, setDeploymentTarget] = useState<DeploymentTarget | null>(null);
  const [deploymentState, setDeploymentState] = useState<DeploymentState>(emptyDeploymentState);
  const [tokenInput, setTokenInput] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imagesRef = useRef<SelectedImage[]>([]);

  const authToken = auth.kind === "signed-in" ? auth.token : "";
  const slug = useMemo(() => normalizeContentSegment(draft.title), [draft.title]);
  const activeEditingEntry = editingEntry?.collectionId === selectedCollection.id ? editingEntry : null;
  const isEditing = Boolean(activeEditingEntry);
  const outputSlug = activeEditingEntry ? activeEditingEntry.slug : slug || "entry-title";
  const mdx = useMemo(() => buildMdx(selectedCollection, draft), [selectedCollection, draft]);
  const tokenUrl = useMemo(() => buildGitHubTokenUrl(), []);
  const entryPath = activeEditingEntry
    ? activeEditingEntry.path
    : `content/${selectedCollection.id}/${slug || "entry-title"}/page.mdx`;
  const selectedTags = getTagsForCollection(selectedCollection, draft);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(writerStorage.tokenKey) ?? "";

    if (savedToken) {
      setTokenInput(savedToken);
    }
  }, []);

  useEffect(() => {
    function readRouteState() {
      setRouteState(readDashboardRouteState());
    }

    readRouteState();
    window.addEventListener("popstate", readRouteState);
    window.addEventListener("hashchange", readRouteState);

    return () => {
      window.removeEventListener("popstate", readRouteState);
      window.removeEventListener("hashchange", readRouteState);
    };
  }, []);

  useEffect(() => {
    if (auth.kind !== "signed-in" || !authToken) {
      setCollections(defaultCollectionDefinitions);
      setCollectionsState({ kind: "idle", message: "" });
      setEntries([]);
      setEntriesState({ kind: "idle", message: "" });
      setEditingEntry(null);
      return;
    }

    let ignore = false;
    setCollectionsState({ kind: "working", message: "Loading content types..." });

    loadCollectionsFromGitHub(authToken)
      .then((nextCollections) => {
        if (ignore) {
          return;
        }

        setCollections(nextCollections);
        setCollectionsState({ kind: "success", message: "Content types loaded." });
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setCollections(defaultCollectionDefinitions);
        setCollectionsState({
          kind: "error",
          message: error instanceof Error ? error.message : "Could not load content types.",
        });
      });

    return () => {
      ignore = true;
    };
  }, [auth.kind, authToken]);

  useEffect(() => {
    if (routeState.collectionId && collections.some((collection) => collection.id === routeState.collectionId)) {
      setSelectedCollectionId(routeState.collectionId);
    }
  }, [collections, routeState.collectionId]);

  useEffect(() => {
    if (!collections.some((collection) => collection.id === selectedCollectionId)) {
      setSelectedCollectionId(collections[0]?.id ?? defaultPostCollectionDefinition.id);
    }
  }, [collections, selectedCollectionId]);

  useEffect(() => {
    setDraftLoaded(false);

    const savedDraft = window.localStorage.getItem(draftStorageKey(selectedCollection.id));
    const nextDraft = savedDraft ? parseStoredDraft(savedDraft, selectedCollection) : emptyEntryDraft(selectedCollection);

    setDraft(nextDraft);
    setEditingEntry((current) => (current?.collectionId === selectedCollection.id ? current : null));
    setExistingImageNames(new Set());
    clearSelectedImages();
    setActionState({ kind: "idle", message: "" });
    setDeploymentTarget(null);
    setDeploymentState(emptyDeploymentState());
    setDraftLoaded(true);
  }, [selectedCollection]);

  useEffect(() => {
    if (!draftLoaded || isEditing) {
      return;
    }

    window.localStorage.setItem(draftStorageKey(selectedCollection.id), JSON.stringify(draft));
  }, [draft, draftLoaded, isEditing, selectedCollection.id]);

  useEffect(() => {
    if (auth.kind !== "signed-in") {
      return;
    }

    let ignore = false;
    setEntriesState({ kind: "working", message: `Loading ${selectedCollection.pluralLabel.toLowerCase()}...` });

    loadEntriesFromGitHub(selectedCollection, auth.token)
      .then((nextEntries) => {
        if (ignore) {
          return;
        }

        setEntries(nextEntries);
        setEntriesState({
          kind: "success",
          message: nextEntries.length
            ? `${nextEntries.length} ${nextEntries.length === 1 ? selectedCollection.label.toLowerCase() : selectedCollection.pluralLabel.toLowerCase()} loaded.`
            : `No ${selectedCollection.pluralLabel.toLowerCase()} yet.`,
        });
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setEntries([]);
        setEntriesState({
          kind: "error",
          message: error instanceof Error ? error.message : "Could not load entries.",
        });
      });

    return () => {
      ignore = true;
    };
  }, [auth, selectedCollection]);

  useEffect(() => {
    if (auth.kind !== "signed-in" || !routeState.entrySlug || selectedCollection.id !== routeState.collectionId) {
      return;
    }

    if (editingEntry?.collectionId === selectedCollection.id && editingEntry.slug === routeState.entrySlug) {
      return;
    }

    let ignore = false;
    setActionState({ kind: "working", message: `Loading ${selectedCollection.label.toLowerCase()}...` });
    setDeploymentTarget(null);
    setDeploymentState(emptyDeploymentState());

    Promise.all([
      loadEntryFromGitHub(selectedCollection, routeState.entrySlug, auth.token),
      loadEntryImageNamesFromGitHub(selectedCollection.id, routeState.entrySlug, auth.token),
    ])
      .then(([entry, remoteImageNames]) => {
        if (ignore) {
          return;
        }

        setDraft(entry.draft);
        setDraftLoaded(true);
        setEditingEntry({
          collectionId: selectedCollection.id,
          slug: entry.slug,
          path: entry.path,
          sha: entry.sha,
        });
        setExistingImageNames(remoteImageNames);
        clearSelectedImages();
        setActionState({ kind: "idle", message: "" });
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setActionState({
          kind: "error",
          message: error instanceof Error ? error.message : "Could not load entry.",
        });
      });

    return () => {
      ignore = true;
    };
  }, [auth, routeState.entrySlug, routeState.collectionId, selectedCollection, editingEntry]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    if (auth.kind !== "signed-in" || !authToken || !deploymentTarget) {
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
            error instanceof Error
              ? error.message
              : "Saved on GitHub, but the deploy status could not be loaded.",
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
  }, [auth.kind, authToken, deploymentTarget]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  function updateDraft<Key extends keyof Omit<EntryDraft, "fieldValues">>(key: Key, value: EntryDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateFieldValue(field: ContentFieldDefinition, value: FieldDraftValue) {
    setDraft((current) => ({
      ...current,
      fieldValues: {
        ...current.fieldValues,
        [field.name]: value,
      },
    }));
  }

  async function handleSignIn() {
    if (!tokenInput.trim()) {
      return;
    }

    try {
      await signIn(tokenInput);
    } catch {
      setTokenInput("");
    }
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const existingNames = new Set([...existingImageNames, ...images.map((image) => image.safeName)]);
    const nextImages = files.map((file, index) => {
      const safeName = uniqueFileName(sanitizeFileName(file.name), existingNames, images.length + index + 1);
      existingNames.add(safeName);

      return {
        id: `${file.name}-${file.lastModified}-${randomId()}`,
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

  function clearSelectedImages() {
    setImages((current) => {
      current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
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

  function selectCollection(collectionId: string) {
    setSelectedCollectionId(collectionId);
    setEditingEntry(null);
    setExistingImageNames(new Set());
    updateDashboardUrl(collectionId);
  }

  function updateDashboardUrl(collectionId: string, entrySlug?: string) {
    const url = new URL(window.location.href);
    url.searchParams.delete("type");
    url.searchParams.delete("entry");
    url.hash = entrySlug
      ? `/${encodeURIComponent(collectionId)}/${encodeURIComponent(entrySlug)}`
      : `/${encodeURIComponent(collectionId)}`;

    if (url.toString() !== window.location.href) {
      window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }

    setRouteState({ collectionId, entrySlug: entrySlug ?? "" });
  }

  function startNewEntry() {
    setEditingEntry(null);
    setExistingImageNames(new Set());
    setDraft(emptyEntryDraft(selectedCollection));
    clearSelectedImages();
    setActionState({ kind: "idle", message: "" });
    setDeploymentTarget(null);
    setDeploymentState(emptyDeploymentState());
    updateDashboardUrl(selectedCollection.id);
  }

  async function refreshCollections() {
    if (auth.kind !== "signed-in") {
      return;
    }

    setCollectionsState({ kind: "working", message: "Loading content types..." });

    try {
      const nextCollections = await loadCollectionsFromGitHub(auth.token);
      setCollections(nextCollections);
      setCollectionsState({ kind: "success", message: "Content types loaded." });
    } catch (error) {
      setCollectionsState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load content types.",
      });
    }
  }

  async function refreshEntries() {
    if (auth.kind !== "signed-in") {
      return;
    }

    setEntriesState({ kind: "working", message: `Loading ${selectedCollection.pluralLabel.toLowerCase()}...` });

    try {
      const nextEntries = await loadEntriesFromGitHub(selectedCollection, auth.token);
      setEntries(nextEntries);
      setEntriesState({
        kind: "success",
        message: nextEntries.length
          ? `${nextEntries.length} ${nextEntries.length === 1 ? selectedCollection.label.toLowerCase() : selectedCollection.pluralLabel.toLowerCase()} loaded.`
          : `No ${selectedCollection.pluralLabel.toLowerCase()} yet.`,
      });
    } catch (error) {
      setEntriesState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load entries.",
      });
    }
  }

  async function loadEntryForEdit(entrySlug: string) {
    if (auth.kind !== "signed-in") {
      return;
    }

    setActionState({ kind: "working", message: `Loading ${selectedCollection.label.toLowerCase()}...` });
    setDeploymentTarget(null);
    setDeploymentState(emptyDeploymentState());

    try {
      const entry = await loadEntryFromGitHub(selectedCollection, entrySlug, auth.token);
      const remoteImageNames = await loadEntryImageNamesFromGitHub(selectedCollection.id, entry.slug, auth.token);

      setDraft(entry.draft);
      setDraftLoaded(true);
      setEditingEntry({
        collectionId: selectedCollection.id,
        slug: entry.slug,
        path: entry.path,
        sha: entry.sha,
      });
      setExistingImageNames(remoteImageNames);
      clearSelectedImages();
      setActionState({ kind: "idle", message: "" });
      updateDashboardUrl(selectedCollection.id, entry.slug);
    } catch (error) {
      setActionState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load entry.",
      });
    }
  }

  async function publishEntry() {
    if (auth.kind !== "signed-in") {
      return;
    }

    setActionState({
      kind: "working",
      message: `${isEditing ? "Preparing update for" : "Preparing"} ${selectedCollection.label.toLowerCase()}...`,
    });
    setDeploymentTarget(null);
    setDeploymentState(emptyDeploymentState());

    try {
      const targetSlug = activeEditingEntry ? activeEditingEntry.slug : slug;
      const pagePath = activeEditingEntry
        ? activeEditingEntry.path
        : `content/${selectedCollection.id}/${targetSlug}/page.mdx`;

      validateEntryDraft(selectedCollection, draft, targetSlug, auth.token);

      if (!activeEditingEntry) {
        await ensurePathIsNew(pagePath, auth.token.trim());
      }

      for (const image of images) {
        setActionState({ kind: "working", message: `Uploading ${image.safeName}...` });
        const content = await fileToBase64(image.file);
        await putFile({
          path: `content/${selectedCollection.id}/${targetSlug}/images/${image.safeName}`,
          content,
          message: `Add image for ${draft.title}`,
          token: auth.token.trim(),
        });
      }

      setActionState({
        kind: "working",
        message: `${isEditing ? "Updating" : "Publishing"} ${selectedCollection.label.toLowerCase()}...`,
      });
      const result = await putFile({
        path: pagePath,
        content: textToBase64(mdx),
        message: `${isEditing ? "Update" : "Add"} ${selectedCollection.label.toLowerCase()}: ${draft.title}`,
        token: auth.token.trim(),
        sha: activeEditingEntry ? activeEditingEntry.sha : undefined,
      });

      window.localStorage.removeItem(draftStorageKey(selectedCollection.id));
      const nextEntry = {
        slug: targetSlug,
        title: draft.title.trim(),
        description: draft.description.trim(),
        path: pagePath,
        sha: result.content?.sha ?? (activeEditingEntry ? activeEditingEntry.sha : ""),
        sortValue: getDraftSortValue(selectedCollection, draft),
      };

      setEntries((current) => sortEntrySummaries([...current.filter((entry) => entry.slug !== targetSlug), nextEntry], selectedCollection));
      setEditingEntry(
        activeEditingEntry
          ? {
              collectionId: selectedCollection.id,
              slug: targetSlug,
              path: pagePath,
              sha: nextEntry.sha || activeEditingEntry.sha,
            }
          : null,
      );
      setExistingImageNames((current) => new Set([...current, ...images.map((image) => image.safeName)]));
      if (!isEditing) {
        setDraft(emptyEntryDraft(selectedCollection));
        updateDashboardUrl(selectedCollection.id);
      }
      clearSelectedImages();
      setActionState({
        kind: "success",
        message: `${isEditing ? "Updated" : "Published"} on GitHub. Waiting for the site deploy now.`,
        href: result.commit.html_url,
      });
      startDeploymentWatch({
        sha: result.commit.sha,
        label: `${selectedCollection.label} "${nextEntry.title}"`,
        commitUrl: result.commit.html_url,
        siteUrl: buildPublicEntryUrl(selectedCollection, targetSlug),
      });
    } catch (error) {
      setActionState({
        kind: "error",
        message: error instanceof Error ? error.message : "Publishing failed.",
      });
    }
  }

  async function createContentType() {
    if (auth.kind !== "signed-in") {
      return;
    }

    setActionState({ kind: "working", message: "Preparing content type..." });
    setDeploymentTarget(null);
    setDeploymentState(emptyDeploymentState());

    try {
      const definition = buildCollectionDefinition(typeDraft, collections);
      const typePath = `content/${definition.id}/_type.json`;
      await ensurePathIsNew(typePath, auth.token.trim());

      const result = await putFile({
        path: typePath,
        content: textToBase64(`${JSON.stringify(definition, null, 2)}\n`),
        message: `Add content type: ${definition.pluralLabel}`,
        token: auth.token.trim(),
      });

      setCollections((current) => orderCollectionDefinitions([...current, definition]));
      setSelectedCollectionId(definition.id);
      setTypeDraft(emptyTypeDraft());
      setActionState({
        kind: "success",
        message: "Content type added to GitHub. Waiting for the site deploy now.",
        href: result.commit.html_url,
      });
      startDeploymentWatch({
        sha: result.commit.sha,
        label: `Content type "${definition.pluralLabel}"`,
        commitUrl: result.commit.html_url,
        siteUrl: buildPublicCollectionUrl(definition),
      });
    } catch (error) {
      setActionState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not create content type.",
      });
    }
  }

  if (auth.kind === "checking") {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
        <div className="flex h-48 items-center justify-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Checking authentication...</p>
        </div>
      </main>
    );
  }

  if (auth.kind !== "signed-in") {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
        <header className="border-b border-zinc-900 pb-6">
          <p className="mb-2 font-mono text-xs font-normal uppercase tracking-[0.18em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="font-mono text-3xl font-normal text-zinc-50 md:text-4xl">Sign in with GitHub</h1>
        </header>

        <section className="border border-zinc-900 bg-black p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-mono text-lg font-normal text-zinc-50">Repository access</h2>
              <p className="mt-1 font-mono text-xs text-zinc-500">{writerRepositoryFullName}</p>
            </div>
            <Button asChild variant="outline">
              <a href={tokenUrl} target="_blank" rel="noreferrer">
                <KeyRound />
                Create token
                <ExternalLink />
              </a>
            </Button>
          </div>

          <label className="mb-4 flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">GitHub token</span>
            <input
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              className={baseInputClass}
              placeholder="github_pat_..."
            />
          </label>

          <Button type="button" className="w-full sm:w-auto" onClick={handleSignIn}>
            <KeyRound />
            Sign in
          </Button>

          <p className="mt-4 text-sm leading-6 text-zinc-500">
            The token link pre-fills the owner, Contents write, and Actions read permissions. In GitHub, choose Only
            select repositories, then select {writerRepository.name}. The token stays in this browser.
          </p>

          {auth.kind === "invalid" ? (
            <p className="mt-4 border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-200">
              {auth.message || "Authentication failed. Check your token and try again."}
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-900 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs font-normal uppercase tracking-[0.18em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="font-mono text-3xl font-normal text-zinc-50 md:text-4xl">
            {isEditing ? "Edit" : "New"} {selectedCollection.label.toLowerCase()}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Signed in as{" "}
            <Link href={auth.user.htmlUrl} target="_blank" className="text-[#c3d9f3] underline">
              @{auth.user.login}
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild variant="outline">
            <a href={tokenUrl} target="_blank" rel="noreferrer">
              <KeyRound />
              Token
              <ExternalLink />
            </a>
          </Button>
          <Button type="button" variant="outline" onClick={startNewEntry}>
            <Plus />
            New entry
          </Button>
          <Button onClick={publishEntry} disabled={actionState.kind === "working"}>
            <Send />
            {isEditing ? "Save" : "Publish"}
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="border border-zinc-900 bg-black p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Title</span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className={baseInputClass}
                  placeholder={`${selectedCollection.label} title`}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  rows={3}
                  className={textareaClass}
                  placeholder="Short summary for listings and metadata."
                />
              </label>

              {selectedCollection.fields.map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={draft.fieldValues[field.name] ?? defaultFieldValue(field)}
                  onChange={(value) => updateFieldValue(field, value)}
                />
              ))}
            </div>
          </section>

          <section className="border border-zinc-900 bg-black p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-mono text-lg font-normal text-zinc-50">
                {selectedCollection.bodyLabel ?? "Body"}
              </h2>
              <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-zinc-800 px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-zinc-100 transition-colors hover:border-zinc-500">
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
              className="min-h-[420px] w-full resize-y border border-zinc-800 bg-black px-3 py-3 font-mono text-sm leading-6 text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#c3d9f3] focus:ring-1 focus:ring-[#c3d9f3]"
              placeholder={selectedCollection.bodyPlaceholder ?? "Write in Markdown."}
            />
          </section>

          {images.length > 0 ? (
            <section className="border border-zinc-900 bg-black p-4 md:p-5">
              <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">Images</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="overflow-hidden border border-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.previewUrl} alt="" className="aspect-video w-full object-cover" />
                    <div className="space-y-3 p-3">
                      <p className="truncate font-mono text-xs text-zinc-500">{image.safeName}</p>
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

          <section className="border border-zinc-900 bg-black p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-mono text-lg font-normal text-zinc-50">New content type</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => addTypeField()}>
                <Plus />
                Field
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Singular label</span>
                <input
                  value={typeDraft.label}
                  onChange={(event) => setTypeDraft((current) => ({ ...current, label: event.target.value }))}
                  className={baseInputClass}
                  placeholder="Reseña"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Plural label</span>
                <input
                  value={typeDraft.pluralLabel}
                  onChange={(event) => setTypeDraft((current) => ({ ...current, pluralLabel: event.target.value }))}
                  className={baseInputClass}
                  placeholder="Reseñas"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Description</span>
                <textarea
                  value={typeDraft.description}
                  onChange={(event) => setTypeDraft((current) => ({ ...current, description: event.target.value }))}
                  rows={2}
                  className={textareaClass}
                  placeholder="Short summary for the collection page."
                />
              </label>
            </div>

            {typeDraft.fields.length > 0 ? (
              <div className="mt-5 space-y-3">
                {typeDraft.fields.map((field) => (
                  <NewFieldEditor
                    key={field.id}
                    field={field}
                    onChange={(nextField) => updateTypeField(field.id, nextField)}
                    onRemove={() => removeTypeField(field.id)}
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={() => addTypeField()}>
                <ListPlus />
                Add field
              </Button>
              <Button type="button" onClick={createContentType} disabled={actionState.kind === "working"}>
                <FileText />
                Create type
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-zinc-900 bg-black p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-mono text-lg font-normal text-zinc-50">Content types</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {collectionsState.message || "Ready"}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={refreshCollections}>
                <RefreshCw />
                <span className="sr-only">Refresh types</span>
              </Button>
            </div>
            <div className="grid gap-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => selectCollection(collection.id)}
                  className={`w-full border px-3 py-2 text-left transition-colors ${
                    selectedCollection.id === collection.id
                      ? "border-zinc-100 bg-zinc-950"
                      : "border-zinc-900 hover:border-zinc-700"
                  }`}
                >
                  <span className="flex items-start gap-2">
                    <FileText className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-50">
                        {collection.pluralLabel}
                      </span>
                      <span className="mt-1 block truncate font-mono text-xs text-zinc-500">
                        /{collection.route}
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="border border-zinc-900 bg-black p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-mono text-lg font-normal text-zinc-50">Entries</h2>
                <p className="mt-1 text-xs text-zinc-500">{entriesState.message || "Ready"}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={refreshEntries}>
                <RefreshCw />
                <span className="sr-only">Refresh entries</span>
              </Button>
            </div>
            <div className="grid gap-2">
              <Button type="button" variant={isEditing ? "outline" : "secondary"} className="justify-start" onClick={startNewEntry}>
                <Plus />
                New {selectedCollection.label.toLowerCase()}
              </Button>
              {entries.length > 0 ? (
                <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
                  {entries.map((entry) => (
                    <button
                      key={entry.slug}
                      type="button"
                      onClick={() => loadEntryForEdit(entry.slug)}
                      className={`w-full border px-3 py-2 text-left transition-colors ${
                        activeEditingEntry?.slug === entry.slug
                          ? "border-zinc-100 bg-zinc-950"
                          : "border-zinc-900 hover:border-zinc-700"
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        <Pencil className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-zinc-50">
                            {entry.title}
                          </span>
                          <span className="mt-1 block truncate font-mono text-xs text-zinc-500">
                            {entry.slug}
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="border border-dashed border-zinc-800 p-3 text-sm text-zinc-500">
                  No entries found.
                </p>
              )}
            </div>
          </section>

          <section className="border border-zinc-900 bg-black p-4">
            <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">Session</h2>
            <dl className="mb-4 space-y-3 text-sm">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">GitHub</dt>
                <dd className="break-all font-mono text-zinc-100">@{auth.user.login}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Access</dt>
                <dd className="text-zinc-100">Write enabled</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Types</dt>
                <dd className="text-zinc-100">{collectionsState.message || "Ready"}</dd>
              </div>
            </dl>
            <div className="grid gap-2">
              <Button type="button" variant="outline" className="w-full" onClick={refreshCollections}>
                <RefreshCw />
                Refresh types
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={signOut}>
                <LogOut />
                Sign out
              </Button>
            </div>
          </section>

          <section className="border border-zinc-900 bg-black p-4">
            <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">Output</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Repository</dt>
                <dd className="break-all font-mono text-zinc-100">{writerRepositoryFullName}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Branch</dt>
                <dd className="break-all font-mono text-zinc-100">{writerRepository.branch}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Type</dt>
                <dd className="break-all font-mono text-zinc-100">{selectedCollection.id}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Mode</dt>
                <dd className="break-all font-mono text-zinc-100">
                  {isEditing ? "edit" : "new"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Route</dt>
                <dd className="break-all font-mono text-zinc-100">/{selectedCollection.route}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Slug</dt>
                <dd className="break-all font-mono text-zinc-100">{outputSlug}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Path</dt>
                <dd className="break-all font-mono text-zinc-100">{entryPath}</dd>
              </div>
              {selectedTags.length > 0 ? (
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Tags</dt>
                  <dd className="text-zinc-100">{selectedTags.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="border border-zinc-900 bg-black p-4">
            <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">MDX</h2>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap border border-zinc-900 bg-zinc-950 p-3 font-mono text-xs leading-5 text-zinc-200">
              {mdx}
            </pre>
          </section>

          <PublishingStatusPanel actionState={actionState} deploymentState={deploymentState} />
        </aside>
      </section>
    </main>
  );

  function startDeploymentWatch(target: Omit<DeploymentTarget, "startedAt">) {
    const nextTarget = { ...target, startedAt: Date.now() };
    setDeploymentTarget(nextTarget);
    setDeploymentState(waitingForDeploymentRunState(nextTarget));
  }

  function addTypeField() {
    setTypeDraft((current) => ({
      ...current,
      fields: [
        ...current.fields,
        {
          id: randomId(),
          label: "",
          type: "text",
          required: false,
          placeholder: "",
          optionsInput: "",
        },
      ],
    }));
  }

  function updateTypeField(id: string, nextField: NewFieldDraft) {
    setTypeDraft((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === id ? nextField : field)),
    }));
  }

  function removeTypeField(id: string) {
    setTypeDraft((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.id !== id),
    }));
  }
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ContentFieldDefinition;
  value: FieldDraftValue;
  onChange: (value: FieldDraftValue) => void;
}) {
  if (field.type === "boolean") {
    return (
      <label className="flex min-h-11 items-center gap-3 border border-zinc-800 px-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 border-zinc-700 bg-black accent-zinc-100"
        />
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">{field.label}</span>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="flex flex-col gap-2 md:col-span-2">
        <FieldLabel field={field} />
        <textarea
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={textareaClass}
          placeholder={field.placeholder}
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="flex flex-col gap-2">
        <FieldLabel field={field} />
        <select value={String(value)} onChange={(event) => onChange(event.target.value)} className={baseInputClass}>
          <option value="">Select...</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-2">
      <FieldLabel field={field} />
      <input
        type={field.type === "date" ? "date" : "text"}
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        className={baseInputClass}
        placeholder={field.placeholder}
      />
    </label>
  );
}

function FieldLabel({ field }: { field: ContentFieldDefinition }) {
  return (
    <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">
      {field.label}
      {field.required ? <span className="text-red-400"> *</span> : null}
    </span>
  );
}

function PublishingStatusPanel({
  actionState,
  deploymentState,
}: {
  actionState: ActionState;
  deploymentState: DeploymentState;
}) {
  if (!actionState.message && !deploymentState.message) {
    return null;
  }

  const isError = actionState.kind === "error" || deploymentState.kind === "error";
  const isSuccess = actionState.kind === "success" && deploymentState.kind === "success";

  return (
    <section
      className={`border p-4 text-sm ${
        isError
          ? "border-red-900/60 bg-red-950/30 text-red-200"
          : isSuccess
            ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-100"
            : "border-zinc-900 bg-black text-zinc-200"
      }`}
    >
      {actionState.message ? <p>{actionState.message}</p> : null}
      {deploymentState.message ? (
        <div className="mt-3 flex items-start gap-2">
          <DeploymentStatusIcon kind={deploymentState.kind} />
          <p>{deploymentState.message}</p>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {actionState.href ? (
          <Link href={actionState.href} target="_blank" className="inline-flex items-center gap-1 underline">
            View commit
            <ExternalLink className="size-3" />
          </Link>
        ) : null}
        {deploymentState.actionsUrl ? (
          <Link href={deploymentState.actionsUrl} target="_blank" className="inline-flex items-center gap-1 underline">
            View deploy
            <ExternalLink className="size-3" />
          </Link>
        ) : null}
        {deploymentState.siteUrl && deploymentState.kind === "success" ? (
          <Link href={deploymentState.siteUrl} target="_blank" className="inline-flex items-center gap-1 underline">
            View live page
            <ExternalLink className="size-3" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function DeploymentStatusIcon({ kind }: { kind: DeploymentState["kind"] }) {
  if (kind === "success") {
    return <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />;
  }

  if (kind === "error") {
    return <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-300" />;
  }

  if (kind === "running") {
    return <RefreshCw className="mt-0.5 size-4 shrink-0 animate-spin" />;
  }

  return <Clock3 className="mt-0.5 size-4 shrink-0 text-zinc-500" />;
}

function NewFieldEditor({
  field,
  onChange,
  onRemove,
}: {
  field: NewFieldDraft;
  onChange: (field: NewFieldDraft) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 border border-zinc-900 p-3 md:grid-cols-[minmax(0,1fr)_160px_auto]">
      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Field label</span>
        <input
          value={field.label}
          onChange={(event) => onChange({ ...field, label: event.target.value })}
          className={baseInputClass}
          placeholder="Rating"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Type</span>
        <select
          value={field.type}
          onChange={(event) => onChange({ ...field, type: event.target.value as ContentFieldType })}
          className={baseInputClass}
        >
          {contentFieldTypes.map((fieldType) => (
            <option key={fieldType} value={fieldType}>
              {fieldType}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-2">
        <label className="flex h-11 items-center gap-2 border border-zinc-800 px-3">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(event) => onChange({ ...field, required: event.target.checked })}
            className="size-4 border-zinc-700 bg-black accent-zinc-100"
          />
          <span className="text-sm text-zinc-300">Required</span>
        </label>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 />
          <span className="sr-only">Remove field</span>
        </Button>
      </div>
      <label className="flex flex-col gap-2 md:col-span-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Placeholder</span>
        <input
          value={field.placeholder}
          onChange={(event) => onChange({ ...field, placeholder: event.target.value })}
          className={baseInputClass}
          placeholder="Optional"
        />
      </label>
      {field.type === "select" ? (
        <label className="flex flex-col gap-2 md:col-span-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Options</span>
          <input
            value={field.optionsInput}
            onChange={(event) => onChange({ ...field, optionsInput: event.target.value })}
            className={baseInputClass}
            placeholder="Draft, Published, Archived"
          />
        </label>
      ) : null}
    </div>
  );
}

function emptyEntryDraft(collection: CollectionDefinition): EntryDraft {
  return {
    title: "",
    description: "",
    fieldValues: Object.fromEntries(collection.fields.map((field) => [field.name, defaultFieldValue(field)])),
    body: "",
  };
}

function defaultFieldValue(field: ContentFieldDefinition): FieldDraftValue {
  if (field.type === "boolean") {
    return false;
  }

  if (field.type === "date") {
    return new Date().toISOString().slice(0, 10);
  }

  return "";
}

function parseStoredDraft(rawDraft: string, collection: CollectionDefinition) {
  try {
    const parsed = JSON.parse(rawDraft) as Partial<EntryDraft>;
    const fallback = emptyEntryDraft(collection);
    const parsedFieldValues = parsed.fieldValues && typeof parsed.fieldValues === "object" ? parsed.fieldValues : {};

    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
      body: typeof parsed.body === "string" ? parsed.body : "",
      fieldValues: {
        ...fallback.fieldValues,
        ...parsedFieldValues,
      },
    };
  } catch {
    window.localStorage.removeItem(draftStorageKey(collection.id));
    return emptyEntryDraft(collection);
  }
}

function readDashboardRouteState() {
  const hashPath = window.location.hash.replace(/^#\/?/, "");
  const hashSegments = hashPath
    .split("/")
    .map((segment) => decodeURIComponent(segment).trim())
    .filter(Boolean);

  if (hashSegments[0]) {
    return {
      collectionId: normalizeContentSegment(hashSegments[0]),
      entrySlug: normalizeContentSegment(hashSegments[1] ?? ""),
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    collectionId: normalizeContentSegment(params.get("type") ?? ""),
    entrySlug: normalizeContentSegment(params.get("entry") ?? ""),
  };
}

function parseMdxDraft(collection: CollectionDefinition, mdx: string): EntryDraft {
  const fallback = emptyEntryDraft(collection);
  const match = mdx.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      ...fallback,
      body: mdx.trim(),
    };
  }

  const frontmatter = parseFrontmatter(match[1]);
  const body = match[2].trim();

  return {
    title: typeof frontmatter.title === "string" ? frontmatter.title : fallback.title,
    description: typeof frontmatter.description === "string" ? frontmatter.description : fallback.description,
    fieldValues: Object.fromEntries(
      collection.fields.map((field) => [
        field.name,
        frontmatterValueToDraftValue(field, frontmatter[field.name], fallback.fieldValues[field.name]),
      ]),
    ),
    body,
  };
}

function parseFrontmatter(frontmatter: string) {
  const entries: Record<string, unknown> = {};

  frontmatter.split(/\r?\n/).forEach((line) => {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!key) {
      return;
    }

    entries[key] = parseFrontmatterLiteral(rawValue);
  });

  return entries;
}

function parseFrontmatterLiteral(value: string): unknown {
  if (!value) {
    return "";
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value.startsWith("[") || value.startsWith("{") || value.startsWith("\"")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value.replace(/^['"]|['"]$/g, "");
}

function frontmatterValueToDraftValue(field: ContentFieldDefinition, value: unknown, fallback: FieldDraftValue) {
  if (field.type === "boolean") {
    return typeof value === "boolean" ? value : Boolean(fallback);
  }

  if (field.type === "list" || field.type === "tags") {
    if (Array.isArray(value)) {
      return value.map(String).join(", ");
    }

    return typeof value === "string" ? value : String(fallback ?? "");
  }

  return typeof value === "string" ? value : String(value ?? fallback ?? "");
}

function draftStorageKey(collectionId: string) {
  return `${writerStorage.draftKey}:${collectionId}`;
}

function buildMdx(collection: CollectionDefinition, draft: EntryDraft) {
  const frontmatterEntries: Array<[string, unknown]> = [
    ["title", draft.title.trim()],
    ["description", draft.description.trim()],
    ...collection.fields.map((field): [string, unknown] => [field.name, parseFieldValue(field, draft.fieldValues[field.name])]),
  ];

  return `---\n${frontmatterEntries
    .filter(([, value]) => !isEmptyFrontmatterValue(value))
    .map(([key, value]) => `${key}: ${serializeFrontmatterValue(value)}`)
    .join("\n")}\n---\n\n${draft.body.trim()}\n`;
}

function parseFieldValue(field: ContentFieldDefinition, value: FieldDraftValue | undefined) {
  if (field.type === "boolean") {
    return Boolean(value);
  }

  if (field.type === "list" || field.type === "tags") {
    return parseListInput(String(value ?? ""));
  }

  return String(value ?? "").trim();
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
  return value === "" || (Array.isArray(value) && value.length === 0);
}

function validateEntryDraft(collection: CollectionDefinition, draft: EntryDraft, slug: string, token: string) {
  if (!token.trim()) {
    throw new Error("Add a GitHub token before publishing.");
  }

  if (!draft.title.trim()) {
    throw new Error("Add a title before publishing.");
  }

  if (!slug) {
    throw new Error("The title needs at least one letter or number for the URL slug.");
  }

  if (!draft.description.trim()) {
    throw new Error("Add a description before publishing.");
  }

  for (const field of collection.fields) {
    const value = parseFieldValue(field, draft.fieldValues[field.name]);

    if (field.required && isEmptyFrontmatterValue(value)) {
      throw new Error(`Add ${field.label.toLowerCase()} before publishing.`);
    }
  }

  if (!draft.body.trim()) {
    throw new Error("Write the body before publishing.");
  }
}

function buildCollectionDefinition(typeDraft: TypeDraft, existingCollections: CollectionDefinition[]) {
  const label = typeDraft.label.trim();
  const pluralLabel = typeDraft.pluralLabel.trim();
  const route = normalizeContentSegment(pluralLabel || label);

  if (!label) {
    throw new Error("Add a singular label for the content type.");
  }

  if (!pluralLabel) {
    throw new Error("Add a plural label for the content type.");
  }

  if (!route || !isSafeContentSegment(route)) {
    throw new Error("The plural label needs at least one letter or number for the route.");
  }

  if (isReservedCollectionRoute(route)) {
    throw new Error(`/${route} is reserved. Choose a different plural label.`);
  }

  if (existingCollections.some((collection) => collection.id === route || collection.route === route)) {
    throw new Error(`A content type already uses ${route}.`);
  }

  const fields = typeDraft.fields.map((field) => buildFieldDefinition(field));
  const seenFieldNames = new Set<string>();

  for (const field of fields) {
    if (seenFieldNames.has(field.name)) {
      throw new Error(`Field "${field.label}" creates a duplicate frontmatter key.`);
    }

    seenFieldNames.add(field.name);
  }

  return normalizeCollectionDefinition({
    id: route,
    label,
    pluralLabel,
    description: typeDraft.description.trim(),
    route,
    bodyLabel: "Cuerpo",
    bodyPlaceholder: "Escribe en Markdown.",
    sort: fields.find((field) => field.type === "date") ? { field: fields.find((field) => field.type === "date")?.name, direction: "desc" } : undefined,
    fields,
  });
}

function buildFieldDefinition(field: NewFieldDraft): ContentFieldDefinition {
  const label = field.label.trim();
  const name = fieldNameFromLabel(label);

  if (!label) {
    throw new Error("Every custom field needs a label.");
  }

  if (!name || !isSafeFieldName(name)) {
    throw new Error(`Field "${label}" needs a safe frontmatter key.`);
  }

  const options = parseListInput(field.optionsInput);

  if (field.type === "select" && options.length === 0) {
    throw new Error(`Field "${label}" needs at least one select option.`);
  }

  return {
    name,
    label,
    type: field.type,
    required: field.required,
    placeholder: field.placeholder.trim() || undefined,
    options: field.type === "select" ? options : undefined,
  };
}

function getTagsForCollection(collection: CollectionDefinition, draft: EntryDraft) {
  const tagsField = collection.fields.find((field) => field.type === "tags");

  if (!tagsField) {
    return [];
  }

  return parseListInput(String(draft.fieldValues[tagsField.name] ?? ""));
}

function parseListInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDraftSortValue(collection: CollectionDefinition, draft: EntryDraft) {
  const sortField = collection.sort?.field;

  if (!sortField) {
    return draft.title.trim();
  }

  if (sortField === "title") {
    return draft.title.trim();
  }

  if (sortField === "description") {
    return draft.description.trim();
  }

  return draft.fieldValues[sortField];
}

function sortEntrySummaries(entries: EntrySummary[], collection: CollectionDefinition) {
  const direction = collection.sort ? (collection.sort.direction === "asc" ? 1 : -1) : 1;

  return [...entries].sort((a, b) => {
    const valueDifference = compareSortValues(a.sortValue ?? a.title, b.sortValue ?? b.title);

    if (valueDifference !== 0) {
      return valueDifference * direction;
    }

    return a.title.localeCompare(b.title, "es");
  });
}

function compareSortValues(a: unknown, b: unknown) {
  const aDate = typeof a === "string" ? new Date(a).getTime() : Number.NaN;
  const bDate = typeof b === "string" ? new Date(b).getTime() : Number.NaN;

  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
    return aDate - bDate;
  }

  return String(a ?? "").localeCompare(String(b ?? ""), "es");
}

async function loadCollectionsFromGitHub(token: string) {
  const response = await fetch(
    `https://api.github.com/repos/${writerRepositoryFullName}/contents/content?ref=${writerRepository.branch}`,
    {
      headers: githubHeaders(token),
    },
  );

  if (response.status === 404) {
    return defaultCollectionDefinitions;
  }

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  const items = (await response.json()) as GitHubContentItem[] | GitHubContentItem;

  if (!Array.isArray(items)) {
    return defaultCollectionDefinitions;
  }

  const definitions = (
    await Promise.all(
      items
        .filter((item) => item.type === "dir" && item.name)
        .map((item) => loadCollectionDefinitionFromGitHub(item.name as string, token)),
    )
  ).filter((definition): definition is CollectionDefinition => Boolean(definition));
  return mergeCollectionDefinitions(definitions);
}

async function loadCollectionDefinitionFromGitHub(id: string, token: string) {
  const response = await fetch(
    `https://api.github.com/repos/${writerRepositoryFullName}/contents/content/${encodeGitHubPath(id)}/_type.json?ref=${
      writerRepository.branch
    }`,
    {
      headers: githubHeaders(token),
    },
  );

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  const file = (await response.json()) as GitHubContentItem;

  if (file.encoding !== "base64" || !file.content) {
    return undefined;
  }

  return normalizeCollectionDefinition(JSON.parse(base64ToText(file.content)));
}

async function loadEntriesFromGitHub(collection: CollectionDefinition, token: string) {
  const response = await fetch(
    `https://api.github.com/repos/${writerRepositoryFullName}/contents/content/${encodeGitHubPath(collection.id)}?ref=${
      writerRepository.branch
    }`,
    {
      headers: githubHeaders(token),
    },
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  const items = (await response.json()) as GitHubContentItem[] | GitHubContentItem;

  if (!Array.isArray(items)) {
    return [];
  }

  const summaries = (
    await Promise.all(
      items
        .filter((item) => item.type === "dir" && item.name)
        .map((item) => loadEntrySummaryFromGitHub(collection, item.name as string, token)),
    )
  ).filter((entry): entry is EntrySummary => Boolean(entry));

  return sortEntrySummaries(summaries, collection);
}

async function loadEntrySummaryFromGitHub(
  collection: CollectionDefinition,
  slug: string,
  token: string,
): Promise<EntrySummary | undefined> {
  try {
    const entry = await loadEntryFromGitHub(collection, slug, token);

    return {
      slug: entry.slug,
      title: entry.draft.title,
      description: entry.draft.description,
      path: entry.path,
      sha: entry.sha,
      sortValue: getDraftSortValue(collection, entry.draft),
    };
  } catch {
    return undefined;
  }
}

async function loadEntryFromGitHub(collection: CollectionDefinition, slug: string, token: string) {
  const path = `content/${collection.id}/${slug}/page.mdx`;
  const response = await fetch(
    `https://api.github.com/repos/${writerRepositoryFullName}/contents/${encodeGitHubPath(path)}?ref=${writerRepository.branch}`,
    {
      headers: githubHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  const file = (await response.json()) as GitHubContentItem;

  if (file.encoding !== "base64" || !file.content || !file.sha) {
    throw new Error(`Could not read ${path}.`);
  }

  return {
    slug,
    path,
    sha: file.sha,
    draft: parseMdxDraft(collection, base64ToText(file.content)),
  };
}

async function loadEntryImageNamesFromGitHub(collectionId: string, slug: string, token: string) {
  const response = await fetch(
    `https://api.github.com/repos/${writerRepositoryFullName}/contents/content/${encodeGitHubPath(
      collectionId,
    )}/${encodeGitHubPath(slug)}/images?ref=${writerRepository.branch}`,
    {
      headers: githubHeaders(token),
    },
  );

  if (response.status === 404) {
    return new Set<string>();
  }

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  const items = (await response.json()) as GitHubContentItem[] | GitHubContentItem;

  if (!Array.isArray(items)) {
    return new Set<string>();
  }

  return new Set(items.filter((item) => item.type === "file" && item.name).map((item) => item.name as string));
}

async function ensurePathIsNew(path: string, token: string) {
  const response = await fetch(
    `https://api.github.com/repos/${writerRepositoryFullName}/contents/${encodeGitHubPath(path)}?ref=${writerRepository.branch}`,
    {
      headers: githubHeaders(token),
    },
  );

  if (response.status === 404) {
    return;
  }

  if (response.ok) {
    throw new Error(`A file already exists at ${path}. Change the title or type label.`);
  }

  throw new Error(await githubErrorMessage(response));
}

async function putFile({
  path,
  content,
  message,
  token,
  sha,
}: {
  path: string;
  content: string;
  message: string;
  token: string;
  sha?: string;
}) {
  const response = await fetch(`https://api.github.com/repos/${writerRepositoryFullName}/contents/${encodeGitHubPath(path)}`, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message,
      content,
      branch: writerRepository.branch,
      sha,
    }),
  });

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  return (await response.json()) as { content?: { sha?: string }; commit: { html_url: string; sha: string } };
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

function buildPublicEntryUrl(collection: CollectionDefinition, slug: string) {
  return joinSiteUrl(collection.route, slug);
}

function buildPublicCollectionUrl(collection: CollectionDefinition) {
  return joinSiteUrl(collection.route);
}

function joinSiteUrl(...segments: string[]) {
  const baseUrl = siteConfig.url.replace(/\/+$/, "");
  const path = segments
    .map((segment) => segment.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return path ? `${baseUrl}/${path}` : baseUrl;
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

function base64ToText(base64: string) {
  const binary = atob(base64.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function sanitizeFileName(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  const baseName = normalizeContentSegment(parts.join(".") || "image") || "image";

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

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
