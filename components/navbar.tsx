"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold font-orbitron tracking-wider">
            CYBERPUNGA
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className={pathname === "/" ? "font-bold" : ""}>
              Home
            </Link>
            <Link href="/posts" className={pathname.startsWith("/posts") ? "font-bold" : ""}>
              Posts
            </Link>
            <Link href="/authors" className={pathname.startsWith("/authors") ? "font-bold" : ""}>
              Authors
            </Link>
            <Link href="/about" className={pathname === "/about" ? "font-bold" : ""}>
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {!loading &&
            (user ? (
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            ))}
        </div>
      </div>
    </header>
  )
}

