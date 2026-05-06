## Overview

cyberpunga is a static Spanish-language editorial site with a built-in publishing dashboard. Its visual system is dark, sparse, and text-forward: a black canvas, restrained white and gray typography, thin hairline dividers, colocated editorial media, and an atmospheric ASCII layer where motion is useful.

The design should feel like a working terminal, a small press, and a field notebook sharing the same room. It should not become a decorative cyberpunk poster. Chrome stays quiet so essays, images, tags, collection types, and publishing controls can carry the experience.

## Core Principles

- Use a dark-only interface. The site has no user-facing light mode.
- Prefer black surfaces, hairline borders, and measured whitespace over cards, shadows, blur, gradients, or decorative ornaments.
- Use Noto Sans for body copy and Noto Sans Mono for headings, navigation, metadata, buttons, dashboard labels, paths, slugs, and code-like values.
- Keep long article titles sentence-case for readability. Do not force editorial titles into uppercase.
- Use colocated post and collection images when available. Do not require external themed photography.
- Keep the dashboard practical. It shares the black/hairline system, but form clarity and status feedback are more important than marketing austerity.

## Colors

### Brand Palette

| Role | Value | Use |
| --- | --- | --- |
| Canvas | `#000000` | Page background and default surface |
| Ink | `#f5f5f5` | Primary headings and active controls |
| Body | `#d4d4d8` | Running copy and readable secondary text |
| Muted | `#9f9f9f` | Dates, tags, captions, helper text |
| Muted soft | `#666666` | Legal text, separators, very-secondary metadata |
| Surface | `#0a0a0a` | Popovers and subtle dashboard panels |
| Surface strong | `#141414` | Selected rows or dense tool areas |
| Hairline | `#262626` | Default 1px borders and section dividers |
| Hairline strong | `#3a3a3a` | Input borders and stronger controls |
| Link / Focus | `#c3d9f3` | Inline links, focus rings, rare active emphasis |

### Semantic Palette

- Error: red tones are allowed for failed auth, validation, or failed publishing states.
- Success: emerald tones are allowed for completed publishing/deploy states.
- Warning: amber tones are allowed only for actionable dashboard warnings.
- Semantic colors should not become brand colors on public editorial pages.

## Typography

### Families

The implementation uses the existing Next font setup:

1. Noto Sans: body copy, descriptions, prose paragraphs, lists, dashboard help text.
2. Noto Sans Mono: headings, site name, nav, buttons, tags, dates, captions, form labels, file paths, slugs, and MDX/code previews.

No new font dependency is required.

### Hierarchy

| Role | Size | Weight | Tracking | Family | Use |
| --- | --- | --- | --- | --- | --- |
| Hero/article title | 48-60px desktop, 32px mobile | 400 | 0.02em | Noto Sans Mono | Home featured article and detail page titles |
| Page title | 40-48px | 400 | 0.02em | Noto Sans Mono | Collection, about, dashboard top headings |
| Section label | 11-12px | 400 | 0.16-0.22em | Noto Sans Mono | "Articulos recientes", metadata labels |
| Card/list title | 20-24px | 400 | 0.02em | Noto Sans Mono | Article cards and collection previews |
| Body | 16px | 400 | 0 | Noto Sans | Descriptions and prose |
| Small body | 14px | 400 | 0 | Noto Sans | Dashboard helper copy, footer text |
| Button/tag | 11-12px | 400 | 0.16-0.18em | Noto Sans Mono | Controls, tags, compact commands |

Use weight and color sparingly. The system relies on size, spacing, family contrast, and border rhythm more than boldness.

## Layout

### Spacing

- Base unit: 4px.
- Common steps: 8px, 12px, 16px, 24px, 40px, 64px, 96px.
- Public editorial sections should breathe: 64-96px vertical space is typical.
- Dashboard panels can be denser: 16-24px panel padding and 24px panel gaps.

### Containers

- Public pages use the existing Tailwind `container` with `px-4`.
- Long prose stays around `max-w-3xl`.
- Collection indexes stay around `max-w-4xl`.
- Dashboard uses `max-w-7xl` with a two-column editor/sidebar layout on large screens.

### Media

- MDX images render unoptimized for static export and use square corners.
- Images keep a visible hairline border.
- Home can use the ASCII animation as an ambient background, but content must remain on a higher stacking layer.
- Do not add gradients or blurred overlays to compensate for poor contrast; choose darker image crops or explicit black spacing instead.

## Components

### Header

- Sticky at the top with a black background and bottom hairline.
- Site name appears as a small mono wordmark with wide tracking.
- Desktop collection links are mono, uppercase, muted by default, white on hover.
- Mobile content navigation uses the dropdown primitive, styled as a square black popover with hairline border.

### Footer

- Black background with a top hairline.
- Three-column desktop layout: site summary, navigation, tags.
- Footer labels use mono uppercase text. Body text stays muted and readable.

### Buttons

- Buttons are square, hairline controls.
- Primary command: transparent background, white border and text, inverted on hover.
- Secondary command: near-black fill with a quiet border.
- Ghost command: no visible border by default, subtle dark hover.
- Icon buttons are 40px square and must include an accessible label when the icon is the only visible content.

### Tags

- Tags are transparent inline labels with a hairline border.
- Text is mono, uppercase, and compact.
- Tags link to the existing `/posts?tag=` filter behavior.

### Cards And Lists

- Article cards are plain black bordered modules, not raised cards.
- No rounded corners, shadows, blur, gradients, or nested card styling.
- List items use hairline dividers and hover through color/border changes only.

### Prose

- Prose uses inverted typography on black.
- Links use the ice-blue link/focus color and underlines.
- Headings use mono with regular weight.
- Code blocks and MDX previews use black or near-black backgrounds with hairline borders.

### Dashboard

- Keep forms square and explicit: black background, zinc hairline borders, blue focus ring.
- Keep dense utility panels, but remove rounded cards, shadows, blur, and light backgrounds.
- Use semantic red/emerald panels for error and success states.
- Publishing and deploy feedback appears as a fixed layout-level panel, so GitHub Actions status remains visible after navigating away from `/dashboard`.
- Preserve all current publishing behavior: GitHub auth, collection loading, entry editing, media upload, content type creation, and deploy polling.

## Responsive Behavior

- Header navigation collapses to the existing mobile menu below the large breakpoint.
- Public article/card grids collapse to one column on mobile.
- Featured home title scales down on mobile and remains sentence-case.
- Dashboard stacks the editor and sidebar below the large breakpoint.
- Long labels, paths, slugs, and article titles must wrap or truncate without forcing horizontal page overflow.

## Accessibility

- Body copy and controls must maintain readable contrast on black.
- Interactive text and controls need visible focus states. Use the ice-blue focus ring.
- Primary buttons and text inputs should meet a 44px minimum height.
- Icon-only controls must include `sr-only` labels.
- Do not communicate dashboard status by color alone; keep the existing text messages and icons.

## Implementation Notes

- Static export is fixed. Do not add runtime-only Next.js features to support visual changes.
- Keep `next/image` set to `unoptimized` for MDX images.
- Keep all collection and dashboard data flow unchanged.
- Keep the dashboard English UI unless a separate localization pass is requested.
- The `html` element should carry the `dark` class so existing dark variants continue to resolve to the dark-only theme.

## Audit Notes

- This document replaces a prior external brand extraction and removes brand-specific names, proprietary font assumptions, themed-photo requirements, and unverifiable competitive claims.
- The current visual system is implemented directly in Tailwind classes and CSS variables rather than a separate token package.
- The ASCII animation is cyberpunga-native, but it must stay decorative and behind readable content.
