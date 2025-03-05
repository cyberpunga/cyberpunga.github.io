import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import { badgeVariants } from "./components/ui/badge";
import { cn } from "./lib/utils";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    img: (props) => (
      <Image
        {...props}
        unoptimized
        alt={props.alt}
        className={cn(badgeVariants({ variant: "outline" }), "object-cover p-0 w-11/12 mx-auto")}
      />
    ),
  };
}
