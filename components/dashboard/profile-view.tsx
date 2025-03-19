"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Author } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileViewProps {
  user: User;
}

export default function ProfileView({ user }: ProfileViewProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get author profile
        const { data: authorData, error } = await supabase.from("authors").select("*").eq("user_id", user.id).single();

        if (error) throw error;

        setAuthor(authorData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

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
        <h2 className="text-xl font-semibold">Your Profile</h2>
        <Link href={`/dashboard/profile/edit/${author.id}`}>
          <Button>Edit Profile</Button>
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
            <p className="text-sm text-muted-foreground">
              {author.expertise && author.expertise.length > 0 ? author.expertise.join(", ") : "No expertise listed"}
            </p>
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

          {author.url && (
            <div>
              <h3 className="font-medium mb-1">Website</h3>
              <a href={author.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {author.url}
              </a>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-1">Status</h3>
            <p>{author.published ? "Published" : "Not Published"}</p>
          </div>
        </CardContent>
        <CardFooter>
          {author.published && (
            <Link href={`/authors/${author.slug}`} target="_blank">
              <Button variant="outline">View Public Profile</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
