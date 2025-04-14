import React from "react";
import { readdir } from "fs/promises";
import { Dirent } from "fs";

export default async function BlogIndex() {
  const posts = await getPosts();
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-12 md:py-24">
        <header className="mb-16 text-center">
          <h1 className="font-audiowide mb-4 text-4xl font-bold tracking-wider md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Techno-Critical Essays
            </span>
          </h1>
          <p className="font-noto mx-auto max-w-2xl text-lg text-zinc-400">
            Exploring the intersections of technology, society, and critical theory
          </p>
        </header>

        <pre>{JSON.stringify(posts, null, 2)}</pre>
      </div>
    </main>
  );
}

const getPosts = async () => {
  const posts = await getContentDirectory("./app/blog");
  const postData = await Promise.all(posts.map(getPostData));
  return postData;
};

const getContentDirectory = async (contentPath: string) => {
  const posts = (await readdir(contentPath, { withFileTypes: true })).filter((post) => post.isDirectory());
  return posts;
};

const getPostData = async (post: Dirent) => {
  const { frontmatter }: { frontmatter: FrontMatter } = await import(`./${post.name}/page.mdx`);
  return { ...post, frontmatter };
};

export type FrontMatter = {
  title: string;
  date: string;
  description: string;
  tags: string[];
};
