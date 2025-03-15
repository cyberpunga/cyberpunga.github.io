"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState("start")

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl mb-8">Configuración del Blog</h1>

        <Tabs defaultValue="start" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full mb-8">
            <TabsTrigger value="start">Inicio</TabsTrigger>
            <TabsTrigger value="auth">Autenticación</TabsTrigger>
            <TabsTrigger value="database">Base de Datos</TabsTrigger>
          </TabsList>

          <TabsContent value="start">
            <Card>
              <CardHeader>
                <CardTitle>Primeros pasos</CardTitle>
                <CardDescription>Configura tu blog con Supabase para GitHub Pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Para configurar tu blog con Supabase, necesitas seguir estos pasos:</p>

                <ol className="space-y-6 list-decimal pl-5 mt-4">
                  <li className="pl-2">
                    <h3 className="text-lg font-medium mb-2">Crear un proyecto en Supabase</h3>
                    <p className="text-muted-foreground mb-2">
                      Si aún no tienes un proyecto en Supabase, necesitas crear uno:
                    </p>
                    <ol className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        Ve a{" "}
                        <a
                          href="https://supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Supabase
                        </a>{" "}
                        y crea una cuenta o inicia sesión
                      </li>
                      <li>Haz clic en "New Project" y sigue las instrucciones</li>
                      <li>Anota la URL del proyecto y la clave anónima (API key)</li>
                    </ol>
                  </li>

                  <li className="pl-2">
                    <h3 className="text-lg font-medium mb-2">Configurar la autenticación</h3>
                    <p className="text-muted-foreground mb-2">Configura la autenticación con enlaces mágicos:</p>
                    <Button onClick={() => setActiveTab("auth")} variant="outline" size="sm" className="mt-1">
                      Ver instrucciones de autenticación
                    </Button>
                  </li>

                  <li className="pl-2">
                    <h3 className="text-lg font-medium mb-2">Crear la tabla de posts</h3>
                    <p className="text-muted-foreground mb-2">Crea la tabla para almacenar los posts del blog:</p>
                    <Button onClick={() => setActiveTab("database")} variant="outline" size="sm" className="mt-1">
                      Ver instrucciones de base de datos
                    </Button>
                  </li>

                  <li className="pl-2">
                    <h3 className="text-lg font-medium mb-2">Configurar las variables de entorno</h3>
                    <p className="text-muted-foreground mb-2">Añade las variables de entorno a tu proyecto:</p>
                    <div className="bg-muted p-3 rounded-md text-sm font-mono">
                      <div>NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co</div>
                      <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anónima</div>
                    </div>
                  </li>
                </ol>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                  <Link href="/admin">Volver</Link>
                </Button>
                <Button onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>Ir a Supabase</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Autenticación</CardTitle>
                <CardDescription>Configura la autenticación con enlaces mágicos en Supabase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p>Para configurar la autenticación con enlaces mágicos en Supabase, sigue estos pasos:</p>

                  <ol className="space-y-6 list-decimal pl-5">
                    <li className="pl-2">
                      <h3 className="text-lg font-medium mb-2">Habilitar el proveedor de Email</h3>
                      <p className="text-muted-foreground mb-2">En tu dashboard de Supabase:</p>
                      <ol className="list-disc pl-5 space-y-1 text-sm">
                        <li>
                          Ve a <strong>Authentication</strong> &gt; <strong>Providers</strong>
                        </li>
                        <li>
                          Asegúrate de que <strong>Email</strong> está habilitado
                        </li>
                        <li>
                          Activa la opción <strong>"Enable magic links"</strong>
                        </li>
                        <li>Guarda los cambios</li>
                      </ol>
                      <div className="mt-2 bg-green-500/10 text-green-500 p-3 rounded-md flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Consejo</p>
                          <p className="text-sm">
                            Los enlaces mágicos son ideales para GitHub Pages porque no requieren almacenar contraseñas.
                          </p>
                        </div>
                      </div>
                    </li>

                    <li className="pl-2">
                      <h3 className="text-lg font-medium mb-2">Configurar las URLs de redirección</h3>
                      <p className="text-muted-foreground mb-2">
                        Configura las URLs a las que se redirigirá después de hacer clic en el enlace mágico:
                      </p>
                      <ol className="list-disc pl-5 space-y-1 text-sm">
                        <li>
                          Ve a <strong>Authentication</strong> &gt; <strong>URL Configuration</strong>
                        </li>
                        <li>
                          En <strong>Site URL</strong>, añade la URL de tu sitio (ej. <code>http://localhost:3000</code>{" "}
                          para desarrollo)
                        </li>
                        <li>
                          En <strong>Redirect URLs</strong>, añade:
                          <ul className="pl-5 mt-1 space-y-1">
                            <li>
                              <code>http://localhost:3000/admin/posts</code> (para desarrollo local)
                            </li>
                            <li>
                              <code>https://tuusername.github.io/admin/posts</code> (para GitHub Pages)
                            </li>
                          </ul>
                        </li>
                        <li>Guarda los cambios</li>
                      </ol>
                      <div className="mt-2 bg-yellow-500/10 text-yellow-500 p-3 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Importante</p>
                          <p className="text-sm">
                            Asegúrate de añadir la URL exacta de tu sitio en GitHub Pages, incluyendo cualquier prefijo
                            de repositorio.
                          </p>
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={() => setActiveTab("start")} variant="outline">
                  Volver
                </Button>
                <Button onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>Ir a Supabase</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Base de Datos</CardTitle>
                <CardDescription>Crea la tabla de posts en tu base de datos Supabase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Para crear la tabla de posts con autenticación, necesitas ejecutar el siguiente SQL en el editor SQL
                    de Supabase:
                  </p>

                  <div className="bg-muted p-4 rounded-md overflow-auto text-sm">
                    <pre>{`-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT,
  published BOOLEAN DEFAULT false,
  cover_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster slug lookups
CREATE INDEX posts_slug_idx ON posts (slug);

-- Create index for published posts
CREATE INDEX posts_published_idx ON posts (published);

-- Create index for author_id
CREATE INDEX posts_author_id_idx ON posts (author_id);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- 1. Allow anyone to read published posts
CREATE POLICY "Anyone can read published posts"
  ON posts
  FOR SELECT
  USING (published = true);

-- 2. Allow authenticated users to CRUD their own posts
CREATE POLICY "Users can create their own posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON posts
  FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can read their own posts"
  ON posts
  FOR SELECT
  USING (auth.uid() = author_id);`}</pre>
                  </div>

                  <p>Para ejecutar este SQL:</p>
                  <ol className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      Ve a <strong>SQL Editor</strong> en tu dashboard de Supabase
                    </li>
                    <li>Copia y pega el código SQL anterior</li>
                    <li>
                      Haz clic en <strong>"Run"</strong> para ejecutar el SQL
                    </li>
                  </ol>

                  <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Importante</p>
                      <p className="text-sm">
                        Este SQL crea la tabla 'posts' con las políticas de seguridad necesarias para que cada usuario
                        solo pueda ver y editar sus propios posts.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={() => setActiveTab("start")} variant="outline">
                  Volver
                </Button>
                <Button onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>Ir a Supabase</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

