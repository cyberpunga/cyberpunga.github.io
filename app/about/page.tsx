import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";
import { ProseContainer } from "@/components/prose-container";

export const metadata: Metadata = {
  title: "Acerca de",
  description: "Información sobre Enclaves Críticos y nuestra misión.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto">
          <h1 className="mb-6 text-zinc-900 dark:text-zinc-50">Acerca de {siteConfig.name}</h1>

          <ProseContainer>
            <p>
              {siteConfig.name} es un espacio dedicado a la reflexión crítica sobre las intersecciones entre tecnología,
              sociedad y pensamiento latinoamericano. Nuestro objetivo es explorar las complejas relaciones entre los
              sistemas tecnológicos contemporáneos y las realidades sociales, políticas y culturales de América Latina.
            </p>

            <h2>Nuestra Misión</h2>
            <p>
              En un contexto global donde las narrativas tecnológicas dominantes suelen originarse en los centros de
              poder del Norte global, buscamos articular perspectivas críticas desde América Latina que:
            </p>
            <ul>
              <li>Cuestionen las relaciones de poder implícitas en los sistemas tecnológicos</li>
              <li>Visibilicen las formas específicas en que las tecnologías operan en contextos periféricos</li>
              <li>
                Recuperen y actualicen tradiciones de pensamiento latinoamericano para abordar los desafíos tecnológicos
                contemporáneos
              </li>
              <li>
                Imaginen futuros tecnológicos alternativos que respondan a las necesidades y aspiraciones de nuestras
                sociedades
              </li>
            </ul>

            <h2>Enfoque Editorial</h2>
            <p>
              Nuestros ensayos combinan rigor analítico con experimentación formal. Nos interesa explorar las
              posibilidades de la escritura ensayística para abordar fenómenos complejos que requieren aproximaciones
              transdisciplinarias.
            </p>
            <p>Abordamos temas como:</p>
            <ul>
              <li>Inteligencia artificial y sus implicaciones geopolíticas</li>
              <li>Extractivismo de datos y nuevas formas de dependencia tecnológica</li>
              <li>Transformaciones territoriales mediadas por tecnologías</li>
              <li>Epistemologías tecnológicas y su relación con cosmovisiones latinoamericanas</li>
              <li>Movimientos por la soberanía tecnológica y alternativas emergentes</li>
            </ul>

            <h2>Colabora con Nosotros</h2>
            <p>
              {siteConfig.name} es un proyecto abierto a colaboraciones. Si estás interesado/a en contribuir con
              ensayos, investigaciones o propuestas que se alineen con nuestra misión, no dudes en contactarnos.
            </p>

            <blockquote>
              <p>
                "La pregunta por la tecnología en América Latina no es meramente técnica sino profundamente política:
                ¿cómo construir futuros tecnológicos que no reproduzcan subordinaciones históricas sino que contribuyan
                a la emancipación social y epistémica de la región?"
              </p>
            </blockquote>
          </ProseContainer>
        </div>
      </main>
    </div>
  );
}
