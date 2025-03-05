import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Navbar } from "@/components/nav-bar";

const spaceMono = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cyberpunga",
  description: "si estás leyendo esto, significa que sigues con vida y nos alegra muchísimo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar>
            <ModeToggle />
          </Navbar>
          <main className="prose dark:prose-invert lg:prose-xl mx-auto font-[family-name:var(--font-space-grotesk)] px-4">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
