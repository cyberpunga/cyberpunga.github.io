import SimpleMarquee from "@/fancy/components/blocks/simple-marquee";
import { slugify } from "@/lib/utils";
import Link from "next/link";

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
    <article className="group h-full flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-background/20 backdrop-blur-[2px] transition-all hover:shadow-md dark:hover:shadow-zinc-900/30">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center space-x-2 mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          <time>{formatDate(frontmatter.date)}</time>
        </div>

        <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-3 group-hover:text-primary">
          <Link href={`/posts/${slug}`}>{frontmatter.title}</Link>
        </h3>

        <p className="line-clamp-6 text-zinc-700 dark:text-zinc-300 flex-grow">{frontmatter.description}</p>
      </div>

      <div className="h-8 flex items-center overflow-hidden relative bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-zinc-50 dark:from-zinc-900 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-zinc-50 dark:from-zinc-900 to-transparent z-10"></div>

        <SimpleMarquee className="gap-2 [&>.flex]:gap-2" slowdownOnHover={true} direction="left">
          {frontmatter.tags
            .map((tag) => slugify(tag.toLowerCase()))
            .map((tag, index) => (
              <Link
                key={`${tag}-${index}`}
                href={`/posts?tag=${slugify(tag.toLowerCase())}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 whitespace-nowrap"
              >
                {tag}
              </Link>
            ))}
        </SimpleMarquee>
      </div>
    </article>
  );
}
