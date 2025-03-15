import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

// Define allowed image types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function uploadImage(file: File) {
  try {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Tipo de archivo no permitido. Por favor, sube una imagen JPG, PNG, GIF, WebP o SVG.")
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("El archivo es demasiado grande. El tamaño máximo es 5MB.")
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `post-images/${fileName}`

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage.from("blog-assets").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-assets").getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

export async function deleteImage(filePath: string) {
  try {
    const { error } = await supabase.storage.from("blog-assets").remove([filePath])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}

