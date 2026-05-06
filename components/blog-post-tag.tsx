import { slugify } from "@/lib/utils";
import Link from "next/link";

export function Tag({ tag }: { tag: string }) {
  tag = slugify(tag.toLowerCase());
  return (
    <Link
      href={`/posts?tag=${tag}`}
      className="inline-flex min-h-7 items-center border border-zinc-800 px-2.5 py-1 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-50"
    >
      {tag}
    </Link>
  );
}
