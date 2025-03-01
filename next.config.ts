import createMDXPlugin from "@next/mdx";
import { NextConfig } from "next";

const mdxConfig = {
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
};

const withMDX = createMDXPlugin(mdxConfig);

const nextConfig: NextConfig = {
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // Optionally, add any other Next.js config below
  reactStrictMode: true,
  output: "export",
};

// Merge MDX config with Next.js config
module.exports = withMDX(nextConfig);
