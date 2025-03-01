import { readdir } from "fs/promises";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const { default: Post } = await import(`@/content/${slug}/page.mdx`);

  return <Post />;
}

export async function generateStaticParams() {
  const slugs = await getSlugs();
  return slugs;
}

async function getSlugs() {
  const posts = await readdir("./content", { withFileTypes: true });
  return posts.filter((post) => post.isDirectory()).map((post) => ({ slug: post.name }));
}

export const dynamicParams = false;
