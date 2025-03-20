"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface NewProfileProps {
  user: User;
}

export default function NewProfile({ user }: NewProfileProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [url, setUrl] = useState("");
  const [expertise, setExpertise] = useState("");
  const [published, setPublished] = useState(true);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(generateSlug(newName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("authors")
        .insert({
          name,
          slug,
          description,
          bio,
          profile_picture: profilePicture,
          url,
          expertise: expertise ? expertise.split(",").map((item) => item.trim()) : [],
          published,
          user_id: user.id,
        })
        .select();

      if (error) throw error;

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error creating author:", error);
      setError(error.message || "Failed to create author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Author</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Author Information</CardTitle>
            <CardDescription>Create a new author profile for your posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={name} onChange={handleNameChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              <p className="text-xs text-muted-foreground">
                This will be used in the author profile URL: /authors/{slug}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of this author"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="The author's detailed biography"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePicture">Profile Picture URL</Label>
              <Input
                id="profilePicture"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise (comma separated)</Label>
              <Input
                id="expertise"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g. Programming, Design, Writing"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="published" checked={published} onCheckedChange={setPublished} />
              <Label htmlFor="published">Make author public</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Author"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
