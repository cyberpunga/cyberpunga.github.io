import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeaturedPosts } from "@/components/featured-posts"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-background z-0"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-heading leading-tight mb-6 text-foreground tracking-wide">
              cyber<span className="text-primary">pun</span>.<span className="text-primary">ga</span>
            </h1>
            <p className="text-2xl text-muted-foreground mb-8 font-body">
              si estás leyendo esto, significa que sigues con vida y nos alegra muchísimo
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground border-none">
                <Link href="/posts">Ver Artículos</Link>
              </Button>
              <Button asChild variant="outline" className="border-border hover:border-primary hover:text-primary">
                <Link href="/about">Sobre Nosotros</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-border"></div>
      </section>

      {/* Featured Posts */}
      <FeaturedPosts />

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-muted/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-heading mb-6 text-foreground tracking-wide">Únete a la resistencia digital</h2>
            <p className="text-xl text-muted-foreground mb-8 font-body">
              En un mundo donde la tecnología nos consume, nosotros la hackeamos para crear arte y comunidad. Explora
              nuestros artículos, únete a nuestras discusiones y forma parte de algo más grande.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground border-none">
              <Link href="/about">Descubre más</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

