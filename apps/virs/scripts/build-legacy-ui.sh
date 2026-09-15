#!/usr/bin/env bash
# Builds the original Angular UI (apps/web) and copies it into apps/virs/public, where the
# Next.js app serves it. Vercel cannot build Angular CLI 1.7 (it needs Node 8), so run this
# locally after changing apps/web and commit the output.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
public_dir="$repo_root/apps/virs/public"

pnpm --dir "$repo_root" --filter web build

rm -rf "$public_dir"
mkdir -p "$public_dir"
cp -R "$repo_root/apps/web/dist/." "$public_dir/"
echo "Copied the legacy UI into apps/virs/public"
