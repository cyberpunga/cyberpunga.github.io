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
        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-zinc-900 pb-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Filtrando por</span>
          <Tag tag={activeTagSlug} />
          <Link href="/posts" className="font-mono text-xs uppercase tracking-[0.18em] text-[#c3d9f3] hover:underline">
            Ver todos
          </Link>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="space-y-12">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="border-b border-zinc-900 pb-12 last:border-0"
            >
              <div className="mb-3 flex items-center space-x-2">
                <time className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  {formatDate(post.frontmatter.date)}
                </time>
                <span className="text-zinc-700">/</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  {post.frontmatter.tags[0]}
                </span>
              </div>
              <h2 className="mb-3 font-mono text-2xl font-normal text-zinc-50">
                <Link href={`/posts/${post.slug}`} className="transition-colors hover:text-[#c3d9f3]">
                  {post.frontmatter.title}
                </Link>
              </h2>
              <p className="mb-4 leading-7 text-zinc-400">{post.frontmatter.description}</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag) => (
                  <Tag key={tag} tag={tag} />
                ))}
              </div>
              <Link
                href={`/posts/${post.slug}`}
                className="inline-flex items-center font-mono text-xs uppercase tracking-[0.18em] text-[#c3d9f3] hover:underline"
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
        <div className="border-b border-zinc-900 pb-12">
          <p className="text-zinc-400">No hay artículos para este tag.</p>
        </div>
      )}
    </>
  );
}
