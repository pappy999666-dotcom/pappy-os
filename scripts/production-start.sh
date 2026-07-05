#!/usr/bin/env bash
set -euo pipefail
npm ci
npm run build
mkdir -p "${PAPPY_DATA_DIR:-/var/lib/pappy-os}"
npm run start
