#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="${PAPPY_BOTS_DIR:-/opt/pappy}"
PFP_REPO="${PFP_BOT_REPO:-https://github.com/pappy999666-dotcom/pappy-pfp.git}"
WHATSAPP_REPO="${WHATSAPP_BOT_REPO:-https://github.com/pappy999666-dotcom/verbose-fishstick.git}"
PFP_DIR="${PFP_BOT_PATH:-$BASE_DIR/pappy-pfp}"
WHATSAPP_ROOT="${WHATSAPP_BOT_ROOT:-$BASE_DIR/verbose-fishstick}"
WHATSAPP_DIR="${WHATSAPP_BOT_PATH:-$WHATSAPP_ROOT/artifacts/api-server}"

git_clone_or_update() {
  local repo="$1"
  local dir="$2"
  if [ -d "$dir/.git" ]; then
    git -C "$dir" fetch --depth 1 origin main
    git -C "$dir" reset --hard origin/main
  else
    mkdir -p "$(dirname "$dir")"
    git clone --depth 1 "$repo" "$dir"
  fi
}

echo "Installing PFP bot from $PFP_REPO -> $PFP_DIR"
git_clone_or_update "$PFP_REPO" "$PFP_DIR"
(cd "$PFP_DIR" && npm ci)

echo "Installing WhatsApp function bot from $WHATSAPP_REPO -> $WHATSAPP_ROOT"
git_clone_or_update "$WHATSAPP_REPO" "$WHATSAPP_ROOT"
(cd "$WHATSAPP_DIR" && npm ci)

cat <<SUMMARY
Bot repos installed:
- PFP bot: $PFP_DIR (expected internal port: ${PFP_BOT_PORT:-4101})
- WhatsApp bot: $WHATSAPP_DIR (expected internal port: ${WHATSAPP_BOT_PORT:-4102})

Next: set .env tokens and run pm2 start deploy/ecosystem.config.cjs
SUMMARY
