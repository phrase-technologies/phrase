# =============================================================================
# Serve Script
# =============================================================================
# This script is used to serve the build.
# You must create the build first with run-build.sh

# =============================================================================
# Color Codes
# =============================================================================
RED="\033[31m"
YELLOW="\033[33m"
GREEN="\033[32m"
RESET="\033[0m"

# =============================================================================
# Script
# =============================================================================
# PORT is not required, defaults to 80
if [ -z ${PORT+x} ]; then
  FINAL_PORT=80
else
  FINAL_PORT=$PORT
fi

# API_URL is required
if [ -z ${API_URL+x} ]; then
  printf "$RED"
  echo "API_URL must be defined. Try this format: API_URL=http://123.456.78.90:1234 npm run serve. Remember the http prefix!"
else
  API_URL="\"$API_URL\"" # Need to wrap in quotes for it to work down the line
  printf "$YELLOW"
  echo "⌛ Launching with API_URL = $API_URL"
  printf "$RESET"
  NODE_ENV=production PORT=$FINAL_PORT node server.forever.js
  printf "$GREEN"
  echo "✅ Serving in the background!"
  echo "..."
  echo ".."
  echo "."
fi
