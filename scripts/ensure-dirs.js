const fs = require("fs")
const path = require("path")

// Ensure the images directory exists
const imageDir = path.join(process.cwd(), "public", "images", "content")
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true })
  console.log("Created directory:", imageDir)
}

