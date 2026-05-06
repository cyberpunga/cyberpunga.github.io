"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Tag } from "@/components/blog-post-tag";
import type { PostSummary } from "@/lib/posts";
import { formatDate, slugify } from "@/lib/utils";

export function PostsList({ posts }: { posts: PostSummary[] }) {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const activeTagSlug = activeTag ? slugify(activeTag) : null;
  const filteredPosts = activeTagSlug
    ? posts.filter((post) => post.frontmatter.tags.some((tag) => slugify(tag) === activeTagSlug))
    : posts;

  return (
    <>
      {activeTagSlug && (
        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Filtrando por</span>
          <Tag tag={activeTagSlug} />
          <Link href="/posts" className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100">
            Ver todos
          </Link>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="space-y-12">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="border-b border-zinc-200 pb-12 last:border-0 dark:border-zinc-800"
            >
              <div className="mb-3 flex items-center space-x-2">
                <time className="text-sm text-zinc-500 dark:text-zinc-400">{formatDate(post.frontmatter.date)}</time>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{post.frontmatter.tags[0]}</span>
              </div>
              <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  {post.frontmatter.title}
                </Link>
              </h2>
              <p className="mb-4 text-zinc-700 dark:text-zinc-300">{post.frontmatter.description}</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag) => (
                  <Tag key={tag} tag={tag} />
                ))}
              </div>
              <Link
                href={`/posts/${post.slug}`}
                className="inline-flex items-center font-medium text-zinc-900 hover:underline dark:text-zinc-100"
              >
                Leer artículo completo
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-b border-zinc-200 pb-12 dark:border-zinc-800">
          <p className="text-zinc-700 dark:text-zinc-300">No hay artículos para este tag.</p>
        </div>
      )}
    </>
  );
}
