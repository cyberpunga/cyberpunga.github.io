"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPosts, deletePost, type Post } from "@/lib/supabase"
import { Edit, Trash2, Plus, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      const postsData = await getPosts()
      setPosts(postsData)
    } catch (error) {
      console.error("Error loading posts:", error)
      toast.error("Error al cargar los posts")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
      setIsDeleting(id)
      try {
        const success = await deletePost(id)
        if (success) {
          setPosts(posts.filter((post) => post.id !== id))
          toast.success("Post eliminado correctamente")
        } else {
          toast.error("Error al eliminar el post")
        }
      } catch (error) {
        toast.error("Error al eliminar el post")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading">Administrar Posts</h1>
        <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground">
          <Link href="/admin/editor">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Post
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">No hay posts todavía</p>
            <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground">
              <Link href="/admin/editor">
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer post
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className={`${post.published ? "border-green-500/20" : "border-yellow-500/20"}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-heading">{post.title}</h3>
                      {post.published ? (
                        <span className="px-2 py-1 text-xs bg-green-500/10 text-green-500 rounded">Publicado</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-500 rounded">Borrador</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="inline-block mr-4">Slug: {post.slug}</span>
                      <span className="inline-block mr-4">Categoría: {post.category || "Sin categoría"}</span>
                      <span>Actualizado: {formatDate(post.updated_at)}</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{post.excerpt || "Sin extracto"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.published && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/posts/${post.slug}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/editor?slug=${post.slug}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={isDeleting === post.id}
                    >
                      {isDeleting === post.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

