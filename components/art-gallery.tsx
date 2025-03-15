"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ArtGallery() {
  // Sample data for gallery items
  const galleryItems = [
    {
      id: 1,
      title: "Neural Synthesis #42",
      artist: "Elena Vostok",
      image: "/placeholder.svg?height=500&width=400",
      year: "2025",
    },
    {
      id: 2,
      title: "Digital Consciousness",
      artist: "Marcus Chen",
      image: "/placeholder.svg?height=500&width=400",
      year: "2024",
    },
    {
      id: 3,
      title: "Quantum Entanglement",
      artist: "Zara Black",
      image: "/placeholder.svg?height=500&width=400",
      year: "2025",
    },
    {
      id: 4,
      title: "Memory Corruption",
      artist: "Theo Kline",
      image: "/placeholder.svg?height=500&width=400",
      year: "2023",
    },
  ]

  return (
    <section className="py-20 bg-zinc-950 relative">
      {/* Diagonal line decoration */}
      <div className="absolute top-0 left-0 w-full h-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-px h-20 bg-gradient-to-b from-fuchsia-500 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-20 bg-gradient-to-b from-cyan-500 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-cyan-400">&gt;</span> Featured Works
          </h2>
          <Button variant="link" className="text-fuchsia-500 hover:text-cyan-400 gap-2 group font-mono">
            View Gallery
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryItems.map((item) => (
            <Link key={item.id} href={`/gallery/${item.id}`} className="group">
              <div className="relative overflow-hidden border border-zinc-800 hover:border-fuchsia-500 transition-colors duration-300">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-xl font-bold font-mono">{item.title}</h3>
                  <p className="text-zinc-300">
                    {item.artist}, <span className="font-mono text-cyan-400">{item.year}</span>
                  </p>
                </div>
                {/* Terminal-like corner decoration */}
                <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 right-0 w-px h-8 bg-fuchsia-500"></div>
                  <div className="absolute top-0 right-0 h-px w-8 bg-fuchsia-500"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 w-px h-8 bg-cyan-400"></div>
                  <div className="absolute bottom-0 left-0 h-px w-8 bg-cyan-400"></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

