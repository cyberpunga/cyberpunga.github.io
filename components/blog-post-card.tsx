"use client";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  useEffect(() => {
    if (tagsContainerRef.current && tagsRef.current) {
      const containerWidth = tagsContainerRef.current.clientWidth;
      const tagsWidth = tagsRef.current.scrollWidth;

      setShouldAnimate(tagsWidth > containerWidth);
    }
  }, [frontmatter.tags]);
  return (
    <article className="group h-full flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-background/20 backdrop-blur-[2px] transition-all hover:shadow-md dark:hover:shadow-zinc-900/30">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center space-x-2 mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          <time>{formatDate(frontmatter.date)}</time>
          {/* <span className="text-zinc-300 dark:text-zinc-600">•</span> */}
          {/* <span>{frontmatter.tags[0]}</span> */}
        </div>

        <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-3 group-hover:text-primary">
          <Link href={`/posts/${slug}`}>{frontmatter.title}</Link>
        </h3>

        <p className="line-clamp-6 text-zinc-700 dark:text-zinc-300 flex-grow">{frontmatter.description}</p>
      </div>
      <div className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div ref={tagsContainerRef} className="h-8 flex items-center overflow-hidden relative">
          <div
            ref={tagsRef}
            className={shouldAnimate ? "flex gap-2 items-center animate-marquee" : "flex gap-2 items-center"}
            style={
              shouldAnimate
                ? ({
                    "--duration": `${frontmatter.tags.length * 3}s`,
                  } as React.CSSProperties)
                : {}
            }
            onMouseEnter={
              shouldAnimate
                ? (e) => {
                    e.currentTarget.style.animationPlayState = "paused";
                  }
                : undefined
            }
            onMouseLeave={
              shouldAnimate
                ? (e) => {
                    e.currentTarget.style.animationPlayState = "running";
                  }
                : undefined
            }
          >
            {frontmatter.tags
              .map((tag) => slugify(tag.toLowerCase()))
              .map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}

            {/* Duplicate tags for seamless looping when animating */}
            {shouldAnimate &&
              frontmatter.tags
                .map((tag) => slugify(tag.toLowerCase()))
                .map((tag) => (
                  <span
                    key={`${tag}-duplicate`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
          </div>
        </div>
      </div>
    </article>
  );
}
