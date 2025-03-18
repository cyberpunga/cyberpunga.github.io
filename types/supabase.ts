export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          bio: string | null
          profile_picture: string | null
          url: string | null
          social_links: Json | null
          expertise: string[] | null
          language: string
          user_id: string
          created_at: string
          updated_at: string
          published: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          bio?: string | null
          profile_picture?: string | null
          url?: string | null
          social_links?: Json | null
          expertise?: string[] | null
          language?: string
          user_id: string
          created_at?: string
          updated_at?: string
          published?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          bio?: string | null
          profile_picture?: string | null
          url?: string | null
          social_links?: Json | null
          expertise?: string[] | null
          language?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          published?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          category: string | null
          published: boolean
          cover_image: string | null
          author_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          category?: string | null
          published?: boolean
          cover_image?: string | null
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          category?: string | null
          published?: boolean
          cover_image?: string | null
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
  storage: {
    Buckets: {
      [_ in "blog-assets"]: {
        Row: {
          id: string
          name: string
        }
      }
    }
  }
  auth: {
    Users: {
      Row: {
        id: string
        email: string
      }
    }
  }
}

export type Author = Database["public"]["Tables"]["authors"]["Row"]
export type Post = Database["public"]["Tables"]["posts"]["Row"]

