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
- Site-wide config and `/dashboard` publishing config live in `lib/site-config.ts`.
- The repo-native static dashboard lives at `app/dashboard/page.tsx` and is served at `/dashboard`.
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

Non-technical authors can use `/dashboard`. It validates a locally stored GitHub token before rendering the editor, generates frontmatter, writes posts to `posts/<slug>/page.mdx`, uploads media under each post's `images/` folder, and commits via GitHub's Contents API using the author's fine-grained PAT stored only in their browser. Repository owner/name/branch and token-template values come from `siteConfig.writer`.

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

The `/dashboard` route and header auth status are client-only static tools. Do not add server-only publishing code unless the deployment model changes.

## Known Gotchas

- The home page assumes at least one post exists.
- `app/globals.css` appears to have a typo: `var(----font-noto-sans)` should likely be `var(--font-noto-sans)`.
- `next lint` is deprecated.
- `pnpm start` is not the right production path for static export; serve the generated `out/` directory instead.
- `/dashboard` authors need repository access and a fine-grained GitHub PAT with `Contents: write`. GitHub token URLs can prefill resource owner and permissions, but not the specific selected repository via documented query params; authors must select `cyberpunga.github.io` in GitHub's Repository access UI. Outside collaborators on organization repos may need different GitHub access setup if fine-grained PAT limitations apply.
