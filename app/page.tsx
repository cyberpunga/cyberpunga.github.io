import Link from "next/link";

import { formatDate } from "@/lib/utils";

import { getPosts } from "@/lib/posts";
import { AsciiAnimation } from "@/components/ascii-animation";
import { BlogPostCard } from "@/components/blog-post-card";

export default async function Home() {
  const blogPosts = await getPosts();
  // Get the latest post for the featured section
  const featuredPost = blogPosts[0];

  // Get the rest of the posts for the recent posts section
  const recentPosts = blogPosts.slice(1, 4);

  return (
    <div className="min-h-screen bg-black">
      <main className="container relative z-10 mx-auto px-4 py-12">
        {/* Featured Post */}
        <section className="flex min-h-[80vh] flex-col justify-end border-b border-zinc-900 py-16">
          <h2 className="mb-8 font-mono text-xs font-normal uppercase tracking-[0.22em] text-zinc-500">
            Artículo destacado
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="space-y-5 lg:col-span-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <time className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {formatDate(featuredPost.frontmatter.date)}
                  </time>
                  <span className="text-zinc-700">/</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {featuredPost.frontmatter.tags[0]}
                  </span>
                </div>
                <h3 className="max-w-5xl font-mono text-4xl font-normal leading-tight text-zinc-50 md:text-6xl">
                  <Link href={`/posts/${featuredPost.slug}`}>{featuredPost.frontmatter.title}</Link>
                </h3>
              </div>
              <p className="max-w-3xl text-base leading-7 text-zinc-400">{featuredPost.frontmatter.description}</p>
              <div>
                <Link
                  href={`/posts/${featuredPost.slug}`}
                  className="inline-flex min-h-11 items-center border border-zinc-700 px-5 font-mono text-xs uppercase tracking-[0.18em] text-zinc-100 transition-colors hover:border-zinc-100"
                >
                  Leer artículo completo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-16">
          <h2 className="mb-8 font-mono text-xs font-normal uppercase tracking-[0.22em] text-zinc-500">
            Artículos recientes
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogPostCard key={post.slug} slug={post.slug} frontmatter={post.frontmatter} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/posts"
              className="inline-flex min-h-11 items-center border border-zinc-700 px-6 font-mono text-xs uppercase tracking-[0.18em] text-zinc-100 transition-colors hover:border-zinc-100"
            >
              Ver todos los artículos
            </Link>
          </div>
        </section>
      </main>
      <AsciiAnimation className="fixed top-0 z-0" />
    </div>
  );
}
