import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { ProseContainer } from "@/components/prose-container";
import { Tag } from "@/components/blog-post-tag";
import { BlogPostCard } from "@/components/blog-post-card";
import { getPostBySlug, getPostModule, getPosts, getPostSlugs } from "@/lib/posts";

export async function generateStaticParams() {
  return getPostSlugs();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      url: `${siteConfig.url}/posts/${slug}`,
      publishedTime: post.frontmatter.date,
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
    },
  };
}

export const dynamicParams = false;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { default: Post, frontmatter } = await getPostModule(slug);

  const blogPosts = await getPosts();

  // Find the index of the current post
  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);

  // Get previous and next posts
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10">
            <div className="flex items-center space-x-2 mb-4">
              <Link
                href="/posts"
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a artículos
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <time className="text-sm text-zinc-500 dark:text-zinc-400">{formatDate(frontmatter.date)}</time>
            </div>
            <h1 className="mb-4 text-zinc-900 dark:text-zinc-50 text-3xl">{frontmatter.title}</h1>
            <p className="text-xl text-zinc-700 dark:text-zinc-300 mb-6">{frontmatter.description}</p>
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <Tag key={tag} tag={tag} />
              ))}
            </div>
          </header>
          <ProseContainer>
            <Post />
          </ProseContainer>
          <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {prevPost && <BlogPostCard key={prevPost.slug} slug={prevPost.slug} frontmatter={prevPost.frontmatter} />}
              {nextPost && <BlogPostCard key={nextPost.slug} slug={nextPost.slug} frontmatter={nextPost.frontmatter} />}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
