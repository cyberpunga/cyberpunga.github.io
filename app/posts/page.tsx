import React from "react";
import { readdir } from "fs/promises";
import { Dirent } from "fs";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artículos",
  description: "Exploraciones críticas en la intersección de tecnología, sociedad y pensamiento latinoamericano.",
};

export default async function BlogPage() {
  const blogPosts = await getPosts();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="mb-4 text-zinc-900 dark:text-zinc-50">Artículos</h1>
            <p className="text-xl text-zinc-700 dark:text-zinc-300">
              Exploraciones críticas en la intersección de tecnología, sociedad y pensamiento latinoamericano.
            </p>
          </header>

          <div className="space-y-12">
            {blogPosts.map((post) => (
              <article
                key={post.frontmatter.title}
                className="border-b border-zinc-200 dark:border-zinc-800 pb-12 last:border-0"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <time className="text-sm text-zinc-500 dark:text-zinc-400">{formatDate(post.frontmatter.date)}</time>
                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{post.frontmatter.tags[0]}</span>
                </div>
                <h2 className="mb-3 text-zinc-900 dark:text-zinc-50 text-2xl font-bold">
                  <Link href={`/posts/${post.slug}`} className="hover:underline">
                    {post.frontmatter.title}
                  </Link>
                </h2>
                <p className="mb-4 text-zinc-700 dark:text-zinc-300">{post.frontmatter.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.frontmatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline inline-flex items-center"
                >
                  Leer artículo completo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
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
        </div>
      </main>
    </div>
  );
}

export const getPosts = async () => {
  const posts = await getContentDirectory("posts");
  const postData = await Promise.all(posts.map(getPostData));
  return postData;
};

const getContentDirectory = async (contentPath: string) => {
  const posts = (await readdir(contentPath, { withFileTypes: true })).filter((post) => post.isDirectory());
  return posts;
};

const getPostData = async (post: Dirent) => {
  const { frontmatter }: { frontmatter: FrontMatter } = await import(`@/posts/${post.name}/page.mdx`);
  console.log({ ...post, frontmatter, slug: post.name });
  return { ...post, frontmatter, slug: post.name };
};

export type FrontMatter = {
  title: string;
  date: string;
  description: string;
  tags: string[];
  slug: string;
};
