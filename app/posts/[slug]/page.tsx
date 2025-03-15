import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPostBySlug, getPublishedPosts } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug((await params).slug)

  if (!post) {
    return {
      title: "Artículo no encontrado | cyberpun.ga",
    }
  }

  return {
    title: `${post.title} | cyberpun.ga`,
    description: post.excerpt || post.title,
  }
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug((await params).slug)

  if (!post || !post.published) {
    notFound()
  }

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Calculate read time (approx 200 words per minute)
  const calculateReadTime = (content: string) => {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min`
  }

  // Custom renderer for images in Markdown
  const MarkdownComponents = {
    img: (props: any) => (
      <div className="my-8 relative">
        <img
          src={props.src || "/placeholder.svg"}
          alt={props.alt || "Imagen"}
          className="rounded-md w-full max-w-3xl mx-auto"
        />
        {props.alt && props.alt !== "Imagen" && (
          <p className="text-center text-sm text-muted-foreground mt-2 italic">{props.alt}</p>
        )}
      </div>
    ),
  }

  return (
    <article className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden border-b border-border">
        <Image
          src={post.cover_image || "/placeholder.svg?height=600&width=1200"}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8">
          <div className="container mx-auto">
            <Button asChild variant="ghost" className="mb-4 text-muted-foreground hover:text-primary">
              <Link href="/posts" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a artículos
              </Link>
            </Button>
            <div className="inline-block mb-4 px-3 py-1 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-mono">
              {post.category || "Artículo"}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground mb-4 max-w-4xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>Admin</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{calculateReadTime(post.content)} de lectura</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="prose dark:prose-invert max-w-none prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-primary prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-img:rounded-md">
            <ReactMarkdown components={MarkdownComponents}>{post.content}</ReactMarkdown>
          </div>

          {/* Author bio */}
          <div className="mt-16 border-t border-border pt-8">
            <div className="flex items-start gap-4">
              <Image
                src="/placeholder.svg?height=80&width=80"
                alt="Admin"
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold mb-2 font-heading">Admin</h3>
                <p className="text-muted-foreground font-body">
                  Escritor y analista especializado en cultura digital, tecnología y sus implicaciones sociales.
                  Colaborador habitual en cyberpun.ga y otros medios de análisis crítico.
                </p>
              </div>
            </div>
          </div>

          {/* Share and navigation */}
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border pt-8">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono">Compartir:</span>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-facebook"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-link"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="sr-only">Copiar enlace</span>
              </Button>
            </div>
            <div className="flex gap-4">
              <Button asChild variant="outline" className="border-border hover:border-primary hover:text-primary">
                <Link href="/posts" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Más artículos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

