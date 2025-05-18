import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { getPosts } from "@/app/posts/page";
import { Tag } from "./blog-post-tag";

export async function SiteFooter() {
  const blogPosts = await getPosts();
  const uniqueTags = [...new Set(blogPosts.flatMap((post) => post.frontmatter.tags))];
  return (
    <footer className="border-t border-zinc-200 bg-background/50 backdrop-blur-[2px] dark:border-zinc-800 z-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
              {siteConfig.name}
            </Link>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{siteConfig.description}</p>
          </div>
          <div>
            <h3 className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">Navegación</h3>
            <ul className="mt-4 space-y-2">
              {siteConfig.footerNav.resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">Tags</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {uniqueTags.map((tag) => (
                <Tag key={tag} tag={tag} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
