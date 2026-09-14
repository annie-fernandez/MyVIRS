#!/usr/bin/env bash
# Ensures a JDK 8 is available (this app is Spring Boot 1.5.x, which does not
# run reliably on modern JDKs), then execs "$@" with JAVA_HOME pointed at it.
#
# Override JAVA8_HOME yourself (e.g. sdkman/jenv-managed JDK 8) to skip the
# auto-download below.
set -euo pipefail

if [ -n "${JAVA8_HOME:-}" ]; then
  export JAVA_HOME="$JAVA8_HOME"
  exec env "PATH=$JAVA_HOME/bin:$PATH" "$@"
fi

JDK_DIR="$HOME/.jdks/amazon-corretto-8.jdk"

if [ ! -x "$JDK_DIR/Contents/Home/bin/java" ]; then
  echo "JDK 8 not found at $JDK_DIR - downloading Amazon Corretto 8 (one-time setup)..." >&2

  os="$(uname -s)"
  arch="$(uname -m)"
  case "$os-$arch" in
    Darwin-arm64) url="https://corretto.aws/downloads/latest/amazon-corretto-8-aarch64-macos-jdk.tar.gz" ;;
    Darwin-x86_64) url="https://corretto.aws/downloads/latest/amazon-corretto-8-x64-macos-jdk.tar.gz" ;;
    *)
      echo "No automatic JDK 8 download configured for $os-$arch." >&2
      echo "Install a JDK 8 yourself and set JAVA8_HOME to its home directory." >&2
      exit 1
      ;;
  esac

  mkdir -p "$HOME/.jdks"
  tmp_tar="$(mktemp -t corretto8-XXXXXX).tar.gz"
  curl -fL -o "$tmp_tar" "$url"
  tar -xzf "$tmp_tar" -C "$HOME/.jdks"
  rm -f "$tmp_tar"
fi

export JAVA_HOME="$JDK_DIR/Contents/Home"
exec env "PATH=$JAVA_HOME/bin:$PATH" "$@"
