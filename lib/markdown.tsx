import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import { processMarkdownImages } from "./image-processor"

export async function renderMarkdown(content: string): Promise<string> {
  // First, process and download all images (only in Node.js environment)
  let processedContent = content
  if (typeof window === "undefined") {
    console.log("Processing images in markdown content...")
    processedContent = await processMarkdownImages(content)
  }

  // Then render the markdown to HTML
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypePrism, { showLineNumbers: true })
    .use(rehypeStringify)
    .process(processedContent)

  return result.toString()
}

