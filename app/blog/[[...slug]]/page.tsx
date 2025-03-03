import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { readdir } from "fs/promises";
import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import slugify from "@sindresorhus/slugify";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (slug && slug.length) {
    const { default: Post, frontmatter } = await import(`@/content/${slug.join("")}/page.mdx`);
    if (!frontmatter) {
      notFound();
    }
    return (
      <article className="prose dark:prose-invert lg:prose-xl mx-auto font-[family-name:var(--font-space-grotesk)]">
        <span>{frontmatter.date}</span>
        <h1 className="mt-8!">{frontmatter.title}</h1>
        <p>{frontmatter.description}</p>
        <Tags tags={frontmatter.tags} />
        <Post />
      </article>
    );
  }
  return <BlogPosts />;
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div>
      {tags.map((tag: string) => {
        tag = slugify(tag);
        return (
          <a key={tag} className="not-last:mr-2" href={`/tags/${tag}`}>
            <Badge variant="outline">{tag}</Badge>
          </a>
        );
      })}
    </div>
  );
}

async function BlogPosts() {
  const slugs = await getSlugs();
  const posts = await Promise.all(
    slugs.map(async (post) => {
      const { frontmatter } = await import(`@/content/${post.slug.join("")}/page.mdx`);
      return { ...frontmatter, slug: post.slug };
    })
  );
  return (
    <ul className="flex flex-col gap-8">
      {posts.map((post) => (
        <li key={post.slug.join("")}>
          <article
            className={cn(
              "prose dark:prose-invert lg:prose-xl font-[family-name:var(--font-space-grotesk)]",
              "flex flex-col"
            )}
          >
            <span className="text-xs">{post.date}</span> <Link href={`/blog/${post.slug.join("")}`}>{post.title}</Link>
            <Tags tags={post.tags} />
          </article>
        </li>
      ))}
    </ul>
  );
}

// export async function generateMetadata(
//   { params, searchParams }: { params: { slug: string[] }; searchParams: URLSearchParams },
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   // read route params
//   const id = (await params).slug;
//   console.log(id);

//   // fetch data
//   // const   product = await fetch(`https://.../${id}`).then((res) => res.json());

//   // optionally access and extend (rather than replace) parent metadata
//   // const previousImages = (await parent).openGraph?.images || [];

//   return {
//     title: "HOLA", // product.title,
//     openGraph: {
//       // images: ["/some-specific-page-image.jpg", ...previousImages],
//     },
//   };
// }

export async function generateStaticParams() {
  const slugs = await getSlugs();
  return [...slugs, { slug: [] }];
}

async function getSlugs() {
  const posts = await readdir("./content", { withFileTypes: true });
  return posts.filter((post) => post.isDirectory()).map((post) => ({ slug: [post.name] }));
}

export const dynamicParams = false;
