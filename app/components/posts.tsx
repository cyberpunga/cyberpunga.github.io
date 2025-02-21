import Link from "next/link";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { BlogPost } from "./post";

export function BlogPosts() {
  let allBlogs = getBlogPosts();

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <BlogPost
            key={post.slug}
            post={{
              ...post,
              metadata: { ...post.metadata, publishedAt: formatDate(post.metadata.publishedAt) },
            }}
          />
        ))}
    </div>
  );
}
