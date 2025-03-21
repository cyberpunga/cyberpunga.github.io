"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Post, Author } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PostEditorProps {
  user: User;
  postId: string;
}

export default function PostEditor({ user, postId }: PostEditorProps) {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("write");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [authorId, setAuthorId] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // Get all published authors
        const { data: authorsData, error: authorsError } = await supabase
          .from("authors")
          .select("*")
          .eq("published", true)
          .order("name");

        if (authorsError) throw authorsError;

        setAuthors(authorsData || []);

        // Get post data
        const { data: postData, error: postError } = await supabase.from("posts").select("*").eq("id", postId).single();

        if (postError) throw postError;

        setPost(postData);
        setTitle(postData.title);
        setSlug(postData.slug);
        setContent(postData.content);
        setExcerpt(postData.excerpt || "");
        setCategory(postData.category || "");
        setCoverImage(postData.cover_image || "");
        setPublished(postData.published);
        setAuthorId(postData.author_id || "");
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, postId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!post) return;

    if (!authorId) {
      setError("Please select an author for this post");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          title,
          slug,
          content,
          excerpt,
          category,
          cover_image: coverImage,
          published,
          author_id: authorId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (error) throw error;

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error updating post:", error);
      setError(error.message || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Edit your post. You can use Markdown syntax.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              <p className="text-xs text-muted-foreground">This will be used in your post URL: /posts/{slug}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown) *</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-0">
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content here using Markdown..."
                    rows={15}
                    required
                    className="font-mono"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="border rounded-md p-4 min-h-[300px] overflow-auto">
                    <MarkdownRenderer content={content} />
                  </div>
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                You can use Markdown syntax. Supports GitHub Flavored Markdown, code highlighting, tables, and more.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A brief summary of your post"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Technology, Art, Philosophy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="published" checked={published} onCheckedChange={setPublished} />
              <Label htmlFor="published">Publish post</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
