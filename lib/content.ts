import type React from "react";
import type { Dirent } from "fs";
import { readFile, readdir } from "fs/promises";
import path from "path";
import { cache } from "react";

import {
  type CollectionDefinition,
  normalizeCollectionDefinition,
  orderCollectionDefinitions,
  postCollectionDefinition,
} from "@/lib/content-schema";

const CONTENT_DIRECTORY = "content";
const TYPE_FILE_NAME = "_type.json";
const ROUTE_ONLY_RESERVED_SEGMENTS = new Set(["about", "dashboard"]);

export type ContentFrontmatter = {
  title: string;
  description: string;
  [key: string]: unknown;
};

export type ContentSummary = {
  collection: CollectionDefinition;
  slug: string;
  frontmatter: ContentFrontmatter;
};

export type ContentModule = {
  default: React.ComponentType;
  frontmatter: ContentFrontmatter;
};

export const getCollections = cache(async (): Promise<CollectionDefinition[]> => {
  let entries: Dirent[];

  try {
    entries = await readdir(CONTENT_DIRECTORY, { withFileTypes: true });
  } catch {
    return [postCollectionDefinition];
  }

  const collections = (
    await Promise.all(entries.filter(isVisibleDirectory).map((entry) => readCollectionDefinition(entry.name)))
  ).filter((collection): collection is CollectionDefinition => Boolean(collection));
  const hasPosts = collections.some((collection) => collection.id === postCollectionDefinition.id);

  return orderCollectionDefinitions(hasPosts ? collections : [postCollectionDefinition, ...collections]);
});

export const getGenericCollections = cache(async () => {
  const collections = await getCollections();
  return collections.filter((collection) => !ROUTE_ONLY_RESERVED_SEGMENTS.has(collection.route));
});

export async function getCollectionById(id: string) {
  const collections = await getCollections();
  return collections.find((collection) => collection.id === id);
}

export async function getCollectionByRoute(route: string) {
  const collections = await getCollections();
  return collections.find((collection) => collection.route === route);
}

export const getCollectionEntries = cache(async (collectionId: string): Promise<ContentSummary[]> => {
  const collection = await getCollectionById(collectionId);

  if (!collection) {
    return [];
  }

  const entries = await readdir(path.join(CONTENT_DIRECTORY, collection.id), { withFileTypes: true });
  const contentEntries = await Promise.all(
    entries.filter(isVisibleDirectory).map((entry) => getContentEntrySummary(collection, entry.name)),
  );

  return sortContentEntries(contentEntries, collection);
});

export async function getCollectionEntriesByRoute(route: string) {
  const collection = await getCollectionByRoute(route);

  if (!collection) {
    return [];
  }

  return getCollectionEntries(collection.id);
}

export async function getContentEntryBySlug(collectionId: string, slug: string) {
  const entries = await getCollectionEntries(collectionId);
  return entries.find((entry) => entry.slug === slug);
}

export async function getContentEntryByRoute(route: string, slug: string) {
  const collection = await getCollectionByRoute(route);

  if (!collection) {
    return undefined;
  }

  return getContentEntryBySlug(collection.id, slug);
}

export async function getContentEntryModule(collectionId: string, slug: string): Promise<ContentModule> {
  return import(`@/content/${collectionId}/${slug}/page.mdx`);
}

export const getGenericCollectionStaticParams = cache(async () => {
  const collections = await getGenericCollections();
  return collections.map((collection) => ({ collection: collection.route }));
});

export const getGenericEntryStaticParams = cache(async () => {
  const collections = await getGenericCollections();
  const params = await Promise.all(
    collections.map(async (collection) => {
      const entries = await getCollectionEntries(collection.id);
      return entries.map((entry) => ({
        collection: collection.route,
        slug: entry.slug,
      }));
    }),
  );

  return params.flat();
});

async function readCollectionDefinition(id: string) {
  try {
    const rawDefinition = await readFile(path.join(CONTENT_DIRECTORY, id, TYPE_FILE_NAME), "utf8");
    return normalizeCollectionDefinition(JSON.parse(rawDefinition));
  } catch {
    return undefined;
  }
}

async function getContentEntrySummary(collection: CollectionDefinition, slug: string): Promise<ContentSummary> {
  const { frontmatter } = await getContentEntryModule(collection.id, slug);
  return {
    collection,
    slug,
    frontmatter: normalizeFrontmatter(frontmatter, collection, slug),
  };
}

function normalizeFrontmatter(frontmatter: ContentModule["frontmatter"], collection: CollectionDefinition, slug: string) {
  if (!frontmatter || typeof frontmatter !== "object") {
    throw new Error(`${collection.id}/${slug} is missing frontmatter.`);
  }

  if (typeof frontmatter.title !== "string" || !frontmatter.title.trim()) {
    throw new Error(`${collection.id}/${slug} is missing a title.`);
  }

  if (typeof frontmatter.description !== "string" || !frontmatter.description.trim()) {
    throw new Error(`${collection.id}/${slug} is missing a description.`);
  }

  return {
    ...frontmatter,
    title: frontmatter.title.trim(),
    description: frontmatter.description.trim(),
  };
}

function sortContentEntries(entries: ContentSummary[], collection: CollectionDefinition) {
  const direction = collection.sort ? (collection.sort.direction === "asc" ? 1 : -1) : 1;
  const sortField = collection.sort?.field ?? "title";

  return [...entries].sort((a, b) => {
    const valueDifference = compareSortValues(a.frontmatter[sortField], b.frontmatter[sortField]);

    if (valueDifference !== 0) {
      return valueDifference * direction;
    }

    return a.frontmatter.title.localeCompare(b.frontmatter.title, "es");
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

function isVisibleDirectory(entry: Dirent) {
  return entry.isDirectory() && !entry.name.startsWith(".");
}
