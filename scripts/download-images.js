const fs = require("fs")
const path = require("path")

// Simple string hashing function
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to positive hex string
  const positiveHash = Math.abs(hash).toString(16).padStart(8, "0")
  return positiveHash
}

// Get file extension from URL or content type
function getExtension(url, contentType) {
  // Try to get extension from URL
  try {
    const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/)
    if (extensionMatch && extensionMatch[1]) {
      const ext = extensionMatch[1].toLowerCase()
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        return `.${ext}`
      }
    }
  } catch (e) {
    // If URL parsing fails, continue to other methods
  }

  // If no extension in URL, try to determine from content type
  if (contentType) {
    const mapping = {
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

// Download an image from a URL
async function downloadImage(url, imageDir) {
  try {
    // Skip if it's already a local URL
    if (url.startsWith("/") || url.startsWith("./")) {
      return url
    }

    // Try to parse the URL to check if it's valid
    let hostname
    try {
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
    const tempFilename = simpleHash(url)

    // Check if we've already downloaded this image (with any extension)
    const existingFiles = fs.readdirSync(imageDir)
    const existingFile = existingFiles.find((file) => file.startsWith(tempFilename))
    if (existingFile) {
      return `/images/content/${existingFile}`
    }

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
    const filePath = path.join(imageDir, filename)
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
async function processMarkdownImages(content, imageDir) {
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

  console.log(`Found ${imageUrls.length} images in content`)

  // Download all images and get their new paths
  const urlMap = new Map()

  for (const url of imageUrls) {
    if (!urlMap.has(url)) {
      const localPath = await downloadImage(url, imageDir)
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

      console.log(`Replaced image URL: ${originalUrl} -> ${localPath}`)
    }
  }

  return newContent
}

// Helper to escape special characters in a string for use in a regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Main function to process all posts and authors
async function processAllContent() {
  // Create image directory if it doesn't exist
  const imageDir = path.join(process.cwd(), "public", "images", "content")
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true })
  }

  // Load Supabase environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are not set")
    process.exit(1)
  }

  // Create a simple fetch-based Supabase client
  const supabase = {
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          order: (orderColumn, { ascending }) => ({
            limit: (limit) =>
              fetch(
                `${supabaseUrl}/rest/v1/${table}?select=${columns || "*"}&${column}=eq.${value}${orderColumn ? `&order=${orderColumn}.${ascending ? "asc" : "desc"}` : ""}${limit ? `&limit=${limit}` : ""}`,
                {
                  headers: {
                    apikey: supabaseAnonKey,
                    Authorization: `Bearer ${supabaseAnonKey}`,
                  },
                },
              ).then((res) => res.json()),
          }),
          single: () =>
            fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns || "*"}&${column}=eq.${value}&limit=1`, {
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
            })
              .then((res) => res.json())
              .then((data) => ({ data: data[0] })),
        }),
        order: (orderColumn, { ascending }) => ({
          limit: (limit) =>
            fetch(
              `${supabaseUrl}/rest/v1/${table}?select=${columns || "*"}${orderColumn ? `&order=${orderColumn}.${ascending ? "asc" : "desc"}` : ""}${limit ? `&limit=${limit}` : ""}`,
              {
                headers: {
                  apikey: supabaseAnonKey,
                  Authorization: `Bearer ${supabaseAnonKey}`,
                },
              },
            ).then((res) => res.json()),
        }),
      }),
    }),
  }

  console.log("Fetching posts from Supabase...")

  // Fetch all published posts
  const posts = await supabase.from("posts").select("*").eq("published", true).order("created_at", { ascending: false })

  console.log(`Found ${posts.length} published posts`)

  // Process each post
  for (const post of posts) {
    console.log(`Processing post: ${post.title} (${post.slug})`)

    // Process cover image
    if (post.cover_image) {
      post.cover_image = await downloadImage(post.cover_image, imageDir)
    }

    // Process content
    if (post.content) {
      post.content = await processMarkdownImages(post.content, imageDir)
    }
  }

  console.log("Fetching authors from Supabase...")

  // Fetch all published authors
  const authors = await supabase.from("authors").select("*").eq("published", true).order("name", { ascending: true })

  console.log(`Found ${authors.length} published authors`)

  // Process each author
  for (const author of authors) {
    console.log(`Processing author: ${author.name} (${author.slug})`)

    // Process profile picture
    if (author.profile_picture) {
      author.profile_picture = await downloadImage(author.profile_picture, imageDir)
    }

    // Process bio
    if (author.bio) {
      author.bio = await processMarkdownImages(author.bio, imageDir)
    }
  }

  console.log("All content processed successfully!")
}

// Run the main function
processAllContent().catch((error) => {
  console.error("Error processing content:", error)
  process.exit(1)
})

