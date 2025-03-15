import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Sobre Nosotros | cyberpun.ga",
  description: "Conoce más sobre el proyecto cyberpun.ga y nuestra misión",
}

export default function AboutPage() {
  // Team members data
  const teamMembers = [
    {
      name: "Alex Mercer",
      role: "Fundador & Editor",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Escritor y teórico digital con enfoque en la intersección entre tecnología, cultura y resistencia.",
    },
    {
      name: "Sasha Kim",
      role: "Directora de Contenido",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Investigadora y activista especializada en privacidad digital y ética tecnológica.",
    },
    {
      name: "Jordan Rivera",
      role: "Editor de Arte",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Artista digital y curador con experiencia en arte glitch y nuevos medios.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10 z-0"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <Button asChild variant="ghost" className="mb-8 text-muted-foreground hover:text-primary">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold font-heading leading-tight mb-6 text-foreground">
              Sobre <span className="text-primary">cyberpun</span>.<span className="text-primary">ga</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 font-body">
              Un espacio para explorar la intersección entre tecnología, cultura y resistencia en la era digital.
            </p>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-heading mb-8 relative inline-block">
              <span className="relative z-10">Nuestro Manifiesto</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary"></span>
            </h2>

            <div className="prose dark:prose-invert max-w-none prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-p:font-body prose-li:font-body">
              <p className="text-lg">
                En un mundo donde la tecnología se ha convertido en una extensión de nuestro ser, donde lo digital y lo
                físico se entrelazan de formas cada vez más complejas, <strong>cyberpun.ga</strong> surge como un
                espacio de reflexión, crítica y resistencia.
              </p>

              <p>
                Creemos que la tecnología no es neutral. Cada línea de código, cada algoritmo, cada interfaz encarna
                valores, prejuicios y visiones del mundo. Nuestra misión es examinar estas dimensiones ocultas,
                cuestionar las narrativas dominantes y explorar futuros tecnológicos alternativos.
              </p>

              <p>
                No somos tecnofóbicos ni tecnoutópicos. Reconocemos tanto el potencial liberador como opresivo de las
                tecnologías digitales. Buscamos navegar este terreno complejo con curiosidad crítica y compromiso ético.
              </p>

              <h3>Nuestros principios:</h3>

              <ol>
                <li>
                  <strong>Autonomía digital:</strong> Defendemos el derecho de las personas a controlar sus datos,
                  identidades y experiencias digitales.
                </li>
                <li>
                  <strong>Accesibilidad:</strong> Creemos que el conocimiento técnico y crítico debe estar disponible
                  para todos, no solo para una élite tecnológica.
                </li>
                <li>
                  <strong>Diversidad de perspectivas:</strong> Valoramos las voces marginadas en los discursos
                  tecnológicos y buscamos amplificar experiencias diversas.
                </li>
                <li>
                  <strong>Creatividad como resistencia:</strong> Apoyamos el uso del arte, el diseño y la narrativa como
                  formas de imaginar y construir futuros tecnológicos más justos.
                </li>
                <li>
                  <strong>Comunidad sobre corporaciones:</strong> Priorizamos tecnologías y plataformas que sirven a
                  comunidades reales sobre aquellas que extraen valor para beneficio corporativo.
                </li>
              </ol>

              <p>
                Si estás leyendo esto, significa que sigues con vida y nos alegra muchísimo. En un mundo de
                distracciones infinitas y vigilancia constante, el simple acto de leer críticamente es ya una forma de
                resistencia.
              </p>

              <p>
                Te invitamos a unirte a nosotros en este viaje de exploración, crítica y creación. Juntos, podemos
                hackear el futuro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-heading mb-12 relative inline-block">
              <span className="relative z-10">Nuestro Equipo</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary"></span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="bg-card border border-border p-6 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-1 font-heading">{member.name}</h3>
                  <p className="text-primary text-sm text-center font-heading mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-center font-body">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-heading mb-6 relative inline-block">
              <span className="relative z-10">Contacto</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary"></span>
            </h2>
            <p className="text-muted-foreground mb-8 font-body">
              ¿Tienes preguntas, sugerencias o quieres colaborar con nosotros? Estamos abiertos a nuevas ideas y
              conexiones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground">
                <Link href="mailto:contacto@cyberpun.ga">Enviar Email</Link>
              </Button>
              <Button asChild variant="outline" className="border-border hover:border-primary hover:text-primary">
                <Link href="/contact">Formulario de Contacto</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

