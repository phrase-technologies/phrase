# =============================================================================
# Production Build/Serve Script
# =============================================================================
# This script is used to serve the API. There is no
# separate build script, just this one.

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

# CLIENT_URL is required
if [ -z ${CLIENT_URL+x} ]; then
  printf "$RED"
  echo "CLIENT_URL must be defined. Try this format: CLIENT_URL=phrase.fm npm run start-prod"
else
  printf "$YELLOW"
  echo "⌛ Launching with CLIENT_URL = $CLIENT_URL and PORT = $FINAL_PORT"
  printf "$RESET"
  FORCE_COLOR=1 NODE_ENV=production PORT=$FINAL_PORT node server.forever.js
fi
