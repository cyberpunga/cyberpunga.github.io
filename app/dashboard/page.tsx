"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Author, Post } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [author, setAuthor] = useState<Author | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      setUser(session.user)

      try {
        // Check if user has an author profile
        const { data: authorData } = await supabase.from("authors").select("*").eq("user_id", session.user.id).single()

        setAuthor(authorData)

        if (authorData) {
          // Fetch user's posts
          const { data: postsData } = await supabase
            .from("posts")
            .select("*")
            .eq("author_id", authorData.id)
            .order("created_at", { ascending: false })

          setPosts(postsData || [])
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId)

      if (error) throw error

      setPosts(posts.filter((post) => post.id !== postId))
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {!author ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Author Profile</CardTitle>
            <CardDescription>You need to create an author profile before you can start posting</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/profile/new">
              <Button>Create Profile</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Posts</h2>
              <Link href="/dashboard/posts/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </Link>
            </div>

            {posts.length > 0 ? (
              <div className="grid gap-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription>
                            {new Date(post.created_at).toLocaleDateString()}
                            {post.published ? " • Published" : " • Draft"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/posts/edit/${post.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your post.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2">{post.excerpt || post.content.substring(0, 150)}</p>
                    </CardContent>
                    <CardFooter>
                      <div className="flex gap-2">
                        {post.published && (
                          <Link href={`/posts/${post.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              View Post
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Posts Yet</CardTitle>
                  <CardDescription>Create your first post to get started</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/dashboard/posts/new">
                    <Button>Create Post</Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Profile</h2>
              <Link href={`/dashboard/profile/edit/${author.id}`}>
                <Button size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={author.profile_picture || undefined} alt={author.name} />
                  <AvatarFallback className="text-xl">{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{author.name}</CardTitle>
                  {author.expertise && author.expertise.length > 0 && (
                    <CardDescription>{author.expertise.join(", ")}</CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {author.description && (
                  <div>
                    <h3 className="font-medium mb-1">Description</h3>
                    <p>{author.description}</p>
                  </div>
                )}

                {author.bio && (
                  <div>
                    <h3 className="font-medium mb-1">Bio</h3>
                    <div className="prose dark:prose-invert">
                      {author.bio.split("\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-1">Status</h3>
                  <p>{author.published ? "Published" : "Not Published"}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/authors/${author.slug}`} target="_blank">
                  <Button variant="outline">View Public Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

