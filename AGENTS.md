# AGENTS.md

## Project Overview

This is `cyberpunga`, a static editorial site built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, and MDX.

The site exports static HTML via `output: "export"` and is deployed to GitHub Pages from `out/`.

## Key Architecture

- App routes live in `app/`.
- Content collections live in `content/<collection>/`.
- Each collection has a `content/<collection>/_type.json` definition with labels, route, sort, and dashboard field schema.
- Posts live in `content/posts/<slug>/page.mdx` but keep public URLs at `/posts/<slug>`.
- Tumblr-style starter collections live in `content/texts`, `content/photos`, `content/photosets`, `content/quotes`, `content/links`, `content/chats`, `content/audios`, `content/videos`, and `content/answers`.
- Content metadata is loaded from MDX frontmatter.
- `lib/content.ts` scans collection directories, imports MDX modules, reads `frontmatter`, and supports generic static collection routes.
- `lib/posts.ts` wraps `lib/content.ts` for the custom posts UI and sorts posts newest-first via the posts collection definition.
- `app/[collection]/page.tsx` and `app/[collection]/[slug]/page.tsx` statically generate collection list/detail pages with `generateStaticParams`; they special-case `posts` to preserve the custom article UX.
- `app/posts/posts-list.tsx` is a client component for query-string tag filtering.
- `components/site-header.tsx` generates its menu from public collection definitions via `getGenericCollections()`.
- `lib/default-collections.ts` bundles repo-native `_type.json` definitions for client-side dashboard bootstrapping.
- Shared UI lives in `components/`.
- shadcn-style primitives live in `components/ui/`.
- Site-wide config and `/dashboard` publishing config live in `lib/site-config.ts`.
- The repo-native static dashboard lives at `app/dashboard/page.tsx` and is served at `/dashboard`.
- `DESIGN.md` documents the dark cyberpunga visual system: black canvas, hairline borders, Noto Sans/Noto Sans Mono, sparse chrome, editorial media, and dashboard usability constraints.
- Repo-local Codex skills live in `.agents/skills/`.

## Local Skills

- `.agents/skills/project-doc-maintainer/` helps decide whether `AGENTS.md` or `README.md` need updates after tasks that change setup, architecture, workflows, deployment, verification, or important gotchas.

## Content Rules

Each post must be in:

```text
content/posts/<slug>/page.mdx
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
content/posts/<slug>/images/image.jpeg
```

Reference them from MDX with relative paths.

New content collections must have:

```text
content/<collection>/_type.json
content/<collection>/<slug>/page.mdx
```

Starter collections can be empty and contain only `_type.json` until an author publishes the first entry.

`_type.json` supports v1 light custom fields: `text`, `textarea`, `date`, `boolean`, `select`, `list`, and `tags`. Every publishable entry has implicit `title`, `description`, and MDX body fields.

Non-technical authors can use `/dashboard`. It starts with bundled repo-native collection definitions, validates a locally stored GitHub token before rendering the editor, ensures `content/users/<github-login>/page.mdx` exists for the signed-in user without overwriting an existing entry, loads collection definitions and entries from GitHub, merges remote definitions over bundled defaults, generates frontmatter, creates and edits `content/<collection>/<slug>/page.mdx`, uploads media under each entry's `images/` folder, creates new collection `_type.json` files, and commits via GitHub's Contents API using the author's fine-grained PAT stored only in their browser. After writes, it polls the GitHub Actions workflow run for the saved commit so authors can see when the static deploy has finished. Existing entries are edited in place with their current GitHub file SHA; static-export-safe dashboard deep links use hash client routes like `/dashboard#/<collection>/<slug>`. Repository owner/name/branch, deployment workflow name, and token-template values come from `siteConfig.writer`.

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

Dashboard-created collection routes become public after the next static build/deploy. Do not introduce runtime route creation.

## Known Gotchas

- The home page assumes at least one post exists.
- `next lint` is deprecated.
- `pnpm start` is not the right production path for static export; serve the generated `out/` directory instead.
- The public route segments `posts`, `dashboard`, and `about` are reserved for content collections.
- `/dashboard` authors need repository access and a fine-grained GitHub PAT with `Contents: write` and `Actions: read`. GitHub token URLs can prefill resource owner and permissions, but not the specific selected repository via documented query params; authors must select `cyberpunga.github.io` in GitHub's Repository access UI. Outside collaborators on organization repos may need different GitHub access setup if fine-grained PAT limitations apply.
