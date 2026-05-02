import type { Metadata } from "next";
import { Suspense } from "react";

import { getPosts } from "@/lib/posts";
import { PostsList } from "./posts-list";

export const metadata: Metadata = {
  title: "Artículos",
  description: "Exploraciones críticas en la intersección de tecnología, sociedad y pensamiento latinoamericano.",
};

export default async function BlogPage() {
  const blogPosts = await getPosts();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mr-auto">
          <header className="mb-12">
            <h1 className="mb-4 text-zinc-900 dark:text-zinc-50">Artículos</h1>
            <p className="text-xl text-zinc-700 dark:text-zinc-300">
              Exploraciones críticas en la intersección de tecnología, sociedad y pensamiento latinoamericano.
            </p>
          </header>

          <Suspense fallback={<div className="text-zinc-700 dark:text-zinc-300">Cargando artículos...</div>}>
            <PostsList posts={blogPosts} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
