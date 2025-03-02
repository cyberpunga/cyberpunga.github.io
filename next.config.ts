import createMDX from "@next/mdx";
import { NextConfig } from "next";
import remarkGfm from "remark-gfm";
import rehypeMdxImportMedia from "rehype-mdx-import-media";

const nextConfig: NextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Optionally, add any other Next.js config below
  output: "export",
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeMdxImportMedia],
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
