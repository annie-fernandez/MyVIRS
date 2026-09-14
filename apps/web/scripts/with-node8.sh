#!/usr/bin/env bash
# This app's webpack-dev-server (bundled by @angular/cli 1.7) calls a Node
# internal API (process.binding('http_parser')) that was removed in Node 12+.
# None of this app's dependencies have native (.node) addons, so it's safe to
# just run it under an old Node via nvm without reinstalling node_modules.
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "nvm not found at $NVM_DIR. Install nvm, then run: nvm install 8" >&2
  exit 1
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

if ! nvm ls 8 >/dev/null 2>&1; then
  echo "Node 8 not installed - installing via nvm (one-time setup)..." >&2
  nvm install 8
fi

nvm use 8 >/dev/null
exec "$@"
