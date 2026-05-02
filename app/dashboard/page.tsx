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
  postCollectionDefinition,
} from "@/lib/content-schema";
import {
  buildGitHubTokenUrl,
  githubErrorMessage,
  githubHeaders,
  writerRepository,
  writerRepositoryFullName,
  writerStorage,
} from "@/lib/github-auth";
import { useAuth } from "@/lib/github-auth-context";
import {
  ExternalLink,
  FileText,
  ImagePlus,
  KeyRound,
  ListPlus,
  LogOut,
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

type FieldDraftValue = string | boolean;

type EntryDraft = {
  title: string;
  description: string;
  fieldValues: Record<string, FieldDraftValue>;
  body: string;
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
  content?: string;
  encoding?: string;
};

const emptyTypeDraft = (): TypeDraft => ({
  label: "",
  pluralLabel: "",
  description: "",
  fields: [],
});

const baseInputClass =
  "h-11 rounded-md border border-zinc-300 bg-background px-3 text-base outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-700";
const textareaClass =
  "resize-y rounded-md border border-zinc-300 bg-background px-3 py-2 text-base outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-700";

export default function DashboardPage() {
  const { auth, signIn, signOut } = useAuth();
  const [collections, setCollections] = useState<CollectionDefinition[]>([postCollectionDefinition]);
  const [collectionsState, setCollectionsState] = useState<ActionState>({ kind: "idle", message: "" });
  const [selectedCollectionId, setSelectedCollectionId] = useState(postCollectionDefinition.id);
  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId) ?? collections[0] ?? postCollectionDefinition,
    [collections, selectedCollectionId],
  );
  const [draft, setDraft] = useState<EntryDraft>(() => emptyEntryDraft(selectedCollection));
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [typeDraft, setTypeDraft] = useState<TypeDraft>(emptyTypeDraft);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [actionState, setActionState] = useState<ActionState>({ kind: "idle", message: "" });
  const [tokenInput, setTokenInput] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imagesRef = useRef<SelectedImage[]>([]);

  const authToken = auth.kind === "signed-in" ? auth.token : "";
  const slug = useMemo(() => normalizeContentSegment(draft.title), [draft.title]);
  const mdx = useMemo(() => buildMdx(selectedCollection, draft), [selectedCollection, draft]);
  const tokenUrl = useMemo(() => buildGitHubTokenUrl(), []);
  const entryPath = `content/${selectedCollection.id}/${slug || "entry-title"}/page.mdx`;
  const selectedTags = getTagsForCollection(selectedCollection, draft);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(writerStorage.tokenKey) ?? "";

    if (savedToken) {
      setTokenInput(savedToken);
    }
  }, []);

  useEffect(() => {
    if (auth.kind !== "signed-in" || !authToken) {
      setCollections([postCollectionDefinition]);
      setCollectionsState({ kind: "idle", message: "" });
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

        setCollections([postCollectionDefinition]);
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
    if (!collections.some((collection) => collection.id === selectedCollectionId)) {
      setSelectedCollectionId(collections[0]?.id ?? postCollectionDefinition.id);
    }
  }, [collections, selectedCollectionId]);

  useEffect(() => {
    setDraftLoaded(false);

    const savedDraft = window.localStorage.getItem(draftStorageKey(selectedCollection.id));
    const nextDraft = savedDraft ? parseStoredDraft(savedDraft, selectedCollection) : emptyEntryDraft(selectedCollection);

    setDraft(nextDraft);
    clearSelectedImages();
    setActionState({ kind: "idle", message: "" });
    setDraftLoaded(true);
  }, [selectedCollection]);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }

    window.localStorage.setItem(draftStorageKey(selectedCollection.id), JSON.stringify(draft));
  }, [draft, draftLoaded, selectedCollection.id]);

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

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const existingNames = new Set(images.map((image) => image.safeName));
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

  async function publishEntry() {
    if (auth.kind !== "signed-in") {
      return;
    }

    setActionState({ kind: "working", message: `Preparing ${selectedCollection.label.toLowerCase()}...` });

    try {
      validateEntryDraft(selectedCollection, draft, slug, auth.token);

      const pagePath = `content/${selectedCollection.id}/${slug}/page.mdx`;
      await ensurePathIsNew(pagePath, auth.token.trim());

      for (const image of images) {
        setActionState({ kind: "working", message: `Uploading ${image.safeName}...` });
        const content = await fileToBase64(image.file);
        await putFile({
          path: `content/${selectedCollection.id}/${slug}/images/${image.safeName}`,
          content,
          message: `Add image for ${draft.title}`,
          token: auth.token.trim(),
        });
      }

      setActionState({ kind: "working", message: `Publishing ${selectedCollection.label.toLowerCase()}...` });
      const result = await putFile({
        path: pagePath,
        content: textToBase64(mdx),
        message: `Add ${selectedCollection.label.toLowerCase()}: ${draft.title}`,
        token: auth.token.trim(),
      });

      window.localStorage.removeItem(draftStorageKey(selectedCollection.id));
      setDraft(emptyEntryDraft(selectedCollection));
      clearSelectedImages();
      setActionState({
        kind: "success",
        message: "Published to GitHub.",
        href: result.commit.html_url,
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
        message: "Content type added to GitHub.",
        href: result.commit.html_url,
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking authentication...</p>
        </div>
      </main>
    );
  }

  if (auth.kind !== "signed-in") {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
        <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 md:text-4xl">Sign in with GitHub</h1>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-background p-5 dark:border-zinc-800">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Repository access</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{writerRepositoryFullName}</p>
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
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">GitHub token</span>
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

          <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            The token link pre-fills the owner and Contents permission. In GitHub, choose Only select repositories,
            then select {writerRepository.name}. The token stays in this browser.
          </p>

          {auth.kind === "invalid" ? (
            <p className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              {auth.message || "Authentication failed. Check your token and try again."}
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 md:text-4xl">
            New {selectedCollection.label.toLowerCase()}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as{" "}
            <Link href={auth.user.htmlUrl} target="_blank" className="underline">
              @{auth.user.login}
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex min-w-56 flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Type</span>
            <select
              value={selectedCollection.id}
              onChange={(event) => setSelectedCollectionId(event.target.value)}
              className={baseInputClass}
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.pluralLabel}
                </option>
              ))}
            </select>
          </label>
          <Button asChild variant="outline">
            <a href={tokenUrl} target="_blank" rel="noreferrer">
              <KeyRound />
              Token
              <ExternalLink />
            </a>
          </Button>
          <Button onClick={publishEntry} disabled={actionState.kind === "working"}>
            <Send />
            Publish
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800 md:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Title</span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className={baseInputClass}
                  placeholder={`${selectedCollection.label} title`}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Description</span>
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

          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {selectedCollection.bodyLabel ?? "Body"}
              </h2>
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
              placeholder={selectedCollection.bodyPlaceholder ?? "Write in Markdown."}
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

          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">New content type</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => addTypeField()}>
                <Plus />
                Field
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Singular label</span>
                <input
                  value={typeDraft.label}
                  onChange={(event) => setTypeDraft((current) => ({ ...current, label: event.target.value }))}
                  className={baseInputClass}
                  placeholder="Reseña"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Plural label</span>
                <input
                  value={typeDraft.pluralLabel}
                  onChange={(event) => setTypeDraft((current) => ({ ...current, pluralLabel: event.target.value }))}
                  className={baseInputClass}
                  placeholder="Reseñas"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Description</span>
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
          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">Session</h2>
            <dl className="mb-4 space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">GitHub</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">@{auth.user.login}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Access</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">Write enabled</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Types</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{collectionsState.message || "Ready"}</dd>
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

          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">Output</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Repository</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">{writerRepositoryFullName}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Branch</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">{writerRepository.branch}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Type</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">{selectedCollection.id}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Route</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">/{selectedCollection.route}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Slug</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">{slug || "entry-title"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Path</dt>
                <dd className="break-all font-mono text-zinc-900 dark:text-zinc-100">{entryPath}</dd>
              </div>
              {selectedTags.length > 0 ? (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Tags</dt>
                  <dd className="text-zinc-900 dark:text-zinc-100">{selectedTags.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">MDX</h2>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md bg-zinc-100 p-3 font-mono text-xs leading-5 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {mdx}
            </pre>
          </section>

          {actionState.message ? (
            <section
              className={`rounded-lg border p-4 text-sm ${
                actionState.kind === "error"
                  ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
                  : "border-zinc-200 bg-background text-zinc-800 dark:border-zinc-800 dark:text-zinc-200"
              }`}
            >
              <p>{actionState.message}</p>
              {actionState.href ? (
                <Link href={actionState.href} target="_blank" className="mt-2 inline-flex items-center gap-1 underline">
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
      <label className="flex min-h-11 items-center gap-3 rounded-md border border-zinc-300 px-3 dark:border-zinc-700">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 rounded border-zinc-300"
        />
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{field.label}</span>
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
    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {field.label}
      {field.required ? <span className="text-red-600 dark:text-red-400"> *</span> : null}
    </span>
  );
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
    <div className="grid gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 md:grid-cols-[minmax(0,1fr)_160px_auto]">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Field label</span>
        <input
          value={field.label}
          onChange={(event) => onChange({ ...field, label: event.target.value })}
          className={baseInputClass}
          placeholder="Rating"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Type</span>
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
        <label className="flex h-11 items-center gap-2 rounded-md border border-zinc-300 px-3 dark:border-zinc-700">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(event) => onChange({ ...field, required: event.target.checked })}
            className="size-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-800 dark:text-zinc-200">Required</span>
        </label>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 />
          <span className="sr-only">Remove field</span>
        </Button>
      </div>
      <label className="flex flex-col gap-2 md:col-span-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Placeholder</span>
        <input
          value={field.placeholder}
          onChange={(event) => onChange({ ...field, placeholder: event.target.value })}
          className={baseInputClass}
          placeholder="Optional"
        />
      </label>
      {field.type === "select" ? (
        <label className="flex flex-col gap-2 md:col-span-3">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Options</span>
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

async function loadCollectionsFromGitHub(token: string) {
  const response = await fetch(
    `https://api.github.com/repos/${writerRepositoryFullName}/contents/content?ref=${writerRepository.branch}`,
    {
      headers: githubHeaders(token),
    },
  );

  if (response.status === 404) {
    return [postCollectionDefinition];
  }

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  const items = (await response.json()) as GitHubContentItem[] | GitHubContentItem;

  if (!Array.isArray(items)) {
    return [postCollectionDefinition];
  }

  const definitions = (
    await Promise.all(
      items
        .filter((item) => item.type === "dir" && item.name)
        .map((item) => loadCollectionDefinitionFromGitHub(item.name as string, token)),
    )
  ).filter((definition): definition is CollectionDefinition => Boolean(definition));
  const hasPosts = definitions.some((definition) => definition.id === postCollectionDefinition.id);

  return orderCollectionDefinitions(hasPosts ? definitions : [postCollectionDefinition, ...definitions]);
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
}: {
  path: string;
  content: string;
  message: string;
  token: string;
}) {
  const response = await fetch(`https://api.github.com/repos/${writerRepositoryFullName}/contents/${encodeGitHubPath(path)}`, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message,
      content,
      branch: writerRepository.branch,
    }),
  });

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  return (await response.json()) as { commit: { html_url: string } };
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
