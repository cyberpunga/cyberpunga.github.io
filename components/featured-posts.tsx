"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function FeaturedPosts() {
  // Sample data for featured posts
  const featuredPosts = [
    {
      id: "la-ciudad-y-sus-fantasmas-digitales",
      title: "La ciudad y sus fantasmas digitales",
      excerpt: "Explorando la intersección entre el espacio urbano y las realidades virtuales que lo habitan.",
      category: "Ensayo",
      date: "15 Mar 2025",
      image: "/placeholder.svg?height=400&width=600",
      author: "Alex Mercer",
      authorImage: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "resistencia-digital-en-tiempos-de-vigilancia",
      title: "Resistencia digital en tiempos de vigilancia",
      excerpt: "Estrategias y tácticas para mantener nuestra autonomía en la era de la vigilancia masiva.",
      category: "Análisis",
      date: "10 Mar 2025",
      image: "/placeholder.svg?height=400&width=600",
      author: "Sasha Kim",
      authorImage: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "arte-glitch-como-forma-de-protesta",
      title: "Arte glitch como forma de protesta",
      excerpt: "Cómo los artistas utilizan errores y distorsiones digitales para cuestionar sistemas establecidos.",
      category: "Entrevista",
      date: "5 Mar 2025",
      image: "/placeholder.svg?height=400&width=600",
      author: "Jordan Rivera",
      authorImage: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-heading relative pl-4 tracking-wide accent-line">Artículos Destacados</h2>
        <Button asChild variant="link" className="text-primary hover:text-primary/80 gap-2 group">
          <Link href="/posts">
            Ver Todos
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredPosts.map((post) => (
          <Card
            key={post.id}
            className="bg-card border-border overflow-hidden hover:border-primary transition-all duration-300"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="object-cover transition-transform hover:scale-105 duration-500"
                fill
              />
              <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-xs px-2 py-1 uppercase tracking-wider">
                {post.category}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={post.authorImage || "/placeholder.svg"}
                  alt={post.author}
                  className="rounded-full object-cover"
                  width={32}
                  height={32}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{post.author}</span>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
              </div>
              <Link href={`/posts/${post.id}`}>
                <h3 className="text-xl font-heading mb-2 hover:text-primary transition-colors tracking-wide">
                  {post.title}
                </h3>
              </Link>
              <p className="text-muted-foreground text-base mb-4 font-body">{post.excerpt}</p>
              <Link
                href={`/posts/${post.id}`}
                className="text-primary text-base hover:text-primary/80 inline-flex items-center gap-1 group highlight-link font-body"
              >
                Leer Más
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

