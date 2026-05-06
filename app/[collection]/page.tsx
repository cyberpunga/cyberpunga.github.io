import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Tag } from "@/components/blog-post-tag";
import {
  getCollectionByRoute,
  getCollectionEntries,
  getGenericCollectionStaticParams,
  type ContentSummary,
} from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { PostsList } from "@/app/posts/posts-list";

export const dynamicParams = false;
export const dynamic = "force-static";

export async function generateStaticParams() {
  return getGenericCollectionStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }): Promise<Metadata> {
  const { collection: route } = await params;
  const collection = await getCollectionByRoute(route);

  if (!collection) {
    return {
      title: "Colección no encontrada",
    };
  }

  return {
    title: collection.pluralLabel,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: route } = await params;
  const collection = await getCollectionByRoute(route);

  if (!collection) {
    notFound();
  }

  if (collection.id === "posts") {
    const blogPosts = await getPosts();

    return (
      <div className="min-h-screen bg-black">
        <main className="container mx-auto px-4 py-12">
          <div className="mr-auto max-w-4xl">
            <header className="mb-12">
              <h1 className="mb-4 font-mono text-4xl font-normal text-zinc-50 md:text-5xl">
                {collection.pluralLabel}
              </h1>
              <p className="max-w-3xl text-lg leading-7 text-zinc-400">{collection.description}</p>
            </header>

            <Suspense fallback={<div className="text-zinc-400">Cargando artículos...</div>}>
              <PostsList posts={blogPosts} />
            </Suspense>
          </div>
        </main>
      </div>
    );
  }

  const entries = await getCollectionEntries(collection.id);

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-12">
        <div className="mr-auto max-w-4xl">
          <header className="mb-12">
            <h1 className="mb-4 font-mono text-4xl font-normal text-zinc-50 md:text-5xl">
              {collection.pluralLabel}
            </h1>
            {collection.description ? (
              <p className="max-w-3xl text-lg leading-7 text-zinc-400">{collection.description}</p>
            ) : null}
          </header>

          {entries.length > 0 ? (
            <div className="space-y-12">
              {entries.map((entry) => (
                <CollectionEntryPreview key={entry.slug} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="border-b border-zinc-900 pb-12">
              <p className="text-zinc-400">No hay entradas publicadas.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CollectionEntryPreview({ entry }: { entry: ContentSummary }) {
  const date = getDateValue(entry);
  const tags = getTagsValue(entry);

  return (
    <article className="border-b border-zinc-900 pb-12 last:border-0">
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        {date ? (
          <time className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">{formatDate(date)}</time>
        ) : null}
        {date && tags.length > 0 ? <span className="text-zinc-700">/</span> : null}
        {tags[0] ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">{tags[0]}</span>
        ) : null}
      </div>
      <h2 className="mb-3 font-mono text-2xl font-normal text-zinc-50">
        <Link href={`/${entry.collection.route}/${entry.slug}`} className="transition-colors hover:text-[#c3d9f3]">
          {entry.frontmatter.title}
        </Link>
      </h2>
      <p className="mb-4 leading-7 text-zinc-400">{entry.frontmatter.description}</p>
      {tags.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag} tag={tag} />
          ))}
        </div>
      ) : null}
      <Link
        href={`/${entry.collection.route}/${entry.slug}`}
        className="inline-flex items-center font-mono text-xs uppercase tracking-[0.18em] text-[#c3d9f3] hover:underline"
      >
        Leer entrada completa
      </Link>
    </article>
  );
}

function getDateValue(entry: ContentSummary) {
  const dateField = entry.collection.fields.find((field) => field.type === "date");
  const value = dateField ? entry.frontmatter[dateField.name] : undefined;
  return typeof value === "string" ? value : "";
}

function getTagsValue(entry: ContentSummary) {
  const tagsField = entry.collection.fields.find((field) => field.type === "tags");
  const value = tagsField ? entry.frontmatter[tagsField.name] : undefined;
  return Array.isArray(value) ? value.map(String) : [];
}
