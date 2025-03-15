import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getPublishedPosts } from "@/lib/supabase"

export const metadata = {
  title: "Artículos | cyberpun.ga",
  description: "Explora todos nuestros artículos sobre ciberpunk, tecnología y resistencia digital",
}

// Update the PostsPage function to handle errors gracefully
export default async function PostsPage() {
  const posts = await getPublishedPosts()

  // Categories for filter (extract unique categories from posts)
  const categories = ["Todos", ...Array.from(new Set(posts.map((post) => post.category || "Sin categoría")))]

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
        <h1 className="text-5xl font-heading mb-4">Artículos</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Explorando la intersección entre tecnología, cultura y resistencia en la era digital. Aquí encontrarás
          ensayos, entrevistas y análisis sobre el presente y futuro de nuestra relación con lo digital.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === "Todos" ? "default" : "outline"}
            size="sm"
            className={
              category === "Todos"
                ? "bg-primary hover:bg-primary/80 text-primary-foreground"
                : "border-border hover:border-primary hover:text-primary"
            }
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No hay artículos publicados todavía.</p>
          <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="bg-card border-border overflow-hidden hover:border-primary transition-all duration-300"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={post.cover_image || "/placeholder.svg?height=400&width=600"}
                  alt={post.title}
                  className="object-cover transition-transform hover:scale-105 duration-500"
                  fill
                />
                <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-xs px-2 py-1 uppercase tracking-wider">
                  {post.category || "Artículo"}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="Admin"
                    className="rounded-full object-cover"
                    width={32}
                    height={32}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                  </div>
                </div>
                <Link href={`/posts/${post.slug}`}>
                  <h3 className="text-xl font-heading mb-2 hover:text-primary transition-colors">{post.title}</h3>
                </Link>
                <p className="text-muted-foreground text-base mb-4">{post.excerpt || post.title}</p>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-primary text-base hover:text-primary/80 inline-flex items-center gap-1 group highlight-link"
                >
                  Leer Más
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

