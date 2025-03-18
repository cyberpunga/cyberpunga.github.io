import fs from "fs"
import path from "path"

// Directory where downloaded images will be stored
const IMAGE_DIR = path.join(process.cwd(), "public", "images", "content")

// Ensure the directory exists
export function ensureImageDirectory() {
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true })
  }
}

// Simple string hashing function that doesn't rely on Node.js crypto
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to positive hex string and ensure it's at least 8 characters
  const positiveHash = Math.abs(hash).toString(16).padStart(8, "0")
  return positiveHash
}

// Generate a filename based on the URL
function generateFilename(url: string, extension: string): string {
  const hash = simpleHash(url)
  return `${hash}${extension}`
}

// Get file extension from URL or content type
function getExtension(url: string, contentType?: string): string {
  // Try to get extension from URL
  try {
    // Use a simple regex to extract the extension
    const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/)
    if (extensionMatch && extensionMatch[1]) {
      const ext = extensionMatch[1].toLowerCase()
      // Only return if it's a common image extension
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        return `.${ext}`
      }
    }
  } catch (e) {
    // If URL parsing fails, continue to other methods
  }

  // If no extension in URL, try to determine from content type
  if (contentType) {
    const mapping: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    }
    return mapping[contentType] || ".jpg"
  }

  // Default to jpg if we can't determine
  return ".jpg"
}

// Check if a URL is from Supabase Storage
function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return (
      parsedUrl.hostname.includes("supabase.co") &&
      (parsedUrl.pathname.includes("/storage/v1/") || parsedUrl.pathname.includes("/object/"))
    )
  } catch (e) {
    return false
  }
}

// Download an image from a URL
export async function downloadImage(url: string): Promise<string | null> {
  try {
    // Skip if it's already a local URL
    if (url.startsWith("/") || url.startsWith("./")) {
      return url
    }

    // Try to parse the URL to check if it's valid
    let hostname
    try {
      // Use the global URL constructor
      const parsedUrl = new URL(url)
      hostname = parsedUrl.hostname

      // Skip if it's a localhost URL
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return url
      }
    } catch (e) {
      // If URL parsing fails, return the original URL
      return url
    }

    // Generate a filename (we'll determine extension after fetching)
    const tempFilename = generateFilename(url, "")

    // Check if we've already downloaded this image (with any extension)
    const existingFiles = fs.readdirSync(IMAGE_DIR)
    const existingFile = existingFiles.find((file) => file.startsWith(tempFilename))
    if (existingFile) {
      return `/images/content/${existingFile}`
    }

    // Log the download attempt
    console.log(`Downloading image: ${url}`)

    // Fetch the image
    const response = await fetch(url)

    // Check if the response is successful
    if (!response.ok) {
      console.error(`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`)
      return url
    }

    // Check if the response is an image
    const contentType = response.headers.get("content-type") || ""
    if (!contentType.startsWith("image/")) {
      console.log(`Not an image: ${url} (${contentType})`)
      return url // Return original URL if not an image
    }

    // Get the file extension based on content type
    const extension = getExtension(url, contentType)
    const filename = tempFilename + extension
    const filePath = path.join(IMAGE_DIR, filename)
    const publicPath = `/images/content/${filename}`

    // Convert response to buffer and save to file
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

    console.log(`Downloaded image: ${url} -> ${publicPath}`)

    return publicPath
  } catch (error) {
    console.error(`Error processing image URL ${url}:`, error)
    return url // Return original URL on error
  }
}

// Process all images in markdown content
export async function processMarkdownImages(content: string): Promise<string> {
  // Ensure the image directory exists
  ensureImageDirectory()

  // Find all image URLs in the markdown
  const imageRegex = /!\[.*?\]$$(.*?)$$/g
  const imageUrls = []
  let match

  while ((match = imageRegex.exec(content)) !== null) {
    imageUrls.push(match[1])
  }

  // Also find HTML img tags
  const imgTagRegex = /<img.*?src=["'](.*?)["'].*?>/g
  while ((match = imgTagRegex.exec(content)) !== null) {
    imageUrls.push(match[1])
  }

  // Also look for Supabase Storage URLs specifically
  const supabaseUrlRegex = /(https:\/\/[^"'\s)]*?supabase\.co[^"'\s)]*?\/storage\/v1\/[^"'\s)]*)/g
  while ((match = supabaseUrlRegex.exec(content)) !== null) {
    if (!imageUrls.includes(match[1])) {
      imageUrls.push(match[1])
    }
  }

  console.log(`Found ${imageUrls.length} images in content`)

  // Download all images and get their new paths
  const urlMap = new Map()

  for (const url of imageUrls) {
    if (!urlMap.has(url)) {
      const localPath = await downloadImage(url)
      urlMap.set(url, localPath)
    }
  }

  // Replace all image URLs in the markdown
  let newContent = content

  for (const [originalUrl, localPath] of urlMap.entries()) {
    if (originalUrl !== localPath) {
      // Replace in markdown syntax
      const markdownRegex = new RegExp(`!\\[.*?\\]\$$${escapeRegExp(originalUrl)}\$$`, "g")
      newContent = newContent.replace(markdownRegex, (match) => match.replace(originalUrl, localPath))

      // Replace in HTML img tags
      const imgTagRegex = new RegExp(`<img.*?src=["']${escapeRegExp(originalUrl)}["'].*?>`, "g")
      newContent = newContent.replace(imgTagRegex, (match) => match.replace(originalUrl, localPath))

      // Replace any other occurrences (like in background-image CSS)
      newContent = newContent.replace(new RegExp(escapeRegExp(originalUrl), "g"), localPath)

      console.log(`Replaced image URL: ${originalUrl} -> ${localPath}`)
    }
  }

  return newContent
}

// Helper to escape special characters in a string for use in a regex
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

