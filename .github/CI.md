# Continuous integration

The `CI` workflow runs on every pull request, pushes to `main`, merge queue
groups, and manual dispatch. It checks the current Next.js app (`virs`) and
its workspace dependencies. The legacy Angular and Java apps are outside this
initial scope.

Four independent jobs run type checks, lint, tests, and the production build
using Node 24 and the pnpm version in `package.json`. Dependencies come from the
committed lockfile. Tests include the ten analyzer passage regressions. No
production secrets or live database are required.

Run the same checks locally from the repository root:

```sh
pnpm exec turbo run check-types --filter=virs...
pnpm exec turbo run lint --filter=virs...
pnpm exec turbo run test --filter=virs...
pnpm exec turbo run build --filter=virs...
```

Use `pnpm.cmd` on Windows if PowerShell blocks `pnpm.ps1`. The production build
needs internet access to fetch the Google Font used by the app.

## Require CI before merging to main

The workflow supplies a stable `CI passed` check that fails if any of the four
jobs fails, is cancelled, or is skipped. Keep that job name stable when extending
the workflow. There are no path filters that could skip checks for a PR.

A workflow file alone does not enforce merge protection. After pushing this
workflow and allowing its first PR run to finish, a repository administrator
must configure GitHub:

1. Open **Settings → Rules → Rulesets** and create or update a branch ruleset
   targeting `main`.
2. Set enforcement to **Active** and enable **Require a pull request before
   merging**.
3. Enable **Require status checks to pass** and add **CI passed**, selecting
   GitHub Actions as the expected source.
4. Enable **Require branches to be up to date before merging** so checks cover
   the latest `main`, and leave the bypass list empty to apply the rule to everyone.
5. Save and verify that a PR with a failed check cannot merge.

For repositories using classic branch protection, configure the equivalent
requirements under **Settings → Branches**, including **Do not allow bypassing
the above settings**.

These repository settings have not been applied by the local workflow change.
See [GitHub's required status check documentation](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).

## Existing lint behavior

This foundation uses the existing lint scripts unchanged. The shared ESLint
configuration currently downgrades rule violations to warnings. These warnings
do not fail CI. Tightening the lint configuration is a follow-up task; CI does
not yet guarantee warning-free source code.
