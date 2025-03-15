"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, PenSquare, Database, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Check if the current route is the login page
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    // If not loading and not authenticated and not on login page, redirect to login
    if (!isLoading && !user && !isLoginPage) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router, isLoginPage])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not authenticated and not on login page, don't render anything
  // (useEffect will redirect to login)
  if (!user && !isLoginPage) {
    return null
  }

  // For login page, just render the children (the login form)
  if (isLoginPage) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al sitio
              </Link>
            </Button>
            <div className="text-xl">cyberpun.ga Admin</div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/posts" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Posts
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/editor" className="flex items-center gap-2">
                  <PenSquare className="h-4 w-4" />
                  Editor
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/setup" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Setup
                </Link>
              </Button>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:inline-block">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Cerrar sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

