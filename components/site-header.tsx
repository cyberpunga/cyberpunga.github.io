import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getGenericCollections } from "@/lib/content";
import type { CollectionDefinition } from "@/lib/content-schema";
import { siteConfig } from "@/lib/site-config";
import { GitHubAuthStatus } from "./github-auth-status";

export async function SiteHeader() {
  const collections = await getGenericCollections();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-background/50 backdrop-blur-[2px] dark:border-zinc-800">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none">
          <Link href="/" className="flex min-w-0 items-center space-x-2">
            <span className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50">{siteConfig.name}</span>
          </Link>
        </div>
        <nav
          className="hidden min-w-0 flex-1 items-center gap-5 overflow-x-auto whitespace-nowrap lg:flex"
          aria-label="Content types"
        >
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/${collection.route}`}
              className="shrink-0 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              {collection.pluralLabel}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <MobileCollectionsMenu collections={collections} />
          <GitHubAuthStatus />
        </div>
      </div>
    </header>
  );
}

function MobileCollectionsMenu({ collections }: { collections: CollectionDefinition[] }) {
  return (
    <div className="lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label="Abrir menú de contenido">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[min(18rem,calc(100vw-2rem))]">
          <DropdownMenuLabel>Contenido</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {collections.map((collection) => (
            <DropdownMenuItem key={collection.id} asChild>
              <Link href={`/${collection.route}`} className="flex w-full items-center justify-between gap-4">
                <span>{collection.pluralLabel}</span>
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">/{collection.route}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
