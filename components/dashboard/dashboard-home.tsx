"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Author, PostWithAuthor } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Plus, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

interface DashboardHomeProps {
  user: User;
}

export default function DashboardHome({ user }: DashboardHomeProps) {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all published authors
        const { data: authorsData } = await supabase.from("authors").select("*").eq("published", true).order("name");

        setAuthors(authorsData || []);

        // Fetch all posts
        const { data: postsData } = await supabase
          .from("posts")
          .select("*, authors(*)")
          .order("created_at", { ascending: false });

        setPosts(postsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Posts</h2>
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
                          {post.authors && ` • By ${post.authors.name}`}
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

        <TabsContent value="authors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Authors</h2>
            <Link href="/dashboard/profile/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Author
              </Button>
            </Link>
          </div>

          {authors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {authors.map((author) => (
                <Card key={author.id}>
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
                  <CardContent>
                    <p className="line-clamp-3">{author.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/authors/${author.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/dashboard/profile/edit/${author.id}`}>
                      <Button size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Authors Yet</CardTitle>
                <CardDescription>Create your first author to get started</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/dashboard/profile/new">
                  <Button>Create Author</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
