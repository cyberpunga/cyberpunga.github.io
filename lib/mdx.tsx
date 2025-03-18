import { MDXRemote } from "next-mdx-remote/rsc"
import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from "remark-gfm"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

// Custom components to use in MDX
const components = {
  // You can add custom components here to use in your MDX
  // Example: CustomImage, CodeBlock, etc.
}

export async function serializeMDX(content: string) {
  return await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        [rehypePrism, { showLineNumbers: true }],
      ],
    },
  })
}

export function MDXContent({ source }: { source: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXRemote source={source} components={components} />
    </div>
  )
}

