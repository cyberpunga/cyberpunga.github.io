export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const { default: Post } = await import(`@/content/${slug}/page.mdx`);

  return <Post />;
}

export async function generateStaticParams() {
  return [{ slug: "some-other-example" }, { slug: "some" }, { slug: "example-markdown-post" }];
}

export const dynamicParams = false;
