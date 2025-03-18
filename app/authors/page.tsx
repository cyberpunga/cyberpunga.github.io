import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { downloadImage, ensureImageDirectory } from "@/lib/image-processor"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function Authors() {
  // Ensure image directory exists (only in Node.js environment)
  if (typeof window === "undefined") {
    ensureImageDirectory()
  }

  // Fetch all published authors
  const { data } = await supabase.from("authors").select("*").eq("published", true).order("name")

  // Process author profile pictures
  const authors = await Promise.all(
    (data || []).map(async (author) => {
      if (author.profile_picture && typeof window === "undefined") {
        author.profile_picture = (await downloadImage(author.profile_picture)) || author.profile_picture
      }
      return author
    }),
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Authors</h1>
        <p className="text-muted-foreground">Meet the members of our collective</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {authors.length > 0 ? (
          authors.map((author) => (
            <Card key={author.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={author.profile_picture || undefined} alt={author.name} />
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{author.name}</CardTitle>
                  {author.expertise && author.expertise.length > 0 && (
                    <CardDescription>{author.expertise.join(", ")}</CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{author.description}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/authors/${author.slug}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No authors found</p>
          </div>
        )}
      </div>
    </div>
  )
}

