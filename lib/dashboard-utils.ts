import {
  type CollectionDefinition,
  type ContentFieldDefinition,
  type ContentFieldType,
  fieldNameFromLabel,
  isReservedCollectionRoute,
  isSafeContentSegment,
  isSafeFieldName,
  normalizeCollectionDefinition,
  normalizeContentSegment,
} from "@/lib/content-schema";
import { defaultCollectionDefinitions, mergeCollectionDefinitions } from "@/lib/default-collections";
import { githubErrorMessage, githubHeaders, writerRepository, writerRepositoryFullName, writerStorage } from "@/lib/github-auth";
import { siteConfig } from "@/lib/site-config";

export type SelectedImage = {
  id: string;
  file: File;
  safeName: string;
  previewUrl: string;
};

export type ActionState = {
  kind: "idle" | "working" | "success" | "error";
  message: string;
  href?: string;
};

export type FieldDraftValue = string | boolean;

export type EntryDraft = {
  title: string;
  description: string;
  fieldValues: Record<string, FieldDraftValue>;
  body: string;
};

export type EntrySummary = {
  slug: string;
  title: string;
  description: string;
  path: string;
  sha: string;
  sortValue?: unknown;
};

export type EditingEntry = {
  collectionId: string;
  slug: string;
  path: string;
  sha: string;
};

export type DashboardRoute =
  | { view: "overview" }
  | { view: "collection"; collectionId: string }
  | { view: "new-entry"; collectionId: string }
  | { view: "edit-entry"; collectionId: string; entrySlug: string }
  | { view: "new-type" };

export type CollectionEntriesCache = {
  entries: EntrySummary[];
  state: ActionState;
};

export type DeploymentHistoryRun = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  headSha: string;
  actorLogin?: string;
};

export type NewFieldDraft = {
  id: string;
  label: string;
  type: ContentFieldType;
  required: boolean;
  placeholder: string;
  optionsInput: string;
};

export type TypeDraft = {
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

export function emptyTypeDraft(): TypeDraft {
  return {
    label: "",
    pluralLabel: "",
    description: "",
    fields: [],
  };
}

export function emptyEntryDraft(collection: CollectionDefinition): EntryDraft {
  return {
    title: "",
    description: "",
    fieldValues: Object.fromEntries(collection.fields.map((field) => [field.name, defaultFieldValue(field)])),
    body: "",
  };
}

export function defaultFieldValue(field: ContentFieldDefinition): FieldDraftValue {
  if (field.type === "boolean") {
    return false;
  }

  if (field.type === "date") {
    return new Date().toISOString().slice(0, 10);
  }

  return "";
}

export function parseStoredDraft(rawDraft: string, collection: CollectionDefinition) {
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

export function readDashboardRouteState(): DashboardRoute {
  const hashPath = window.location.hash.replace(/^#\/?/, "");
  const hashSegments = hashPath
    .split("/")
    .map((segment) => decodeURIComponent(segment).trim())
    .filter(Boolean);

  if (hashSegments[0] === "collections") {
    const collectionId = normalizeContentSegment(hashSegments[1] ?? "");

    if (!collectionId) {
      return { view: "overview" };
    }

    if (hashSegments[2] === "new") {
      return { view: "new-entry", collectionId };
    }

    if (hashSegments[2] === "entries") {
      const entrySlug = normalizeContentSegment(hashSegments[3] ?? "");
      return entrySlug ? { view: "edit-entry", collectionId, entrySlug } : { view: "collection", collectionId };
    }

    return { view: "collection", collectionId };
  }

  if (hashSegments[0] === "types" && hashSegments[1] === "new") {
    return { view: "new-type" };
  }

  if (hashSegments[0]) {
    const collectionId = normalizeContentSegment(hashSegments[0]);
    const entrySlug = normalizeContentSegment(hashSegments[1] ?? "");

    return entrySlug ? { view: "edit-entry", collectionId, entrySlug } : { view: "collection", collectionId };
  }

  const params = new URLSearchParams(window.location.search);
  const collectionId = normalizeContentSegment(params.get("type") ?? "");
  const entrySlug = normalizeContentSegment(params.get("entry") ?? "");

  if (collectionId && entrySlug) {
    return { view: "edit-entry", collectionId, entrySlug };
  }

  if (collectionId) {
    return { view: "collection", collectionId };
  }

  return { view: "overview" };
}

export function dashboardRouteHash(route: DashboardRoute) {
  if (route.view === "overview") {
    return "/";
  }

  if (route.view === "new-type") {
    return "/types/new";
  }

  if (route.view === "collection") {
    return `/collections/${encodeURIComponent(route.collectionId)}`;
  }

  if (route.view === "new-entry") {
    return `/collections/${encodeURIComponent(route.collectionId)}/new`;
  }

  return `/collections/${encodeURIComponent(route.collectionId)}/entries/${encodeURIComponent(route.entrySlug)}`;
}

export function dashboardRouteHref(route: DashboardRoute) {
  return `#${dashboardRouteHash(route)}`;
}

export function dashboardPageTitle(route: DashboardRoute, collection: CollectionDefinition) {
  if (route.view === "new-type") {
    return "New content type";
  }

  if (route.view === "collection") {
    return collection.pluralLabel;
  }

  if (route.view === "new-entry") {
    return `New ${collection.label.toLowerCase()}`;
  }

  if (route.view === "edit-entry") {
    return `Edit ${collection.label.toLowerCase()}`;
  }

  return "Dashboard";
}

export function collectionEntriesSuccessState(collection: CollectionDefinition, entries: EntrySummary[]): ActionState {
  return {
    kind: "success",
    message: entries.length
      ? `${entries.length} ${entries.length === 1 ? collection.label.toLowerCase() : collection.pluralLabel.toLowerCase()} loaded.`
      : `No ${collection.pluralLabel.toLowerCase()} yet.`,
  };
}

export function parseMdxDraft(collection: CollectionDefinition, mdx: string): EntryDraft {
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

export function draftStorageKey(collectionId: string) {
  return `${writerStorage.draftKey}:${collectionId}`;
}

export function buildMdx(collection: CollectionDefinition, draft: EntryDraft) {
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

export function parseFieldValue(field: ContentFieldDefinition, value: FieldDraftValue | undefined) {
  if (field.type === "boolean") {
    return Boolean(value);
  }

  if (field.type === "list" || field.type === "tags") {
    return parseListInput(String(value ?? ""));
  }

  return String(value ?? "").trim();
}

export function validateEntryDraft(collection: CollectionDefinition, draft: EntryDraft, slug: string, token: string) {
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

export function buildCollectionDefinition(typeDraft: TypeDraft, existingCollections: CollectionDefinition[]) {
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

  const sortField = fields.find((field) => field.type === "date");

  return normalizeCollectionDefinition({
    id: route,
    label,
    pluralLabel,
    description: typeDraft.description.trim(),
    route,
    bodyLabel: "Cuerpo",
    bodyPlaceholder: "Escribe en Markdown.",
    sort: sortField ? { field: sortField.name, direction: "desc" } : undefined,
    fields,
  });
}

export function buildFieldDefinition(field: NewFieldDraft): ContentFieldDefinition {
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

export function getTagsForCollection(collection: CollectionDefinition, draft: EntryDraft) {
  const tagsField = collection.fields.find((field) => field.type === "tags");

  if (!tagsField) {
    return [];
  }

  return parseListInput(String(draft.fieldValues[tagsField.name] ?? ""));
}

export function parseListInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getDraftSortValue(collection: CollectionDefinition, draft: EntryDraft) {
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

export function sortEntrySummaries(entries: EntrySummary[], collection: CollectionDefinition) {
  const direction = collection.sort ? (collection.sort.direction === "asc" ? 1 : -1) : 1;

  return [...entries].sort((a, b) => {
    const valueDifference = compareSortValues(a.sortValue ?? a.title, b.sortValue ?? b.title);

    if (valueDifference !== 0) {
      return valueDifference * direction;
    }

    return a.title.localeCompare(b.title, "es");
  });
}

export async function loadCollectionsFromGitHub(token: string) {
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

export async function loadCollectionDefinitionFromGitHub(id: string, token: string) {
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

export async function loadEntriesFromGitHub(collection: CollectionDefinition, token: string) {
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

export async function loadEntrySummaryFromGitHub(
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

export async function loadEntryFromGitHub(collection: CollectionDefinition, slug: string, token: string) {
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

export async function loadEntryImageNamesFromGitHub(collectionId: string, slug: string, token: string) {
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

export async function loadDeploymentHistory(token: string) {
  const url = new URL(`https://api.github.com/repos/${writerRepositoryFullName}/actions/runs`);
  url.searchParams.set("branch", writerRepository.branch);
  url.searchParams.set("event", "push");
  url.searchParams.set("exclude_pull_requests", "true");
  url.searchParams.set("per_page", "8");

  const response = await fetch(url.toString(), {
    headers: githubHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  const data = (await response.json()) as {
    workflow_runs?: Array<{
      id: number;
      name?: string;
      html_url?: string;
      status?: string;
      conclusion?: string | null;
      created_at?: string;
      updated_at?: string;
      head_sha?: string;
      actor?: {
        login?: string;
      };
    }>;
  };

  return (data.workflow_runs ?? [])
    .filter((run) => !siteConfig.writer.deployment.workflowName || run.name === siteConfig.writer.deployment.workflowName)
    .map((run): DeploymentHistoryRun => {
      const createdAt = run.created_at ?? "";
      const updatedAt = run.updated_at ?? createdAt;

      return {
        id: run.id,
        name: run.name || siteConfig.writer.deployment.workflowName || "Deploy",
        status: run.status || "unknown",
        conclusion: run.conclusion ?? null,
        createdAt,
        updatedAt,
        htmlUrl: run.html_url || `https://github.com/${writerRepositoryFullName}/actions`,
        headSha: run.head_sha || "",
        actorLogin: run.actor?.login,
      };
    });
}

export async function ensurePathIsNew(path: string, token: string) {
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

export async function putFile({
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

export function buildPublicEntryUrl(collection: CollectionDefinition, slug: string) {
  return joinSiteUrl(collection.route, slug);
}

export function buildPublicCollectionUrl(collection: CollectionDefinition) {
  return joinSiteUrl(collection.route);
}

export function deploymentRunLabel(run: DeploymentHistoryRun) {
  if (run.status === "completed") {
    return run.conclusion ? run.conclusion.replaceAll("_", " ") : "completed";
  }

  return run.status.replaceAll("_", " ");
}

export function formatDeployDate(value: string) {
  if (!value) {
    return "Date unavailable";
  }

  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function textToBase64(text: string) {
  return bytesToBase64(new TextEncoder().encode(text));
}

export async function fileToBase64(file: File) {
  return bytesToBase64(new Uint8Array(await file.arrayBuffer()));
}

export function appendMarkdownSnippet(body: string, snippet: string) {
  const trimmedBody = body.trimEnd();

  return `${trimmedBody}${trimmedBody ? "\n\n" : ""}${snippet}\n`;
}

export function buildImageMarkdown(image: SelectedImage) {
  const alt = image.safeName.replace(/\.[^.]+$/, "").replaceAll("-", " ");

  return `![${alt}](./images/${image.safeName})`;
}

export function sanitizeFileName(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  const baseName = normalizeContentSegment(parts.join(".") || "image") || "image";

  return extension ? `${baseName}.${extension}` : baseName;
}

export function uniqueFileName(fileName: string, existingNames: Set<string>, index: number) {
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

export function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
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

function compareSortValues(a: unknown, b: unknown) {
  const aDate = typeof a === "string" ? new Date(a).getTime() : Number.NaN;
  const bDate = typeof b === "string" ? new Date(b).getTime() : Number.NaN;

  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
    return aDate - bDate;
  }

  return String(a ?? "").localeCompare(String(b ?? ""), "es");
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
