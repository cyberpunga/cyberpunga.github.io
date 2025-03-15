"use client"

import type React from "react"

import { useState, useRef } from "react"
import { uploadImage } from "@/lib/supabase-storage"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const { url } = await uploadImage(file)
      onImageUploaded(url)
      toast.success("Imagen subida correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ha ocurrido un error al subir la imagen")
    } finally {
      setIsUploading(false)
      // Reset the input
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-border"
        } transition-colors duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
          </div>
        ) : (
          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">Arrastra una imagen o haz clic para seleccionar</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP o SVG (máx. 5MB)</p>
          </label>
        )}
      </div>
    </div>
  )
}

