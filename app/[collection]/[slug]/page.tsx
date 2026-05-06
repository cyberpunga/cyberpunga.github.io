import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPostCard } from "@/components/blog-post-card";
import { Tag } from "@/components/blog-post-tag";
import { ProseContainer } from "@/components/prose-container";
import {
  getCollectionByRoute,
  getCollectionEntries,
  getContentEntryByRoute,
  getContentEntryModule,
  getGenericEntryStaticParams,
  type ContentSummary,
} from "@/lib/content";
import { getPostModule, getPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;
export const dynamic = "force-static";

export async function generateStaticParams() {
  return getGenericEntryStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}): Promise<Metadata> {
  const { collection: route, slug } = await params;
  const entry = await getContentEntryByRoute(route, slug);

  if (!entry) {
    return {
      title: "Entrada no encontrada",
    };
  }

  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    openGraph: {
      title: entry.frontmatter.title,
      description: entry.frontmatter.description,
      type: "article",
      url: `${siteConfig.url}/${entry.collection.route}/${slug}`,
      publishedTime: getDateValue(entry),
      tags: getTagsValue(entry),
    },
    twitter: {
      card: "summary_large_image",
      title: entry.frontmatter.title,
      description: entry.frontmatter.description,
    },
  };
}

export default async function CollectionEntryPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection: route, slug } = await params;
  const collection = await getCollectionByRoute(route);
  const entry = await getContentEntryByRoute(route, slug);

  if (!collection || !entry) {
    notFound();
  }

  if (collection.id === "posts") {
    return <BlogPostEntryPage slug={slug} />;
  }

  const { default: Entry, frontmatter } = await getContentEntryModule(collection.id, slug);
  const entries = await getCollectionEntries(collection.id);
  const currentIndex = entries.findIndex((item) => item.slug === slug);
  const prevEntry = currentIndex > 0 ? entries[currentIndex - 1] : null;
  const nextEntry = currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null;
  const date = getDateValue(entry);
  const tags = getTagsValue(entry);
  const detailFields = getDetailFields(entry);

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={`/${collection.route}`}
                className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-[#c3d9f3]"
              >
                Volver a {collection.pluralLabel.toLowerCase()}
              </Link>
              {date ? (
                <>
                  <span className="text-zinc-700">/</span>
                  <time className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {formatDate(date)}
                  </time>
                </>
              ) : null}
            </div>
            <h1 className="mb-4 font-mono text-3xl font-normal leading-tight text-zinc-50 md:text-5xl">
              {frontmatter.title}
            </h1>
            <p className="mb-6 text-lg leading-7 text-zinc-400">{frontmatter.description}</p>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Tag key={tag} tag={tag} />
                ))}
              </div>
            ) : null}
            {detailFields.length > 0 ? (
              <dl className="mt-8 grid gap-4 border-t border-zinc-900 pt-6 text-sm sm:grid-cols-2">
                {detailFields.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
                    <dd className="mt-1 text-zinc-100">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </header>
          <ProseContainer>
            <Entry />
          </ProseContainer>
          {(prevEntry || nextEntry) && (
            <div className="mt-16 grid grid-cols-1 gap-8 border-t border-zinc-900 pt-8 md:grid-cols-2">
              {prevEntry ? <EntryLink entry={prevEntry} label="Anterior" /> : <div />}
              {nextEntry ? <EntryLink entry={nextEntry} label="Siguiente" /> : null}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

async function BlogPostEntryPage({ slug }: { slug: string }) {
  const { default: Post, frontmatter } = await getPostModule(slug);
  const blogPosts = await getPosts();
  const currentIndex = blogPosts.findIndex((post) => post.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10">
            <div className="mb-4 flex items-center space-x-2">
              <Link
                href="/posts"
                className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-[#c3d9f3]"
              >
                Volver a artículos
              </Link>
              <span className="text-zinc-700">/</span>
              <time className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                {formatDate(frontmatter.date)}
              </time>
            </div>
            <h1 className="mb-4 font-mono text-3xl font-normal leading-tight text-zinc-50 md:text-5xl">
              {frontmatter.title}
            </h1>
            <p className="mb-6 text-lg leading-7 text-zinc-400">{frontmatter.description}</p>
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <Tag key={tag} tag={tag} />
              ))}
            </div>
          </header>
          <ProseContainer>
            <Post />
          </ProseContainer>
          <div className="mt-16 grid grid-cols-1 gap-8 border-t border-zinc-900 pt-8 md:grid-cols-2">
            {prevPost ? <BlogPostCard key={prevPost.slug} slug={prevPost.slug} frontmatter={prevPost.frontmatter} /> : null}
            {nextPost ? <BlogPostCard key={nextPost.slug} slug={nextPost.slug} frontmatter={nextPost.frontmatter} /> : null}
          </div>
        </article>
      </main>
    </div>
  );
}

function EntryLink({ entry, label }: { entry: ContentSummary; label: string }) {
  return (
    <Link
      href={`/${entry.collection.route}/${entry.slug}`}
      className="block border border-zinc-900 p-5 transition-colors hover:border-zinc-700"
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <p className="mt-2 font-mono text-sm text-zinc-50">{entry.frontmatter.title}</p>
    </Link>
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

function getDetailFields(entry: ContentSummary) {
  return entry.collection.fields
    .filter((field) => field.type !== "date" && field.type !== "tags")
    .map((field) => {
      const value = entry.frontmatter[field.name];

      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      return {
        label: field.label,
        value: formatDetailValue(value),
      };
    })
    .filter((field): field is { label: string; value: string } => Boolean(field));
}

function formatDetailValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return String(value);
}
