import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold mb-4">Post not found</h1>
      <p className="text-muted-foreground mb-6">The post you are looking for does not exist or is not published.</p>
      <Link href="/posts">
        <Button>Back to Posts</Button>
      </Link>
    </div>
  )
}

