import type React from "react";
import { cache } from "react";

import { getCollectionEntries, getContentEntryBySlug, getContentEntryModule } from "@/lib/content";

export type FrontMatter = {
  title: string;
  date: string;
  description: string;
  tags: string[];
};

export type PostSummary = {
  slug: string;
  frontmatter: FrontMatter;
};

export type PostModule = {
  default: React.ComponentType;
  frontmatter: FrontMatter;
};

export const getPosts = cache(async (): Promise<PostSummary[]> => {
  const posts = await getCollectionEntries("posts");
  return posts.map((post) => ({
    slug: post.slug,
    frontmatter: toPostFrontmatter(post.frontmatter),
  }));
});

export const getPostSlugs = cache(async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
});

export async function getPostModule(slug: string): Promise<PostModule> {
  return getContentEntryModule("posts", slug) as Promise<PostModule>;
}

export async function getPostBySlug(slug: string): Promise<PostSummary | undefined> {
  const post = await getContentEntryBySlug("posts", slug);

  if (!post) {
    return undefined;
  }

  return {
    slug: post.slug,
    frontmatter: toPostFrontmatter(post.frontmatter),
  };
}

function toPostFrontmatter(frontmatter: Record<string, unknown>): FrontMatter {
  return {
    title: String(frontmatter.title),
    date: String(frontmatter.date),
    description: String(frontmatter.description),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
  };
}
