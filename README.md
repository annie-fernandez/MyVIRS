# my-virs-turbo

A [Turborepo](https://turborepo.dev/) monorepo. No apps yet — this is the bare scaffolding.

## What's inside?

### Apps

Nothing yet. Add apps under `apps/*`.

### Packages

- `@repo/eslint-config`: shared `eslint` configurations
- `@repo/typescript-config`: shared `tsconfig.json`s

Each package is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Commands

```sh
pnpm build         # turbo run build
pnpm dev           # turbo run dev
pnpm lint          # turbo run lint
pnpm check-types   # turbo run check-types
pnpm format        # prettier --write
```
