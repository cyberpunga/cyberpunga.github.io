# cyberpunga

`cyberpunga` es un sitio editorial estático construido con Next.js, React, Tailwind CSS y MDX. Publica artículos sobre tecnología, sociedad y pensamiento crítico latinoamericano, con contenido escrito como archivos MDX y exportación estática lista para GitHub Pages u otro hosting de archivos.

## Stack

- Next.js 15 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- MDX con frontmatter
- `next-themes` para modo claro/oscuro
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
  posts/
    page.tsx            Índice de artículos
    posts-list.tsx      Filtro cliente por tag
    [slug]/page.tsx     Página estática de cada artículo
components/             Componentes compartidos
lib/
  posts.ts              Carga, ordenamiento y metadata de posts
  site-config.ts        Configuración del sitio
posts/
  <slug>/
    page.mdx            Contenido del artículo
    images/             Imágenes locales del artículo
```

## Publicar un artículo

Crea una carpeta dentro de `posts/` usando el slug de la URL:

```text
posts/mi-nuevo-articulo/page.mdx
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
posts/mi-nuevo-articulo/images/01.jpeg
```

Y referenciarse desde MDX:

```mdx
![Descripción de la imagen](./images/01.jpeg)
```

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
pnpm exec tsc --noEmit
pnpm build
```

## Despliegue

El proyecto está configurado para exportación estática en `next.config.ts`:

```ts
output: "export";
```

Después de `pnpm build`, Next genera los archivos estáticos que pueden subirse a GitHub Pages u otro hosting estático.
