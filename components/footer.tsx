export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Cyberpunga Collective. Third world low budget cyberpunk.
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/cyberpunga"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/cyberpunga"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com/cyberpunga"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

