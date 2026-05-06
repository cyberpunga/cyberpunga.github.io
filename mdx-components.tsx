import type { MDXComponents } from "mdx/types";
import Image from "next/image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    img: (props) => (
      <Image
        {...props}
        unoptimized
        alt={props.alt}
        className="rounded-lg max-w-11/12 mx-auto shadow-xl border border-zinc-200 dark:border-zinc-800"
      />
    ),
  };
}
