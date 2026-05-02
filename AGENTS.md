# AGENTS.md

## Project Overview

This is `cyberpunga`, a static editorial site built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, MDX, and `next-themes`.

The site exports static HTML via `output: "export"` and is deployed to GitHub Pages from `out/`.

## Key Architecture

- App routes live in `app/`.
- Posts live in `posts/<slug>/page.mdx`.
- Post metadata is loaded from MDX frontmatter.
- `lib/posts.ts` scans post directories, imports MDX modules, reads `frontmatter`, and sorts posts newest-first.
- `app/posts/[slug]/page.tsx` statically generates all post pages with `generateStaticParams`.
- `app/posts/posts-list.tsx` is a client component for query-string tag filtering.
- Shared UI lives in `components/`.
- shadcn-style primitives live in `components/ui/`.
- Site-wide config lives in `lib/site-config.ts`.
- Repo-local Codex skills live in `.agents/skills/`.

## Local Skills

- `.agents/skills/project-doc-maintainer/` helps decide whether `AGENTS.md` or `README.md` need updates after tasks that change setup, architecture, workflows, deployment, verification, or important gotchas.

## Content Rules

Each post must be in:

```text
posts/<slug>/page.mdx
```

Required frontmatter:

```mdx
---
title: "Post title"
date: "2026-05-02"
description: "Short description."
tags: ["tag-one", "tag-two"]
---
```

Images should be colocated in the post folder, usually:

```text
posts/<slug>/images/image.jpeg
```

Reference them from MDX with relative paths.

## Commands

Use pnpm.

```bash
pnpm install
pnpm dev
pnpm build
pnpm run lint
pnpm exec tsc --noEmit
```

Important: run `pnpm build` before raw `pnpm exec tsc --noEmit` on a fresh checkout, because `tsconfig.json` includes `.next/types/**/*.ts`, which only exists after Next generates types.

## Verification

Before shipping changes, prefer:

```bash
pnpm run lint
pnpm build
pnpm exec tsc --noEmit
```

`pnpm run lint` currently uses deprecated `next lint`; it passes, but should eventually migrate to ESLint CLI before Next 16.

## Static Export Notes

This project uses `output: "export"` in `next.config.ts`.

Do not introduce features that require a runtime Next server unless the deployment model changes. Be careful with:

- dynamic server routes
- runtime-only APIs
- image optimization requiring a Next server
- non-static dynamic params

MDX images are rendered through `next/image` with `unoptimized`.

## Known Gotchas

- The home page assumes at least one post exists.
- `app/globals.css` appears to have a typo: `var(----font-noto-sans)` should likely be `var(--font-noto-sans)`.
- `next lint` is deprecated.
- `pnpm start` is not the right production path for static export; serve the generated `out/` directory instead.
