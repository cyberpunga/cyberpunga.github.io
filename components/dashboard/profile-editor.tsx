"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Author } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProfileEditorProps {
  user: User;
  profileId: string;
}

export default function ProfileEditor({ user, profileId }: ProfileEditorProps) {
  const router = useRouter();
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [url, setUrl] = useState("");
  const [expertise, setExpertise] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get author profile
        const { data: authorData, error: authorError } = await supabase
          .from("authors")
          .select("*")
          .eq("id", profileId)
          .single();

        if (authorError) throw authorError;

        // Check if user owns this profile
        if (authorData.user_id !== user.id) {
          router.push("/dashboard");
          return;
        }

        setAuthor(authorData);
        setName(authorData.name);
        setSlug(authorData.slug);
        setDescription(authorData.description || "");
        setBio(authorData.bio || "");
        setProfilePicture(authorData.profile_picture || "");
        setUrl(authorData.url || "");
        setExpertise(authorData.expertise ? authorData.expertise.join(", ") : "");
        setPublished(authorData.published);
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, profileId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!author) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("authors")
        .update({
          name,
          slug,
          description,
          bio,
          profile_picture: profilePicture,
          url,
          expertise: expertise ? expertise.split(",").map((item) => item.trim()) : [],
          published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", author.id);

      if (error) throw error;

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your author profile</CardDescription>
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
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              <p className="text-xs text-muted-foreground">This will be used in your profile URL: /authors/{slug}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of yourself"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Your detailed biography"
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
              <Label htmlFor="published">Make profile public</Label>
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
