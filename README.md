# cyberpunga

`cyberpunga` es un sitio editorial estático construido con Next.js, React, Tailwind CSS y MDX. Publica artículos sobre tecnología, sociedad y pensamiento crítico latinoamericano, con contenido escrito como archivos MDX y exportación estática lista para GitHub Pages u otro hosting de archivos.

## Stack

- Next.js 15 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- MDX con frontmatter
- Componentes estilo shadcn/ui
- Exportación estática con `output: "export"`

## Requisitos

- Node.js compatible con Next.js 15
- pnpm

## Desarrollo

Instala dependencias:

```bash
pnpm install
```

Levanta el servidor local:

```bash
pnpm dev
```

Abre:

```text
http://localhost:3000
```

El dashboard de publicación queda disponible en:

```text
http://localhost:3000/dashboard
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

Notas:

- `pnpm build` genera una versión estática del sitio.
- El build usa `next/font`, por lo que puede necesitar acceso a Google Fonts.
- `pnpm start` solo aplica a una app servida por Next; para la exportación estática normalmente se publica el directorio generado.

## Estructura

```text
app/
  page.tsx              Página principal
  [collection]/
    page.tsx            Índice estático de colecciones, con vista especial para artículos
    [slug]/page.tsx     Página estática de entrada, con vista especial para artículos
  dashboard/
    page.tsx            Dashboard estático que publica contenido vía GitHub API
  posts/
    posts-list.tsx      Filtro cliente por tag para artículos
components/             Componentes compartidos
content/
  posts/
    _type.json          Definición de la colección de artículos
    <slug>/
      page.mdx          Contenido del artículo
      images/           Imágenes locales del artículo
  texts/, photos/, ...
    _type.json          Colecciones iniciales inspiradas en tipos de post de Tumblr
lib/
  content.ts            Carga genérica de colecciones y entradas
  content-schema.ts     Tipos y validación liviana de colecciones
  default-collections.ts
                        Definiciones de colecciones incluidas para el dashboard cliente
  posts.ts              Carga, ordenamiento y metadata de posts
  site-config.ts        Configuración del sitio y del publicador
.agents/
  skills/
    project-doc-maintainer/
                         Skill local de Codex para mantener AGENTS.md y README.md
```

## Publicar un artículo

Crea una carpeta dentro de `content/posts/` usando el slug de la URL:

```text
content/posts/mi-nuevo-articulo/page.mdx
```

Cada archivo MDX debe incluir frontmatter:

```mdx
---
title: "Mi nuevo artículo"
date: "2026-05-02"
description: "Una descripción breve para listados y metadata."
tags: ["tecnología", "sociedad", "cyberpunk"]
---

Contenido del artículo...
```

Las imágenes pueden vivir junto al artículo:

```text
content/posts/mi-nuevo-articulo/images/01.jpeg
```

Y referenciarse desde MDX:

```mdx
![Descripción de la imagen](./images/01.jpeg)
```

También se pueden crear y editar artículos desde `/dashboard`. Es un dashboard estático del propio sitio: arranca con las definiciones de colecciones incluidas en el repo, valida un token de GitHub guardado en el navegador, lista las entradas existentes de cada colección, genera el frontmatter, arma el archivo MDX y usa la API de GitHub para escribir commits en `cyberpunga/cyberpunga.github.io` sobre `main`. Después de publicar o editar, muestra el estado del deploy de GitHub Actions asociado al commit para avisar cuándo el sitio público terminó de actualizarse. Al iniciar sesión, mezcla las definiciones remotas de GitHub sobre las incluidas en el build. Las entradas existentes se editan en su ruta actual usando el SHA del archivo en GitHub, y se pueden enlazar con rutas cliente compatibles con exportación estática como `/dashboard#/<coleccion>/<slug>`.

El publicador crea entradas con esta misma estructura:

```text
content/posts/<slug>/page.mdx
content/posts/<slug>/images/
```

Para publicar, cada autor necesita acceso al repositorio y un fine-grained personal access token de GitHub con permisos `Contents: write` y `Actions: read` sobre este repo. `/dashboard` incluye un enlace prellenado desde `lib/site-config.ts` para crear ese token; GitHub permite prellenar el dueño del recurso y permisos, pero el autor debe elegir `Only select repositories` y seleccionar `cyberpunga.github.io`. El token se guarda solo en el navegador del autor. Al iniciar sesión, el flujo de autenticación también crea `content/users/<login>/page.mdx` desde el perfil de GitHub si todavía no existe; si ya existe, no lo sobrescribe.

## Tipos de contenido

`posts` es la colección principal de artículos. Su definición vive en:

```text
content/posts/_type.json
```

El repo también trae colecciones iniciales inspiradas en los tipos de post de Tumblr:

```text
content/texts/       -> /textos
content/photos/      -> /fotos
content/photosets/   -> /fotogalerias
content/quotes/      -> /citas
content/links/       -> /enlaces
content/chats/       -> /chats
content/audios/      -> /audios
content/videos/      -> /videos
content/answers/     -> /respuestas
```

Estas colecciones pueden contener solo `_type.json` hasta que alguien publique la primera entrada.

El menú superior se genera automáticamente desde las definiciones públicas de colecciones.

El dashboard también permite crear nuevas colecciones. Cada colección nueva se guarda como:

```text
content/<coleccion>/_type.json
content/<coleccion>/<slug>/page.mdx
content/<coleccion>/<slug>/images/
```

Las colecciones nuevas usan campos livianos en frontmatter: `text`, `textarea`, `date`, `boolean`, `select`, `list` y `tags`. Todas las entradas tienen siempre `title`, `description` y cuerpo MDX.

Después del siguiente build estático, las colecciones nuevas se publican con rutas genéricas:

```text
/<coleccion>
/<coleccion>/<slug>
```

Las rutas `posts`, `dashboard` y `about` están reservadas. Los artículos mantienen sus URLs públicas en `/posts` y `/posts/<slug>`, aunque sus archivos vivan en `content/posts`.

## Tags

Los tags se muestran en las tarjetas y en el pie del sitio. El índice de artículos permite filtrar con query string:

```text
/posts?tag=cyberpunk
```

El filtrado se hace en el cliente para seguir siendo compatible con la exportación estática.

## Metadata

Cada página de artículo genera metadata propia desde el frontmatter:

- `title`
- `description`
- Open Graph de tipo `article`
- Twitter card

La metadata global vive en `app/layout.tsx` y usa valores de `lib/site-config.ts`.

## Verificación

Antes de publicar cambios, corre:

```bash
pnpm lint
pnpm build
pnpm exec tsc --noEmit
```

## Despliegue

El proyecto está configurado para exportación estática en `next.config.ts`:

```ts
output: "export";
```

Después de `pnpm build`, Next genera los archivos estáticos que pueden subirse a GitHub Pages u otro hosting estático.
