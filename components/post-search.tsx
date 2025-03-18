"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type Author = {
  id: string
  name: string
  profile_picture?: string | null
}

type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  category?: string | null
  cover_image?: string | null
  created_at: string
  author?: Author | null
}

interface PostSearchProps {
  posts: Post[]
}

export function PostSearch({ posts }: PostSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.author && post.author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Posts</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              {post.cover_image && (
                <div className="relative aspect-video w-full">
                  <Image src={post.cover_image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.created_at).toLocaleDateString()}
                  {post.author && ` • By ${post.author.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{post.excerpt || post.content.substring(0, 150)}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/posts/${post.slug}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Read More
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No posts found matching your search</p>
          </div>
        )}
      </div>
    </div>
  )
}

