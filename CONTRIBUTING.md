# Contributing to MotoTribe

Thanks for your interest in contributing to MotoTribe. Whether you are fixing a typo, reporting a bug, or building a whole new feature, your help makes this project better for every rider out there.

## Getting Set Up

1. **Fork** this repository and clone your fork locally.
2. Follow the setup steps in the [README](README.md) to get the app running.
3. Create a new branch from `main` for your work:

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

This is a pnpm monorepo managed by Turborepo. The key commands:

```bash
pnpm dev           # Start everything (frontend + API)
pnpm lint          # Lint all workspaces
pnpm build         # Production build
pnpm test:e2e      # Run API end-to-end tests
pnpm format        # Format code with Prettier
```

### Working on the Frontend (apps/web)

- Pages live in `apps/web/app/` using the Next.js App Router.
- Shared components go in `apps/web/components/`.
- Feature-specific components go in `apps/web/features/`.
- The API client is in `apps/web/lib/api/client.ts`.
- Cart state uses Zustand (`apps/web/lib/cart-store.ts`).

### Working on the Backend (apps/api)

- Each feature is a self-contained NestJS module under `apps/api/src/`.
- Follow the existing pattern: `feature.module.ts`, `feature.controller.ts`, `feature.service.ts`, `feature.dto.ts`.
- Use DTOs with `class-validator` decorators for input validation.
- Business logic goes in the service, not the controller.

### Working on the Database (packages/database)

- The Prisma schema is at `packages/database/prisma/schema.prisma`.
- After changing the schema, run `pnpm db:generate` to regenerate the client.
- For local development, use `pnpm db:push` to sync changes without creating migration files.
- For production-ready changes, use `pnpm db:migrate` to create proper migration files.

## Pull Request Guidelines

- **One thing per PR.** A single feature, a single bug fix, or a single refactor. Mixed PRs are hard to review.
- **Write a clear description.** Explain what you changed and why. If it is a UI change, include a screenshot.
- **Test your changes.** Make sure `pnpm build` passes. If you are touching the API, run `pnpm test:e2e`.
- **Follow the existing style.** We use Prettier for formatting. Run `pnpm format` before committing.
- **Keep commits clean.** Use descriptive commit messages. Squash messy WIP commits before opening the PR.

## Reporting Bugs

Open an issue with:
- What you expected to happen.
- What actually happened.
- Steps to reproduce.
- Your environment (OS, Node version, browser).

## Feature Requests

Open an issue describing:
- The problem you are trying to solve.
- Your proposed solution (if you have one).
- Any alternatives you have considered.

We will discuss it before you start coding to make sure it fits the project direction.

## Code of Conduct

Be kind. Be respectful. We are all here because we love motorcycles and building software. Keep it that way.
