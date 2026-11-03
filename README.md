# my-virs-turbo

A [Turborepo](https://turborepo.dev/) monorepo managed with pnpm.

## Apps

| Package | Path        | Stack                                   | Dev URL               |
| ------- | ----------- | --------------------------------------- | --------------------- |
| `api`   | `apps/api`  | Spring Boot 1.5 (Java 8, Maven wrapper) | http://localhost:8080 |
| `virs`  | `apps/virs` | Next.js 16 full stack (replaces `api` + the old Angular UI) | http://localhost:3000 |

## Packages

| Package                   | Path                        | Purpose                                                              |
| ------------------------- | --------------------------- | -------------------------------------------------------------------- |
| `@repo/core`              | `packages/core`             | Framework-free domain logic: text analyzer, categories, zod schemas  |
| `@repo/db`                | `packages/db`               | Drizzle ORM schema, Neon client, queries, migrations, seed/import    |
| `@repo/eslint-config`     | `packages/eslint-config`    | Shared ESLint configs                                                |
| `@repo/typescript-config` | `packages/typescript-config` | Shared tsconfigs                                                    |

See [`apps/virs/README.md`](apps/virs/README.md) for setting up the new app.

## Prerequisites

- Node >= 24 and pnpm 11 (for the workspace and turbo)
- `curl` (macOS)

The legacy Spring app pins its own runtime, so your global Java is left alone:

- **`api` runs on JDK 8.** On first run, `apps/api/scripts/with-jdk8.sh` downloads Amazon Corretto 8 into `~/.jdks`. If you already manage a JDK 8, set `JAVA8_HOME` to use it instead. Maven is downloaded by `./mvnw`, so no global install is needed.

## Setup

```sh
pnpm install
cp apps/api/.env.example apps/api/.env   # then fill in the values
```

`apps/api/.env` (gitignored) holds the API's secrets:

| Variable                                        | Purpose                                                      |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                                  | JDBC URL, e.g. `jdbc:postgresql://<neon-host>/<db>?sslmode=require` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD`       | Neon credentials                                             |
| `APP_ENCRYPTION_PASSWORD`                       | Jasypt key for `ENC(...)` values (any value works for dev)   |
| `MAIL_USERNAME` / `MAIL_PASSWORD`               | Gmail SMTP                                                   |
| `SECURITY_USER_NAME` / `SECURITY_USER_PASSWORD` | Basic auth (defaults to `admin`/`admin`)                     |

In the `dev` profile, Hibernate creates and updates the schema itself (`ddl-auto: update`). The SQL files in `apps/api/src/main/resources` are MySQL dialect and don't run on startup.

## Commands

```sh
pnpm dev                          # run every app
pnpm turbo run dev --filter=virs  # run one app
pnpm turbo run dev --filter=api
pnpm build                        # turbo run build (api -> target/*.jar, virs -> .next/)
pnpm lint
pnpm check-types
pnpm format
```

The pull-request CI workflow and instructions for requiring it before merging
to `main` are documented in [`.github/CI.md`](.github/CI.md).

## Generated files that aren't committed

- `apps/api/src/main/resources/static/`: the old Angular bundle that gets baked into the API jar for production. The live site is `apps/virs`, not this jar.
