import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { downloadImage, ensureImageDirectory } from "@/lib/image-processor"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function Home() {
  // Ensure image directory exists (only in Node.js environment)
  if (typeof window === "undefined") {
    ensureImageDirectory()
  }

  // Fetch latest posts
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(6)

  // Process posts and fetch authors
  const posts = await Promise.all(
    (postsData || []).map(async (post) => {
      // Process cover image
      if (post.cover_image && typeof window === "undefined") {
        post.cover_image = (await downloadImage(post.cover_image)) || post.cover_image
      }

      // Fetch author
      let author = null
      if (post.author_id) {
        const { data: authorData } = await supabase.from("authors").select("*").eq("id", post.author_id).single()

        if (authorData) {
          // Process author profile picture
          if (authorData.profile_picture && typeof window === "undefined") {
            authorData.profile_picture = (await downloadImage(authorData.profile_picture)) || authorData.profile_picture
          }

          author = authorData
        }
      }

      return { ...post, author }
    }),
  )

  return (
    <div className="space-y-12">
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl font-orbitron">
                CYBERPUNGA
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Third world low budget cyberpunk collective
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/posts">
                <Button>Explore Posts</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline">About Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Latest Posts</h2>
              <p className="text-muted-foreground">Explore the latest content from our collective</p>
            </div>
            <Link href="/posts">
              <Button variant="outline">View All Posts</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {posts.length > 0 ? (
              posts.map((post) => (
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
                    <CardDescription>
                      {new Date(post.created_at).toLocaleDateString()}
                      {post.author && ` • By ${post.author.name}`}
                    </CardDescription>
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
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No posts found</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

