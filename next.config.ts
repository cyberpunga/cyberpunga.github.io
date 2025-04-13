import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import rehypeMdxImportMedia from 'rehype-mdx-import-media';

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  output: 'export',
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypeUnwrapImages, rehypeMdxImportMedia],
  },
});

export default withMDX(nextConfig);
