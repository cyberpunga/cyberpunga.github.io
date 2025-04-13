import React from 'react';
import { readdir } from 'fs/promises';

export default async function BlogIndex() {
  const posts = await getPosts();
  const postsData = await Promise.all(
    posts.map(async (post) => await getPostData(post.name))
  );

  return <pre>{JSON.stringify(postsData, null, 2)}</pre>;
}

const getPosts = async () => {
  const posts = (await readdir('./app/blog', { withFileTypes: true })).filter(
    (post) => post.isDirectory()
  );
  return posts;
};

const getPostData = async (slug: string) => {
  const { frontmatter } = await import(`./${slug}/page.mdx`);
  return frontmatter;
};
