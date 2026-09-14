# my-virs-turbo

A [Turborepo](https://turborepo.dev/) monorepo managed with pnpm.

## Apps

| Package | Path        | Stack                                   | Dev URL               |
| ------- | ----------- | --------------------------------------- | --------------------- |
| `api`   | `apps/api`  | Spring Boot 1.5 (Java 8, Maven wrapper) | http://localhost:8080 |
| `web`   | `apps/web`  | Angular 4 (Angular CLI 1.7, webpack 3)  | http://localhost:4200 |
| `virs`  | `apps/virs` | Next.js                                 | http://localhost:3000 |

`web` proxies API calls to `localhost:8080` (`apps/web/proxy.conf.json`).

## Prerequisites

- Node >= 24 and pnpm 11 (for the workspace and turbo)
- [nvm](https://github.com/nvm-sh/nvm) at `~/.nvm`
- `curl` (macOS)

The legacy apps pin their own runtimes, so your global Node and Java are left alone:

- **`api` runs on JDK 8.** On first run, `apps/api/scripts/with-jdk8.sh` downloads Amazon Corretto 8 into `~/.jdks`. If you already manage a JDK 8, set `JAVA8_HOME` to use it instead. Maven is downloaded by `./mvnw`, so no global install is needed.
- **`web` runs on Node 8.** `apps/web/scripts/with-node8.sh` runs `nvm install 8` on first use. Angular CLI 1.7's dev server calls Node internals that were removed in Node 12.

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
pnpm turbo run dev --filter=web   # run one app
pnpm turbo run dev --filter=api
pnpm build                        # turbo run build (api -> target/*.jar, web -> dist/)
pnpm lint
pnpm check-types
pnpm format
```

## Generated files that aren't committed

- `apps/api/src/main/resources/static/`: the Angular bundle that gets baked into the API jar for production. To rebuild it, run `web`'s build and copy `apps/web/dist/` here.
- `apps/web/documentation/`: Compodoc output. Regenerate with `npx compodoc -p src/tsconfig.app.json`.
