import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 z-10">
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
            <h3 className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">Temas</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {siteConfig.footerNav.popularTags.map((tag) => (
                <Link
                  key={tag.href}
                  href={tag.href}
                  className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {tag.title}
                </Link>
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
