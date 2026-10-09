#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  printf 'Install Node.js 22 or newer from https://nodejs.org/ then reopen this launcher.\nPress Return to close.\n'
  read -r answer
  exit 1
fi
if ! node -e "if(Number(process.versions.node.split('.')[0])<22)process.exit(1)"; then
  printf 'Cupid needs Node.js 22 or newer. Update Node.js from https://nodejs.org/\nPress Return to close.\n'
  read -r answer
  exit 1
fi
node server.mjs --open
if [ "$?" -ne 0 ]; then
  printf 'Press Return to close.\n'
  read -r answer
fi
