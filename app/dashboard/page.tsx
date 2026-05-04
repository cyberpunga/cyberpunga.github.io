"use client";

import { Button } from "@/components/ui/button";
import { baseInputClass } from "@/components/dashboard/dashboard-panels";
import {
  DashboardCollectionIndexView,
  DashboardEntryEditorView,
  DashboardNewTypeView,
  DashboardOverviewView,
} from "@/components/dashboard/dashboard-views";
import {
  type CollectionDefinition,
  type ContentFieldDefinition,
  normalizeContentSegment,
  orderCollectionDefinitions,
} from "@/lib/content-schema";
import {
  defaultCollectionDefinitions,
  defaultPostCollectionDefinition,
} from "@/lib/default-collections";
import {
  type ActionState,
  type CollectionEntriesCache,
  type DashboardRoute,
  type DeploymentHistoryRun,
  type EditingEntry,
  type EntryDraft,
  type EntrySummary,
  type FieldDraftValue,
  type NewFieldDraft,
  type SelectedImage,
  type TypeDraft,
  appendMarkdownSnippet,
  buildCollectionDefinition,
  buildImageMarkdown,
  buildMdx,
  buildPublicCollectionUrl,
  buildPublicEntryUrl,
  collectionEntriesSuccessState,
  dashboardPageTitle,
  dashboardRouteHash,
  dashboardRouteHref,
  draftStorageKey,
  emptyEntryDraft,
  emptyTypeDraft,
  ensurePathIsNew,
  fileToBase64,
  getDraftSortValue,
  getTagsForCollection,
  loadCollectionsFromGitHub,
  loadDeploymentHistory,
  loadEntriesFromGitHub,
  loadEntryFromGitHub,
  loadEntryImageNamesFromGitHub,
  parseStoredDraft,
  putFile,
  randomId,
  readDashboardRouteState,
  sanitizeFileName,
  sortEntrySummaries,
  textToBase64,
  uniqueFileName,
  validateEntryDraft,
} from "@/lib/dashboard-utils";
import { buildGitHubTokenUrl, writerRepository, writerRepositoryFullName, writerStorage } from "@/lib/github-auth";
import { useAuth } from "@/lib/github-auth-context";
import { usePublishingStatus } from "@/lib/publishing-status-context";
import { siteConfig } from "@/lib/site-config";
import {
  ExternalLink,
  FileText,
  KeyRound,
  ListPlus,
  LogOut,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
export default function DashboardPage() {
  const { auth, signIn, signOut } = useAuth();
  const {
    actionState: publishingActionState,
    deploymentState,
    clearPublishingStatus,
    setPublishingActionState,
    startDeploymentWatch,
  } = usePublishingStatus();
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
  const [entriesByCollection, setEntriesByCollection] = useState<Record<string, CollectionEntriesCache>>({});
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
  const [routeState, setRouteState] = useState<DashboardRoute>({ view: "overview" });
  const [actionState, setActionState] = useState<ActionState>({ kind: "idle", message: "" });
  const [deployHistory, setDeployHistory] = useState<DeploymentHistoryRun[]>([]);
  const [deployHistoryState, setDeployHistoryState] = useState<ActionState>({ kind: "idle", message: "" });
  const [tokenInput, setTokenInput] = useState("");
  const imagesRef = useRef<SelectedImage[]>([]);

  const authToken = auth.kind === "signed-in" ? auth.token : "";
  const routeCollectionId = "collectionId" in routeState ? routeState.collectionId : "";
  const slug = useMemo(() => normalizeContentSegment(draft.title), [draft.title]);
  const activeEditingEntry = editingEntry?.collectionId === selectedCollection.id ? editingEntry : null;
  const isEditing = routeState.view === "edit-entry";
  const isNewEntryRoute = routeState.view === "new-entry";
  const isEntryEditorRoute = routeState.view === "new-entry" || routeState.view === "edit-entry";
  const isLoadingEditingEntry = routeState.view === "edit-entry" && activeEditingEntry?.slug !== routeState.entrySlug;
  const outputSlug = activeEditingEntry ? activeEditingEntry.slug : slug || "entry-title";
  const mdx = useMemo(() => buildMdx(selectedCollection, draft), [selectedCollection, draft]);
  const tokenUrl = useMemo(() => buildGitHubTokenUrl(), []);
  const selectedCollectionEntriesCache = entriesByCollection[selectedCollection.id];
  const entries = selectedCollectionEntriesCache?.entries ?? [];
  const entriesState = selectedCollectionEntriesCache?.state ?? { kind: "idle", message: "" };
  const entryPath = activeEditingEntry
    ? activeEditingEntry.path
    : `content/${selectedCollection.id}/${slug || "entry-title"}/page.mdx`;
  const previewImageBaseUrl = activeEditingEntry
    ? `https://raw.githubusercontent.com/${writerRepositoryFullName}/${writerRepository.branch}/content/${encodeURIComponent(
        selectedCollection.id,
      )}/${encodeURIComponent(activeEditingEntry.slug)}/images`
    : "";
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
      setEntriesByCollection({});
      setDeployHistory([]);
      setDeployHistoryState({ kind: "idle", message: "" });
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
    if (routeCollectionId && collections.some((collection) => collection.id === routeCollectionId)) {
      setSelectedCollectionId(routeCollectionId);
    }
  }, [collections, routeCollectionId]);

  useEffect(() => {
    if (!collections.some((collection) => collection.id === selectedCollectionId)) {
      setSelectedCollectionId(collections[0]?.id ?? defaultPostCollectionDefinition.id);
    }
  }, [collections, selectedCollectionId]);

  useEffect(() => {
    if (routeState.view === "edit-entry") {
      return;
    }

    setDraftLoaded(false);

    const savedDraft =
      routeState.view === "new-entry" ? window.localStorage.getItem(draftStorageKey(selectedCollection.id)) : "";
    const nextDraft = savedDraft ? parseStoredDraft(savedDraft, selectedCollection) : emptyEntryDraft(selectedCollection);

    setDraft(nextDraft);
    setEditingEntry((current) => (current?.collectionId === selectedCollection.id ? current : null));
    setExistingImageNames(new Set());
    clearSelectedImages();
    setActionState({ kind: "idle", message: "" });
    setDraftLoaded(true);
  }, [routeState.view, selectedCollection]);

  useEffect(() => {
    if (!draftLoaded || !isNewEntryRoute) {
      return;
    }

    window.localStorage.setItem(draftStorageKey(selectedCollection.id), JSON.stringify(draft));
  }, [draft, draftLoaded, isNewEntryRoute, selectedCollection.id]);

  useEffect(() => {
    if (auth.kind !== "signed-in") {
      return;
    }

    let ignore = false;
    setDeployHistoryState({ kind: "working", message: "Loading deploy history..." });

    loadDeploymentHistory(auth.token)
      .then((runs) => {
        if (ignore) {
          return;
        }

        setDeployHistory(runs);
        setDeployHistoryState({
          kind: "success",
          message: runs.length ? `${runs.length} deploy runs loaded.` : "No deploy runs found.",
        });
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setDeployHistory([]);
        setDeployHistoryState({
          kind: "error",
          message: error instanceof Error ? error.message : "Could not load deploy history.",
        });
      });

    return () => {
      ignore = true;
    };
  }, [auth]);

  useEffect(() => {
    if (auth.kind !== "signed-in") {
      return;
    }

    let ignore = false;

    collections.forEach((collection) => {
      setCollectionEntriesState(collection.id, {
        kind: "working",
        message: `Loading ${collection.pluralLabel.toLowerCase()}...`,
      });

      loadEntriesFromGitHub(collection, auth.token)
        .then((nextEntries) => {
          if (ignore) {
            return;
          }

          setCollectionEntries(collection, nextEntries);
        })
        .catch((error) => {
          if (ignore) {
            return;
          }

          setCollectionEntriesFailure(
            collection.id,
            error instanceof Error ? error.message : "Could not load entries.",
          );
        });
    });

    return () => {
      ignore = true;
    };
  }, [auth, collections]);

  useEffect(() => {
    if (auth.kind !== "signed-in" || routeState.view !== "edit-entry" || selectedCollection.id !== routeState.collectionId) {
      return;
    }

    if (editingEntry?.collectionId === selectedCollection.id && editingEntry.slug === routeState.entrySlug) {
      return;
    }

    let ignore = false;
    setActionState({ kind: "working", message: `Loading ${selectedCollection.label.toLowerCase()}...` });

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
  }, [auth, routeState, selectedCollection, editingEntry]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

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

  function stageImageFiles(files: File[]) {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const currentImages = imagesRef.current;
    const existingNames = new Set([...existingImageNames, ...currentImages.map((image) => image.safeName)]);
    const nextImages = imageFiles.map((file, index) => {
      const safeName = uniqueFileName(sanitizeFileName(file.name), existingNames, currentImages.length + index + 1);
      existingNames.add(safeName);

      return {
        id: `${file.name}-${file.lastModified}-${randomId()}`,
        file,
        safeName,
        previewUrl: URL.createObjectURL(file),
      };
    });
    const nextImageState = [...currentImages, ...nextImages];

    imagesRef.current = nextImageState;
    setImages(nextImageState);

    return nextImages;
  }

  function removeImage(id: string) {
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      const nextImages = current.filter((item) => item.id !== id);
      imagesRef.current = nextImages;

      return nextImages;
    });
  }

  function clearSelectedImages() {
    setImages((current) => {
      current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      imagesRef.current = [];
      return [];
    });
  }

  function insertImageMarkdown(image: SelectedImage) {
    updateDraft("body", appendMarkdownSnippet(draft.body, buildImageMarkdown(image)));
  }

  function selectCollection(collectionId: string) {
    setEditingEntry(null);
    setExistingImageNames(new Set());
    navigateDashboard({ view: "collection", collectionId });
  }

  function navigateDashboard(route: DashboardRoute) {
    const url = new URL(window.location.href);
    url.searchParams.delete("type");
    url.searchParams.delete("entry");
    url.hash = dashboardRouteHash(route);

    if (url.toString() !== window.location.href) {
      window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }

    setRouteState(route);
  }

  function startNewEntry() {
    setEditingEntry(null);
    setExistingImageNames(new Set());
    clearSelectedImages();
    setActionState({ kind: "idle", message: "" });
    navigateDashboard({ view: "new-entry", collectionId: selectedCollection.id });
  }

  function setCollectionEntriesState(collectionId: string, state: ActionState) {
    setEntriesByCollection((current) => ({
      ...current,
      [collectionId]: {
        entries: current[collectionId]?.entries ?? [],
        state,
      },
    }));
  }

  function setCollectionEntries(collection: CollectionDefinition, nextEntries: EntrySummary[]) {
    setEntriesByCollection((current) => ({
      ...current,
      [collection.id]: {
        entries: nextEntries,
        state: collectionEntriesSuccessState(collection, nextEntries),
      },
    }));
  }

  function setCollectionEntriesFailure(collectionId: string, message: string) {
    setEntriesByCollection((current) => ({
      ...current,
      [collectionId]: {
        entries: [],
        state: { kind: "error", message },
      },
    }));
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

    setCollectionEntriesState(selectedCollection.id, {
      kind: "working",
      message: `Loading ${selectedCollection.pluralLabel.toLowerCase()}...`,
    });

    try {
      const nextEntries = await loadEntriesFromGitHub(selectedCollection, auth.token);
      setCollectionEntries(selectedCollection, nextEntries);
    } catch (error) {
      setCollectionEntriesFailure(
        selectedCollection.id,
        error instanceof Error ? error.message : "Could not load entries.",
      );
    }
  }

  async function refreshDeployHistory() {
    if (auth.kind !== "signed-in") {
      return;
    }

    setDeployHistoryState({ kind: "working", message: "Loading deploy history..." });

    try {
      const runs = await loadDeploymentHistory(auth.token);
      setDeployHistory(runs);
      setDeployHistoryState({
        kind: "success",
        message: runs.length ? `${runs.length} deploy runs loaded.` : "No deploy runs found.",
      });
    } catch (error) {
      setDeployHistoryState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load deploy history.",
      });
    }
  }

  async function publishEntry() {
    if (auth.kind !== "signed-in") {
      return;
    }

    if (isEditing && !activeEditingEntry) {
      setActionState({
        kind: "error",
        message: "Wait for the entry to finish loading before saving.",
      });
      return;
    }

    setActionState({
      kind: "working",
      message: `${isEditing ? "Preparing update for" : "Preparing"} ${selectedCollection.label.toLowerCase()}...`,
    });
    clearPublishingStatus();
    setPublishingActionState({
      kind: "working",
      message: `${isEditing ? "Preparing update for" : "Preparing"} ${selectedCollection.label.toLowerCase()}...`,
    });

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
        setPublishingActionState({ kind: "working", message: `Uploading ${image.safeName}...` });
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
      setPublishingActionState({
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

      setEntriesByCollection((current) => {
        const currentEntries = current[selectedCollection.id]?.entries ?? [];
        const nextEntries = sortEntrySummaries(
          [...currentEntries.filter((entry) => entry.slug !== targetSlug), nextEntry],
          selectedCollection,
        );

        return {
          ...current,
          [selectedCollection.id]: {
            entries: nextEntries,
            state: collectionEntriesSuccessState(selectedCollection, nextEntries),
          },
        };
      });
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
        navigateDashboard({ view: "collection", collectionId: selectedCollection.id });
      }
      clearSelectedImages();
      setActionState({
        kind: "success",
        message: `${isEditing ? "Updated" : "Published"} on GitHub. Waiting for the site deploy now.`,
        href: result.commit.html_url,
      });
      setPublishingActionState({
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
      setPublishingActionState({
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
    clearPublishingStatus();
    setPublishingActionState({ kind: "working", message: "Preparing content type..." });

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
      setCollectionEntries(definition, []);
      setTypeDraft(emptyTypeDraft());
      navigateDashboard({ view: "collection", collectionId: definition.id });
      setActionState({
        kind: "success",
        message: "Content type added to GitHub. Waiting for the site deploy now.",
        href: result.commit.html_url,
      });
      setPublishingActionState({
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
      setPublishingActionState({
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

  const signedInAuth = auth;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-900 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs font-normal uppercase tracking-[0.18em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="font-mono text-3xl font-normal text-zinc-50 md:text-4xl">
            {dashboardPageTitle(routeState, selectedCollection)}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Signed in as{" "}
            <Link href={signedInAuth.user.htmlUrl} target="_blank" className="text-[#c3d9f3] underline">
              @{signedInAuth.user.login}
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {routeState.view !== "overview" ? (
            <Button asChild variant="outline">
              <a href={dashboardRouteHref({ view: "overview" })}>Dashboard</a>
            </Button>
          ) : null}
          {routeState.view !== "new-type" ? (
            <Button asChild variant="outline">
              <a href={dashboardRouteHref({ view: "new-type" })}>
                <ListPlus />
                New type
              </a>
            </Button>
          ) : null}
          {routeState.view === "collection" ? (
            <Button type="button" onClick={startNewEntry}>
              <Plus />
              New {selectedCollection.label.toLowerCase()}
            </Button>
          ) : null}
          {isEntryEditorRoute ? (
            <Button onClick={publishEntry} disabled={actionState.kind === "working" || isLoadingEditingEntry}>
              <Send />
              {isEditing ? "Save" : "Publish"}
            </Button>
          ) : null}
        </div>
      </header>

      {renderCurrentView()}
    </main>
  );

  function renderCurrentView() {
    if (routeState.view === "new-type") {
      return renderNewTypeView();
    }

    if (routeState.view === "collection") {
      return renderCollectionIndex();
    }

    if (routeState.view === "new-entry" || routeState.view === "edit-entry") {
      return renderEntryEditor();
    }

    return renderOverview();
  }

  function renderOverview() {
    return (
      <DashboardOverviewView
        collections={collections}
        collectionsState={collectionsState}
        entriesByCollection={entriesByCollection}
        publishingActionState={publishingActionState}
        deploymentState={deploymentState}
        deployHistory={deployHistory}
        deployHistoryState={deployHistoryState}
        onRefreshCollections={refreshCollections}
        onRefreshDeployHistory={refreshDeployHistory}
        sessionPanel={renderSessionPanel()}
        repositoryPanel={renderRepositoryPanel()}
      />
    );
  }

  function renderCollectionIndex() {
    return (
      <DashboardCollectionIndexView
        selectedCollection={selectedCollection}
        entries={entries}
        entriesState={entriesState}
        onRefreshEntries={refreshEntries}
        onStartNewEntry={startNewEntry}
        collectionsPanel={renderCollectionsPanel()}
        sessionPanel={renderSessionPanel()}
      />
    );
  }

  function renderEntryEditor() {
    return (
      <DashboardEntryEditorView
        selectedCollection={selectedCollection}
        draft={draft}
        images={images}
        previewImageBaseUrl={previewImageBaseUrl}
        mdx={mdx}
        isEditing={isEditing}
        isLoadingEditingEntry={isLoadingEditingEntry}
        actionState={actionState}
        publishingActionState={publishingActionState}
        deploymentState={deploymentState}
        onPublishEntry={publishEntry}
        onUpdateDraft={updateDraft}
        onUpdateFieldValue={updateFieldValue}
        onStageImageFiles={stageImageFiles}
        onInsertImageMarkdown={insertImageMarkdown}
        onRemoveImage={removeImage}
        outputPanel={renderOutputPanel()}
        collectionsPanel={renderCollectionsPanel()}
        sessionPanel={renderSessionPanel()}
      />
    );
  }

  function renderNewTypeView() {
    return (
      <DashboardNewTypeView
        typeDraft={typeDraft}
        actionState={actionState}
        publishingActionState={publishingActionState}
        deploymentState={deploymentState}
        onChangeTypeDraft={setTypeDraft}
        onAddTypeField={addTypeField}
        onUpdateTypeField={updateTypeField}
        onRemoveTypeField={removeTypeField}
        onCreateContentType={createContentType}
        collectionsPanel={renderCollectionsPanel()}
        sessionPanel={renderSessionPanel()}
      />
    );
  }

  function renderCollectionsPanel() {
    return (
      <section className="border border-zinc-900 bg-black p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-mono text-lg font-normal text-zinc-50">Content types</h2>
            <p className="mt-1 text-xs text-zinc-500">{collectionsState.message || "Ready"}</p>
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
                selectedCollection.id === collection.id && routeState.view !== "overview"
                  ? "border-zinc-100 bg-zinc-950"
                  : "border-zinc-900 hover:border-zinc-700"
              }`}
            >
              <span className="flex items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-50">{collection.pluralLabel}</span>
                  <span className="mt-1 block truncate font-mono text-xs text-zinc-500">/{collection.route}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderSessionPanel() {
    return (
      <section className="border border-zinc-900 bg-black p-4">
        <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">Session</h2>
        <dl className="mb-4 space-y-3 text-sm">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">GitHub</dt>
            <dd className="break-all font-mono text-zinc-100">@{signedInAuth.user.login}</dd>
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
          <Button asChild variant="outline" className="w-full">
            <a href={tokenUrl} target="_blank" rel="noreferrer">
              <KeyRound />
              Token
              <ExternalLink />
            </a>
          </Button>
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
    );
  }

  function renderRepositoryPanel() {
    return (
      <section className="border border-zinc-900 bg-black p-4">
        <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">Repository</h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Name</dt>
            <dd className="break-all font-mono text-zinc-100">{writerRepositoryFullName}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Branch</dt>
            <dd className="break-all font-mono text-zinc-100">{writerRepository.branch}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Workflow</dt>
            <dd className="text-zinc-100">{siteConfig.writer.deployment.workflowName}</dd>
          </div>
        </dl>
      </section>
    );
  }

  function renderOutputPanel() {
    return (
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
            <dd className="break-all font-mono text-zinc-100">{isEditing ? "edit" : "new"}</dd>
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
    );
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
