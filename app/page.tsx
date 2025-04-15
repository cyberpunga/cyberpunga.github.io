import Link from "next/link";

import { formatDate } from "@/lib/utils";

import { getPosts } from "./posts/page";

export default async function Home() {
  const blogPosts = await getPosts();
  // Get the latest post for the featured section
  const featuredPost = blogPosts[0];

  // Get the rest of the posts for the recent posts section
  const recentPosts = blogPosts.slice(1, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        {/* <section className="mb-16 border-b border-zinc-200 dark:border-zinc-800 pb-16">
          <h1 className="mb-6 text-zinc-900 dark:text-zinc-50">{siteConfig.name}</h1>
          <p className={cn("text-xl text-muted-foreground", "max-w-3xl mb-8 text-zinc-700 dark:text-zinc-300")}>
            {siteConfig.description}
          </p>
          <Link
            href="/posts"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
          >
            Explorar Artículos
          </Link>
        </section> */}

        {/* Featured Post */}
        <section className="my-16">
          <h2 className="mb-8 text-zinc-900 dark:text-zinc-50">Artículo Destacado</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <time className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(featuredPost.frontmatter.date)}
                  </time>
                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{featuredPost.frontmatter.tags[0]}</span>
                </div>
                <h3 className="text-zinc-900 dark:text-zinc-50 text-2xl font-bold">
                  <Link href={`/posts/${featuredPost.slug}`}>{featuredPost.frontmatter.title}</Link>
                </h3>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300">{featuredPost.frontmatter.description}</p>
              <div>
                <Link
                  href={`/posts/${featuredPost.slug}`}
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
              </div>
            </div>
            <div className="lg:col-span-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6">
              <h4 className="font-mono font-semibold mb-3 text-zinc-900 dark:text-zinc-50">Temas Relacionados</h4>
              <div className="flex flex-wrap gap-2">
                {featuredPost.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="font-mono font-semibold mb-3 text-zinc-900 dark:text-zinc-50">Extracto</h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-6">
                  {featuredPost.frontmatter.description.split("\n").slice(0, 3).join(" ").substring(0, 300)}...
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section>
          <h2 className="mb-8 text-zinc-900 dark:text-zinc-50">Artículos Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <article
                key={post.frontmatter.title}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <time className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(post.frontmatter.date)}
                    </time>
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{post.frontmatter.tags[0]}</span>
                  </div>
                  <h3 className="mb-2 text-zinc-900 dark:text-zinc-50">
                    <Link href={`/posts/${post.slug}`} className="hover:underline">
                      {post.frontmatter.title}
                    </Link>
                  </h3>
                  <p className="mb-4 line-clamp-3 text-zinc-700 dark:text-zinc-300">{post.frontmatter.description}</p>
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-wrap gap-2">
                    {post.frontmatter.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.frontmatter.tags.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        +{post.frontmatter.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/posts"
              className="inline-flex items-center px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-base font-medium rounded-md text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
            >
              Ver todos los artículos
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
