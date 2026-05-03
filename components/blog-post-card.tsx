import SimpleMarquee from "@/fancy/components/blocks/simple-marquee";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import { Tag } from "./blog-post-tag";

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Format: "1 de enero de 2023"
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
}

interface PostCardProps {
  slug: string;
  frontmatter: PostFrontmatter;
}

export function BlogPostCard({ slug, frontmatter }: PostCardProps) {
  return (
    <article className="group flex h-full flex-col border border-zinc-900 bg-black transition-colors hover:border-zinc-700">
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-3 flex items-center space-x-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
          <time>{formatDate(frontmatter.date)}</time>
        </div>

        <h3 className="mb-3 line-clamp-3 font-mono text-xl font-normal text-zinc-50 transition-colors group-hover:text-[#c3d9f3]">
          <Link href={`/posts/${slug}`}>{frontmatter.title}</Link>
        </h3>

        <p className="line-clamp-6 flex-grow text-sm leading-6 text-zinc-400">{frontmatter.description}</p>
      </div>

      <div className="relative flex min-h-10 items-center overflow-hidden border-t border-zinc-900 bg-black">
        <SimpleMarquee className="gap-2 [&>.flex]:gap-2" slowdownOnHover={true} direction="left">
          {frontmatter.tags
            .map((tag) => slugify(tag.toLowerCase()))
            .map((tag, index) => (
              <Tag key={`${tag}-${index}`} tag={tag} />
            ))}
        </SimpleMarquee>
      </div>
    </article>
  );
}
