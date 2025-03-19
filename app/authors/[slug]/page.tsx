import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { downloadImage, ensureImageDirectory } from "@/lib/image-processor"
import { renderMarkdown } from "@/lib/markdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Globe } from "lucide-react"

export async function generateStaticParams() {
  try {
    const { data: authors } = await supabase.from("authors").select("slug").eq("published", true)

    return (
      authors?.map((author) => ({
        slug: author.slug,
      })) || []
    )
  } catch (error) {
    console.error("Error generating static params for authors:", error)
    // Return a dummy value to satisfy the static export requirement
    return [{ slug: "placeholder" }]
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: authors } = await supabase
    .from("authors")
    .select("name, description, profile_picture")
    .eq("slug", params.slug)
    .eq("published", true)

  const author = authors?.[0]

  if (!author) {
    return {
      title: "Author Not Found",
      description: "The requested author could not be found",
    }
  }

  return {
    title: `${author.name} - Cyberpunga Collective`,
    description: author.description || `Author profile for ${author.name}`,
    openGraph: author.profile_picture
      ? {
          images: [{ url: author.profile_picture }],
        }
      : undefined,
  }
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  // Ensure image directory exists (only in Node.js environment)
  if (typeof window === "undefined") {
    ensureImageDirectory()
  }

  // Fetch the author
  const { data: authors, error: authorsError } = await supabase
    .from("authors")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)

  if (authorsError || !authors || authors.length === 0) {
    notFound()
  }

  const author = authors[0]

  // Process profile picture if it exists
  if (author.profile_picture && typeof window === "undefined") {
    author.profile_picture = (await downloadImage(author.profile_picture)) || author.profile_picture
  }

  // Process bio if it exists
  let bioHtml = null
  if (author.bio) {
    bioHtml = await renderMarkdown(author.bio)
  }

  // Fetch author's posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", author.id)
    .eq("published", true)
    .order("created_at", { ascending: false })

  // Process post cover images
  const processedPosts = await Promise.all(
    (posts || []).map(async (post) => {
      if (post.cover_image && typeof window === "undefined") {
        post.cover_image = (await downloadImage(post.cover_image)) || post.cover_image
      }
      return post
    }),
  )

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row gap-8">
        <Avatar className="h-32 w-32">
          <AvatarImage src={author.profile_picture || undefined} alt={author.name} />
          <AvatarFallback className="text-4xl">{author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{author.name}</h1>
            {author.expertise && author.expertise.length > 0 && (
              <p className="text-muted-foreground">{author.expertise.join(", ")}</p>
            )}
          </div>

          {author.description && <p className="max-w-xl">{author.description}</p>}

          <div className="flex flex-wrap gap-4">
            {author.url && (
              <a
                href={author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm"
              >
                <Globe className="h-4 w-4" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {author.social_links &&
              typeof author.social_links === "object" &&
              Object.entries(author.social_links as Record<string, string>).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm"
                >
                  {platform}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
          </div>
        </div>
      </div>

      {bioHtml && <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: bioHtml }} />}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Posts by {author.name}</h2>

        {processedPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {processedPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                {post.cover_image && (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={post.cover_image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>{new Date(post.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{post.excerpt || post.content.substring(0, 150)}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/posts/${post.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Read More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No posts found</p>
        )}
      </div>
    </div>
  )
}

