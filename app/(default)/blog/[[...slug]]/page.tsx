import { Badge } from "@/components/ui/badge";
import { readdir } from "fs/promises";
// import { Metadata, ResolvingMetadata } from "next";
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
      <article className="py-24 flex flex-col">
        <PostHeader title={frontmatter.title} date={frontmatter.date} description={frontmatter.description} />
        <Tags tags={frontmatter.tags} />
        <Post />
      </article>
    );
  }
  return <BlogPosts />;
}

function PostHeader({ title, date, description }: { title: string; date: string; description: string }) {
  return (
    <div>
      <Link className="no-underline" href={`/blog/${slugify(title)}`}>
        <h1 className="relative mb-0!">{title}</h1>
      </Link>
      <span className="text-xs top-full right-1/2 bg-accent my-0! rounded-sm py-0 px-1">{date}</span>
      <p>{description}</p>
    </div>
  );
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
    <div className="py-24 flex flex-col gap-24">
      {posts.map((post) => (
        <article key={post.slug.join("")}>
          <PostHeader title={post.title} date={post.date} description={post.description} />
          <Tags tags={post.tags} />
        </article>
      ))}
    </div>
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
