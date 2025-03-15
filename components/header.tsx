"use client"

import Link from "next/link"
import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-heading tracking-wide relative">
              <span>cyber</span>
              <span className="text-primary">pun</span>
              <span>.</span>
              <span className="text-primary">ga</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/posts"
                className="text-sm uppercase tracking-wide hover:text-primary transition-colors highlight-link font-body"
              >
                Artículos
              </Link>
              <Link
                href="/about"
                className="text-sm uppercase tracking-wide hover:text-primary transition-colors highlight-link font-body"
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/contact"
                className="text-sm uppercase tracking-wide hover:text-primary transition-colors highlight-link font-body"
              >
                Contacto
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menú</span>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-border mt-4">
            <nav className="flex flex-col gap-2">
              <Link
                href="/posts"
                className="px-2 py-2 text-sm hover:bg-muted rounded font-body"
                onClick={() => setIsMenuOpen(false)}
              >
                Artículos
              </Link>
              <Link
                href="/about"
                className="px-2 py-2 text-sm hover:bg-muted rounded font-body"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/contact"
                className="px-2 py-2 text-sm hover:bg-muted rounded font-body"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

