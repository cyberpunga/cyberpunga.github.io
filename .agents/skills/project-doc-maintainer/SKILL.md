---
name: project-doc-maintainer
description: Use after tasks that materially change this repository to decide whether AGENTS.md or README.md need updates, especially for setup commands, dependencies, architecture, content workflows, deployment, verification, repo layout, or known gotchas.
---

# Project Doc Maintainer

Use this skill near the end of a relevant task, after implementation and verification context is clear.

## Goal

Keep `AGENTS.md` and `README.md` aligned with the repository without creating documentation churn.

## When To Update Docs

Update docs when a task changes any of these:

- required commands, scripts, package manager usage, dependencies, or environment setup
- architecture, routing, data flow, content conventions, or important file locations
- build, static export, deployment, hosting, or verification workflow
- project gotchas, constraints, or assumptions future agents should know
- user-facing contribution or authoring workflows

Usually skip doc edits for:

- typo-only fixes, small visual polish, or local refactors that do not change how the project works
- generated files, lockfile-only changes, or build artifacts
- behavior that is already accurately documented
- details useful only for one transient debugging session

## Audience Split

- `AGENTS.md`: instructions for AI coding agents. Include operational constraints, project architecture, gotchas, and preferred verification commands. Be direct and compact.
- `README.md`: contributor/user-facing project documentation. Keep the existing language and tone; this repository's README is Spanish. Include setup, development, structure, publishing, verification, and deployment information that humans need.

## Workflow

1. Review the actual changes, preferably with `git diff --name-only` and focused diffs for changed files.
2. Decide separately whether `AGENTS.md`, `README.md`, both, or neither should change.
3. Make the smallest accurate edits. Prefer updating existing sections over adding new ones.
4. Keep Markdown concise. Do not add a changelog, long rationale, or duplicate details across files unless both audiences need them.
5. If docs change, include them in the final change summary and mention whether verification commands were run.

## Repo-Specific Notes

- This site uses Next.js static export via `output: "export"` and deploys the generated `out/` directory.
- Use `pnpm` commands in docs.
- Posts live at `content/posts/<slug>/page.mdx` with required frontmatter and colocated images.
- Avoid documenting runtime Next server features unless the deployment model changes.
