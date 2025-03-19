"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Post, Author } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

interface PostsListProps {
  user: User;
}

export default function PostsList({ user }: PostsListProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get author profile
        const { data: authorData, error: authorError } = await supabase
          .from("authors")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (authorError) throw authorError;

        setAuthor(authorData);

        // Get posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("author_id", authorData.id)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;

        setPosts(postsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

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
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!author) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Your Author Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You need to create an author profile before you can start posting.</p>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/profile/new">
            <Button>Create Profile</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Posts</h2>
        <Link href="/dashboard/posts/new">
          <Button>
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
    </div>
  );
}
