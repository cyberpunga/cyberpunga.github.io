"use client";
import Link from "next/link";
import * as React from "react";
import { useGlitch } from "react-powerglitch";

export function BlogPost({ post }) {
  const glitch = useGlitch({
    playMode: "hover",
  });
  return (
    <Link className="flex flex-col space-y-1 mb-4" href={`/blog/${post.slug}`}>
      <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
        <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">{post.metadata.publishedAt}</p>
        <p ref={glitch.ref} className="text-neutral-900 dark:text-neutral-100 tracking-tight">
          {post.metadata.title}
        </p>
      </div>
    </Link>
  );
}
