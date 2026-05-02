import type React from "react";
import type { Dirent } from "fs";
import { readdir } from "fs/promises";
import { cache } from "react";

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

const POSTS_DIRECTORY = "posts";

export const getPosts = cache(async (): Promise<PostSummary[]> => {
  const entries = await readdir(POSTS_DIRECTORY, { withFileTypes: true });
  const posts = await Promise.all(entries.filter(isPostDirectory).map(getPostSummary));

  return posts.sort((a, b) => {
    const dateDifference = new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return a.frontmatter.title.localeCompare(b.frontmatter.title, "es");
  });
});

export const getPostSlugs = cache(async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
});

export async function getPostModule(slug: string): Promise<PostModule> {
  return import(`@/posts/${slug}/page.mdx`);
}

export async function getPostBySlug(slug: string): Promise<PostSummary | undefined> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}

function isPostDirectory(entry: Dirent) {
  return entry.isDirectory();
}

async function getPostSummary(entry: Dirent): Promise<PostSummary> {
  const { frontmatter } = await getPostModule(entry.name);
  return {
    slug: entry.name,
    frontmatter,
  };
}
