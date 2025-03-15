import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-border py-12 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-heading mb-4 tracking-wide">
              cyber<span className="text-primary">pun</span>.<span className="text-primary">ga</span>
            </h3>
            <p className="text-muted-foreground mb-4 font-body">
              si estás leyendo esto, significa que sigues con vida y nos alegra muchísimo
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-heading">Navegación</h4>
            <ul className="space-y-2 font-body">
              <li>
                <Link href="/posts" className="text-muted-foreground hover:text-foreground highlight-link">
                  Artículos
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground highlight-link">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground highlight-link">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-heading">Recursos</h4>
            <ul className="space-y-2 font-body">
              <li>
                <Link href="/manifesto" className="text-muted-foreground hover:text-foreground highlight-link">
                  Manifiesto
                </Link>
              </li>
              <li>
                <Link href="/colaborar" className="text-muted-foreground hover:text-foreground highlight-link">
                  Colaborar
                </Link>
              </li>
              <li>
                <Link href="/admin/editor" className="text-muted-foreground hover:text-foreground highlight-link">
                  Editor MDX
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-heading">Legal</h4>
            <ul className="space-y-2 font-body">
              <li>
                <Link href="/privacidad" className="text-muted-foreground hover:text-foreground highlight-link">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-muted-foreground hover:text-foreground highlight-link">
                  Términos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm font-body">© 2025 cyberpun.ga. Todos los derechos reservados.</p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0 font-body">
            <span className="text-primary">$</span> Diseñado con resistencia digital
          </p>
        </div>
      </div>
    </footer>
  )
}

