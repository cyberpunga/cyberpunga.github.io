import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our blog posts
export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id?: string;
  cover_image?: string;
};

// Helper functions for blog posts
export async function getPosts() {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;

    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return data as Post[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPublishedPosts() {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching published posts:", error);
      return [];
    }

    return data as Post[];
  } catch (error) {
    console.error("Error fetching published posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).single();

    if (error) {
      console.error("Error fetching post by slug:", error);
      return null;
    }

    return data as Post;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

export async function createPost(post: Omit<Post, "id" | "created_at" | "updated_at" | "author_id">) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          ...post,
          author_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error creating post:", error);
      return null;
    }

    return data[0] as Post;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}

export async function updatePost(id: string, post: Partial<Post>) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("posts")
      .update({
        ...post,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("author_id", userId) // Ensure users can only update their own posts
      .select();

    if (error) {
      console.error("Error updating post:", error);
      return null;
    }

    return data[0] as Post;
  } catch (error) {
    console.error("Error updating post:", error);
    return null;
  }
}

export async function deletePost(id: string) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("posts").delete().eq("id", id).eq("author_id", userId); // Ensure users can only delete their own posts

    if (error) {
      console.error("Error deleting post:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
}
