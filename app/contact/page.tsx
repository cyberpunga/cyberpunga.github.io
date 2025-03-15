import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Contacto | cyberpun.ga",
  description: "Ponte en contacto con el equipo de cyberpun.ga",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Button asChild variant="ghost" className="mb-8 text-muted-foreground hover:text-primary">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-heading leading-tight mb-6 text-foreground">Contacto</h1>
        <p className="text-xl text-muted-foreground mb-12 font-body">
          ¿Tienes algo que compartir? Estamos abiertos a colaboraciones, sugerencias y conversaciones.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Email</CardTitle>
              <CardDescription>Nuestro canal principal</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:contacto@cyberpun.ga"
                className="text-primary hover:text-primary/80 highlight-link text-lg"
              >
                contacto@cyberpun.ga
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Redes Sociales</CardTitle>
              <CardDescription>Síguenos y conversa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="#" className="text-primary hover:text-primary/80 highlight-link block text-lg">
                @cyberpunga
              </a>
              <a href="#" className="text-primary hover:text-primary/80 highlight-link block text-lg">
                cyberpun.ga
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Ubicación</CardTitle>
              <CardDescription>Nuestro espacio físico</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-body text-lg">
                Somos un colectivo distribuido con base en América Latina.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-heading">Envíanos un mensaje</CardTitle>
            <CardDescription className="text-base">
              Completa el formulario y te responderemos lo antes posible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium font-body">
                    Nombre
                  </label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    className="bg-background border-border focus-visible:ring-primary text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium font-body">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="bg-background border-border focus-visible:ring-primary text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium font-body">
                  Asunto
                </label>
                <Input
                  id="subject"
                  placeholder="¿Sobre qué quieres hablar?"
                  className="bg-background border-border focus-visible:ring-primary text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium font-body">
                  Mensaje
                </label>
                <Textarea
                  id="message"
                  placeholder="Tu mensaje..."
                  rows={6}
                  className="bg-background border-border focus-visible:ring-primary resize-none text-base"
                />
              </div>

              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground w-full md:w-auto">
                Enviar Mensaje
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

