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
        className="mx-auto max-w-11/12 border border-zinc-800"
      />
    ),
  };
}
