import { supabase } from "@/lib/supabase"
import { downloadImage, ensureImageDirectory } from "@/lib/image-processor"
import { PostSearch } from "@/components/post-search"

export default async function Posts() {
  // Ensure image directory exists (only in Node.js environment)
  if (typeof window === "undefined") {
    ensureImageDirectory()
  }

  // Fetch all published posts
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })

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

  return <PostSearch posts={posts} />
}

