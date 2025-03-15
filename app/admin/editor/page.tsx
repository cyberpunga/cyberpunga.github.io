"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye, Code, FileText, Loader2, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPost, updatePost, getPostBySlug } from "@/lib/supabase"
import { ImageUploader } from "@/components/image-uploader"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import slugify from "slugify"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function EditorPage() {
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [excerpt, setExcerpt] = useState<string>("")
  const [category, setCategory] = useState<string>("Ensayo")
  const [slug, setSlug] = useState<string>("")
  const [published, setPublished] = useState<boolean>(false)
  const [postId, setPostId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split")
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSlug = searchParams.get("slug")
  const { user } = useAuth()

  useEffect(() => {
    // Generate slug from title
    if (title && !editSlug) {
      setSlug(slugify(title, { lower: true, strict: true }))
    }
  }, [title, editSlug])

  useEffect(() => {
    // Load post if editing
    if (editSlug) {
      setIsLoading(true)
      getPostBySlug(editSlug).then((post) => {
        if (post) {
          // Only allow editing if the post belongs to the current user
          if (post.author_id === user?.id) {
            setTitle(post.title)
            setContent(post.content)
            setExcerpt(post.excerpt || "")
            setCategory(post.category || "Ensayo")
            setSlug(post.slug)
            setPublished(post.published)
            setPostId(post.id)
          } else {
            toast.error("No tienes permiso para editar este post")
            router.push("/admin/posts")
          }
        }
        setIsLoading(false)
      })
    }
  }, [editSlug, user, router])

  const handleSave = async () => {
    if (!title || !content || !slug) {
      toast.error("Por favor completa al menos el título, contenido y slug")
      return
    }

    setIsSaving(true)
    try {
      if (postId) {
        // Update existing post
        await updatePost(postId, {
          title,
          content,
          excerpt,
          category,
          slug,
          published,
        })
        toast.success("Post actualizado correctamente")
      } else {
        // Create new post
        await createPost({
          title,
          content,
          excerpt,
          category,
          slug,
          published,
        })
        toast.success("Post creado correctamente")
      }
      router.push("/admin/posts")
    } catch (error) {
      console.error("Error saving post:", error)
      toast.error("Error al guardar el post")
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUploaded = (imageUrl: string) => {
    // Insert the image markdown at the cursor position or at the end
    const imageMarkdown = `![Imagen](${imageUrl})\n\n`

    const textarea = document.querySelector("textarea")
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      setContent(content.substring(0, start) + imageMarkdown + content.substring(end))

      // Close the dialog
      setIsImageDialogOpen(false)

      // Focus back on textarea and set cursor position after the inserted image
      setTimeout(() => {
        textarea.focus()
        const newPosition = start + imageMarkdown.length
        textarea.setSelectionRange(newPosition, newPosition)
      }, 100)
    } else {
      // If we can't find the textarea, just append to the end
      setContent(content + imageMarkdown)
      setIsImageDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Cargando post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading">{postId ? "Editar" : "Nuevo"} Post</h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex">
            <Button
              variant={viewMode === "editor" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("editor")}
              className="rounded-r-none"
            >
              <Code className="h-4 w-4 mr-2" />
              Editor
            </Button>
            <Button
              variant={viewMode === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("split")}
              className="rounded-none border-x-0"
            >
              <FileText className="h-4 w-4 mr-2" />
              Split
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="rounded-l-none"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
          <Button
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar
          </Button>
        </div>
      </div>

      {/* Post metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
            placeholder="Título del post"
          />

          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mb-4"
            placeholder="url-del-post"
          />
        </div>

        <div>
          <Label htmlFor="excerpt">Extracto</Label>
          <Input
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="mb-4"
            placeholder="Breve descripción del post"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md"
              >
                <option value="Ensayo">Ensayo</option>
                <option value="Análisis">Análisis</option>
                <option value="Entrevista">Entrevista</option>
                <option value="Reportaje">Reportaje</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Publicado</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view mode selector */}
      <div className="sm:hidden mb-4">
        <Tabs defaultValue="split" onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="split">Split</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className={`grid ${viewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
        {/* Editor */}
        {(viewMode === "editor" || viewMode === "split") && (
          <div className="h-[calc(100vh-350px)] flex flex-col">
            <div className="bg-muted/30 px-4 py-2 border border-border rounded-t-md flex items-center justify-between">
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Markdown</span>
              </div>
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">Añadir imagen</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Subir imagen</DialogTitle>
                  </DialogHeader>
                  <ImageUploader onImageUploaded={handleImageUploaded} />
                </DialogContent>
              </Dialog>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 p-4 bg-card border border-t-0 border-border rounded-b-md font-mono text-base resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Escribe tu contenido en Markdown..."
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="h-[calc(100vh-350px)] flex flex-col">
            <div className="bg-muted/30 px-4 py-2 border border-border rounded-t-md flex items-center">
              <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Vista previa</span>
            </div>
            <Card className="flex-1 overflow-auto border-t-0 rounded-t-none">
              <div className="p-6">
                <h1 className="text-3xl font-heading mb-4">{title || "Título del post"}</h1>
                <div className="prose dark:prose-invert max-w-none prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-primary prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-img:rounded-md">
                  <ReactMarkdown>{content || "El contenido del post aparecerá aquí..."}</ReactMarkdown>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

