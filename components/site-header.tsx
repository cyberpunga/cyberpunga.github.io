import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50">{siteConfig.name}</span>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              {item.title}
            </Link>
          ))}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
