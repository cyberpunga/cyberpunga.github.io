import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { renderMarkdown } from "@/lib/markdown"
import { downloadImage, ensureImageDirectory } from "@/lib/image-processor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

// Check if a URL is from Supabase Storage
function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return (
      parsedUrl.hostname.includes("supabase.co") &&
      (parsedUrl.pathname.includes("/storage/v1/") || parsedUrl.pathname.includes("/object/"))
    )
  } catch (e) {
    return false
  }
}

// Generate static params for all published posts
export async function generateStaticParams() {
  try {
    const { data: posts } = await supabase.from("posts").select("slug").eq("published", true)

    return (
      posts?.map((post) => ({
        slug: post.slug,
      })) || []
    )
  } catch (error) {
    console.error("Error generating static params for posts:", error)
    // Return a dummy value to satisfy the static export requirement
    return [{ slug: "placeholder" }]
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: posts } = await supabase
    .from("posts")
    .select("title, excerpt, cover_image")
    .eq("slug", params.slug)
    .eq("published", true)

  const post = posts?.[0]

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found",
    }
  }

  // Process cover image if it exists
  let coverImage = post.cover_image
  if (coverImage && typeof window === "undefined") {
    ensureImageDirectory()
    // Force download for Supabase Storage URLs
    if (isSupabaseStorageUrl(coverImage)) {
      console.log(`Processing Supabase Storage URL: ${coverImage}`)
      coverImage = (await downloadImage(coverImage)) || coverImage
    }
  }

  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} on Cyberpunga`,
    openGraph: coverImage
      ? {
          images: [{ url: coverImage }],
        }
      : undefined,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  // Fetch the post
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)

  if (postsError || !posts || posts.length === 0) {
    notFound()
  }

  const post = posts[0]

  // Process cover image if it exists
  let coverImage = post.cover_image
  if (coverImage && typeof window === "undefined") {
    ensureImageDirectory()
    // Force download for Supabase Storage URLs
    if (isSupabaseStorageUrl(coverImage)) {
      console.log(`Processing Supabase Storage URL: ${coverImage}`)
      coverImage = (await downloadImage(coverImage)) || coverImage
    }
  }

  // Fetch the author
  let author = null
  if (post.author_id) {
    const { data: authors } = await supabase.from("authors").select("*").eq("id", post.author_id)

    if (authors && authors.length > 0) {
      author = authors[0]

      // Process author profile picture if it exists
      if (author.profile_picture && typeof window === "undefined") {
        // Force download for Supabase Storage URLs
        if (isSupabaseStorageUrl(author.profile_picture)) {
          console.log(`Processing Supabase Storage URL: ${author.profile_picture}`)
          author.profile_picture = (await downloadImage(author.profile_picture)) || author.profile_picture
        }
      }
    }
  }

  // Render markdown to HTML at build time
  const contentHtml = await renderMarkdown(post.content)

  return (
    <article className="max-w-3xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-orbitron">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString()}</time>
          </div>

          {post.category && (
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 text-xs rounded-full bg-muted">{post.category}</span>
            </div>
          )}
        </div>
      </div>

      {coverImage && (
        <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
          <Image src={coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {author && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={author.profile_picture || undefined} alt={author.name} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">By {author.name}</p>
                {author.description && <p className="text-sm text-muted-foreground">{author.description}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  )
}

