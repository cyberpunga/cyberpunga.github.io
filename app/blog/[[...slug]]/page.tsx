import { Badge } from "@/components/ui/badge";
import { readdir } from "fs/promises";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const paramss = await params;
  if (!paramss) {
    return <h1>404</h1>;
  }
  const { slug } = paramss ?? {};
  console.log(paramss);
  if (slug) {
    const { default: Post, frontmatter } = await import(`@/content/${slug.join("")}/page.mdx`);
    return (
      <article className="prose dark:prose-invert lg:prose-xl mx-auto font-[family-name:var(--font-space-grotesk)]">
        <h1>{frontmatter.title}</h1>
        <p>{frontmatter.date}</p>
        <p>{frontmatter.description}</p>
        <p className="flex gap-2">
          {frontmatter.tags.map((tag: string) => (
            <a key={tag} href={`/tags/${tag}`}>
              <Badge variant="outline">{tag}</Badge>
            </a>
          ))}
        </p>
        <Post />
      </article>
    );
  }
  return <h1>LIST</h1>;
}

export async function generateStaticParams() {
  const slugs = await getSlugs();
  console.log("generateStaticParams:", JSON.stringify(slugs, null, 2));
  return [...slugs, { slug: [""] }];
}

async function getSlugs() {
  const posts = await readdir("./content", { withFileTypes: true });
  // console.log(posts.filter((post) => post.isDirectory()).map((post) => ({ slug: [post.name] })));
  return posts.filter((post) => post.isDirectory()).map((post) => ({ slug: [post.name] }));
}

export const dynamicParams = false;
