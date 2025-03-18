import type React from "react"
import "./globals.css"
import "./prism-theme.css"
import { Orbitron, Dosis } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

const dosis = Dosis({
  subsets: ["latin"],
  variable: "--font-dosis",
})

export const metadata = {
  title: "Cyberpunga Collective",
  description: "Third world low budget cyberpunk collective",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${dosis.variable} font-dosis`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'