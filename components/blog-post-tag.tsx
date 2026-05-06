import { slugify } from "@/lib/utils";
import Link from "next/link";

export function Tag({ tag }: { tag: string }) {
  tag = slugify(tag.toLowerCase());
  return (
    <Link
      href={`/posts?tag=${tag}`}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 whitespace-nowrap hover:bg-zinc-200 dark:hover:bg-zinc-700"
    >
      {tag}
    </Link>
  );
}
