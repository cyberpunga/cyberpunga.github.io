import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { getPosts } from "@/lib/posts";
import { Tag } from "./blog-post-tag";

export async function SiteFooter() {
  const blogPosts = await getPosts();
  const uniqueTags = [...new Set(blogPosts.flatMap((post) => post.frontmatter.tags))];
  return (
    <footer className="z-10 border-t border-zinc-900 bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="font-mono text-sm font-normal uppercase tracking-[0.32em] text-zinc-50">
              {siteConfig.name}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">{siteConfig.description}</p>
          </div>
          <div>
            <h3 className="font-mono text-xs font-normal uppercase tracking-[0.18em] text-zinc-400">Navegación</h3>
            <ul className="mt-4 space-y-2">
              {siteConfig.footerNav.resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-50"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs font-normal uppercase tracking-[0.18em] text-zinc-400">Tags</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {uniqueTags.map((tag) => (
                <Tag key={tag} tag={tag} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-zinc-900 pt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
